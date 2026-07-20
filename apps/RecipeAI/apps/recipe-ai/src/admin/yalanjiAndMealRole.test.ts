import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AppLocale } from "../i18n/types";
import { getDishById, listAllDishes } from "../data/catalog/dishes";
import {
  generateDraftContent,
  metadataPatchFromGeneratedRecipe,
} from "./recipeAiGeneration";
import { canGenerateDish, getActiveRecipeProvider } from "./recipeGenerationProviders";
import { findGeneratedRecipe } from "./generatedRecipeLibrary";
import { auditRecipeContent, recipeHasQaWarnings } from "./recipeQaAudit";
import {
  draftRecordToDish,
  listConsumerCatalogIds,
  listStudioRecipeViews,
} from "./recipeStudioMerge";
import {
  createDraftFromCreationInput,
  emptyStudioMetadata,
} from "./recipeStudioTypes";
import { savePhotoReviewToStore, defaultPhotoReviewStatus } from "./recipePhotoReview";
import {
  auditMealRole,
  deriveMealRoleFromDish,
  mealRoleShortLabel,
  resolveMealRole,
} from "./mealRole";

const LOCALES: AppLocale[] = ["en", "de", "ar", "tr"];

function makeYalanjiDraft() {
  // Uses the existing "Untitled draft" in place — no duplicate created.
  const draft = createDraftFromCreationInput("draft-existing-1", {
    dishName: "Yalanji",
    cuisineFamilyId: "arab",
    regionSubcuisine: "Syrian (Levantine)",
  });
  const result = generateDraftContent({
    dishName: draft.title,
    cuisineFamilyId: draft.cuisineFamilyId,
    regionSubcuisine: "Syrian (Levantine)",
    metadata: emptyStudioMetadata(),
  });
  assert.equal(result.status, "generated");
  if (result.status !== "generated") throw new Error("generation failed");
  return { draft: { ...draft, ...result.draftPatch }, result };
}

describe("Meal role model", () => {
  it("expresses exactly three practical states via short labels", () => {
    assert.equal(mealRoleShortLabel({ defaultRole: "main", canServeAsMain: false }), "Main");
    assert.equal(mealRoleShortLabel({ defaultRole: "side", canServeAsMain: false }), "Side");
    assert.equal(
      mealRoleShortLabel({ defaultRole: "side", canServeAsMain: true }),
      "Side · Can be main",
    );
  });

  it("provides short Arabic labels", () => {
    assert.equal(
      mealRoleShortLabel({ defaultRole: "main", canServeAsMain: false }, "ar"),
      "طبق رئيسي",
    );
    assert.equal(
      mealRoleShortLabel({ defaultRole: "side", canServeAsMain: false }, "ar"),
      "طبق جانبي",
    );
    assert.equal(
      mealRoleShortLabel({ defaultRole: "side", canServeAsMain: true }, "ar"),
      "طبق جانبي · يمكن أن يكون رئيسيًا",
    );
  });

  it("normalizes the redundant main + canServeAsMain combination", () => {
    const dish = listAllDishes()[0]!;
    const resolved = resolveMealRole({
      explicit: { defaultRole: "main", canServeAsMain: true },
      dish,
    });
    assert.equal(resolved.defaultRole, "main");
    assert.equal(resolved.canServeAsMain, false);
  });

  it("falls back safely for legacy canonical recipes without explicit fields", () => {
    const mainDish = listAllDishes().find((d) => d.mealSlotRole === "dinner_complete");
    const sideDish = listAllDishes().find((d) => d.mealSlotRole !== "dinner_complete");
    assert.ok(mainDish && sideDish);
    const mainRole = resolveMealRole({ dish: mainDish! });
    const sideRole = resolveMealRole({ dish: sideDish! });
    assert.equal(mainRole.defaultRole, "main");
    // Derivation matches the pure helper and never crashes on legacy data.
    assert.deepEqual(deriveMealRoleFromDish(mainDish!), mainRole);
    assert.equal(sideRole.canServeAsMain, false);
  });

  it("explicit fields win over derived fallback", () => {
    const mainDish = listAllDishes().find((d) => d.mealSlotRole === "dinner_complete")!;
    const resolved = resolveMealRole({
      explicit: { defaultRole: "side", canServeAsMain: true },
      dish: mainDish,
    });
    assert.equal(resolved.defaultRole, "side");
    assert.equal(resolved.canServeAsMain, true);
  });

  it("warns on redundant role and on a draft missing an explicit role", () => {
    const redundant = auditMealRole(
      { defaultRole: "main", canServeAsMain: true },
      { isDraft: true },
    );
    assert.ok(redundant.some((w) => w.code === "meal_role_redundant_can_serve_as_main"));

    const missing = auditMealRole(undefined, { isDraft: true });
    assert.ok(missing.some((w) => w.code === "meal_role_missing_on_draft"));

    // A canonical (non-draft) recipe without explicit role does not warn.
    const canonical = auditMealRole(undefined, { isDraft: false });
    assert.deepEqual(canonical, []);

    // A well-formed side + can-be-main draft produces no role warnings.
    const clean = auditMealRole(
      { defaultRole: "side", canServeAsMain: true },
      { isDraft: true },
    );
    assert.deepEqual(clean, []);
  });
});

describe("Yalanji draft — authentic Syrian yalanji", () => {
  it("is provider-supported including the Arabic alias", () => {
    assert.equal(canGenerateDish("Yalanji"), true);
    assert.equal(canGenerateDish("يالنجي"), true);
    assert.equal(getActiveRecipeProvider("Yalanji")?.id, "local-authored");
    assert.ok(findGeneratedRecipe("yalanji"));
  });

  it("populates the existing draft in place without renaming the dish", () => {
    const { draft } = makeYalanjiDraft();
    // Kept as "Yalanji", not "Syrian Yalanji".
    assert.equal(draft.title, "Yalanji");
    assert.equal(draft.regionSubcuisine, "Syrian (Levantine)");
    assert.equal(draft.cuisineFamilyId, "arab");
  });

  it("carries the meal role: side + can serve as main", () => {
    const { draft } = makeYalanjiDraft();
    assert.equal(draft.defaultRole, "side");
    assert.equal(draft.canServeAsMain, true);
    assert.equal(
      mealRoleShortLabel({
        defaultRole: draft.defaultRole!,
        canServeAsMain: draft.canServeAsMain!,
      }),
      "Side · Can be main",
    );
  });

  it("is meatless, rice-based and features pomegranate molasses", () => {
    const { draft } = makeYalanjiDraft();
    const ids = draft.ingredients.map((i) => i.id);
    assert.ok(ids.includes("grape-leaves"));
    assert.ok(ids.includes("rice"));
    assert.ok(ids.includes("pomegranate-molasses"));
    // No meat anywhere.
    const allText = LOCALES.map((l) => draft.localeCopy[l].steps.join(" ")).join(" ") +
      draft.ingredients.map((i) => `${i.en} ${i.de} ${i.ar} ${i.tr}`).join(" ");
    assert.ok(!/\b(lamb|beef|minced meat|meat|hackfleisch)\b/i.test(allText));
    assert.ok(draft.ingredientTokens.includes("pomegranate molasses"));
  });

  it("has consistent content across all four locales", () => {
    const { draft } = makeYalanjiDraft();
    for (const locale of LOCALES) {
      const copy = draft.localeCopy[locale];
      assert.ok(copy.reason.length > 10, `${locale} reason`);
      assert.equal(copy.steps.length, 7, `${locale} step count`);
      assert.ok(copy.storageTip.length > 5, `${locale} storage`);
    }
    // Pomegranate molasses is mentioned in every locale's steps.
    const pom: Record<AppLocale, string> = {
      en: "pomegranate",
      de: "granatapfel",
      ar: "دبس الرمان",
      tr: "nar ekşisi",
    };
    for (const locale of LOCALES) {
      const text = draft.localeCopy[locale].steps.join(" ").toLowerCase();
      assert.ok(text.includes(pom[locale].toLowerCase()), `${locale} mentions pomegranate molasses`);
    }
  });

  it("uses a natural yield with rolls and a coherent scaling note", () => {
    const { draft } = makeYalanjiDraft();
    assert.equal(draft.naturalYield?.baseServingsMin, 4);
    assert.equal(draft.naturalYield?.baseServingsMax, 6);
    assert.ok(draft.naturalYield?.servingLabel?.toLowerCase().includes("rolls"));
    const note = draft.naturalYield?.scalingNote?.toLowerCase() ?? "";
    assert.ok(note.includes("pomegranate"));
    assert.ok(note.includes("do not simply multiply"));
  });

  it("declares dietary/intent tags honestly", () => {
    const { draft } = makeYalanjiDraft();
    assert.ok(draft.dietaryTags.includes("vegetarian_ok"));
    assert.ok(draft.dietaryTags.includes("vegan_ok"));
    assert.deepEqual(draft.allergens, []);
    assert.equal(draft.allergenDeclared, true);
    assert.ok(draft.mealIntents.includes("healthy"));
    assert.ok(draft.mealIntents.includes("budget"));
  });

  it("passes the QA audit with zero blocking warnings", () => {
    const { draft } = makeYalanjiDraft();
    const dish = draftRecordToDish(draft);
    const blocking = auditRecipeContent(dish).filter((w) => w.severity === "warn");
    assert.deepEqual(blocking, [], `unexpected warnings: ${JSON.stringify(blocking)}`);
    assert.equal(recipeHasQaWarnings(dish), false);
  });

  it("references a prepared hero image with sensible focal metadata", () => {
    const { draft } = makeYalanjiDraft();
    assert.equal(draft.imageUrl, "/assets/dishes/arab/yalanji.jpg");
    const meta = metadataPatchFromGeneratedRecipe(
      findGeneratedRecipe("Yalanji")!,
      emptyStudioMetadata(),
      "{}",
    );
    assert.equal(meta.focalPointX, 50);
    assert.equal(meta.focalPointY, 52);
    assert.ok(meta.culturalAuthenticityNotes?.toLowerCase().includes("yalanji"));
  });

  it("keeps Recipe QA = Draft and Photo QA = Pending", () => {
    const { draft } = makeYalanjiDraft();
    const photo = savePhotoReviewToStore({}, draft.id, defaultPhotoReviewStatus());
    const views = listStudioRecipeViews({}, { [draft.id]: draft }, {}, photo);
    const view = views.find((v) => v.id === draft.id);
    assert.equal(view?.recipeQaStatus, "draft");
    assert.equal(view?.photoQaStatus, "pending");
  });

  it("never leaks into the consumer catalog", () => {
    const { draft } = makeYalanjiDraft();
    assert.equal(getDishById("draft-existing-1"), undefined);
    assert.equal(getDishById("yalanji"), undefined);
    assert.ok(!listConsumerCatalogIds().includes(draft.id));
    assert.equal(listAllDishes().length, 43);
  });
});
