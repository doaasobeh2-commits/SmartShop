import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AppLocale } from "../i18n/types";
import { getDishById, listAllDishes } from "../data/catalog/dishes";
import {
  generateDraftContent,
  metadataPatchFromGeneratedRecipe,
} from "./recipeAiGeneration";
import {
  canGenerateDish,
  getActiveRecipeProvider,
  interpretRevisionInstruction,
  isImageGenerationConfigured,
  isRecipeGenerationConfigured,
  listRecipeGenerationProviders,
} from "./recipeGenerationProviders";
import { findGeneratedRecipe, normalizeDishName } from "./generatedRecipeLibrary";
import { auditRecipeContent, recipeHasQaWarnings } from "./recipeQaAudit";
import { draftRecordToDish, listConsumerCatalogIds } from "./recipeStudioMerge";
import { createDraftFromCreationInput } from "./recipeStudioTypes";
import { emptyStudioMetadata } from "./recipeStudioTypes";

const LOCALES: AppLocale[] = ["en", "de", "ar", "tr"];

function makeBabaGhanoujDraft() {
  // Simulates renaming the existing "Untitled draft" to Baba Ghanouj.
  const draft = createDraftFromCreationInput("draft-existing-1", {
    dishName: "Baba Ghanouj",
    cuisineFamilyId: "arab",
    regionSubcuisine: "Levantine",
  });
  const result = generateDraftContent({
    dishName: draft.title,
    cuisineFamilyId: draft.cuisineFamilyId,
    regionSubcuisine: "Levantine",
    metadata: emptyStudioMetadata(),
  });
  assert.equal(result.status, "generated");
  if (result.status !== "generated") throw new Error("generation failed");
  const generatedDraft = { ...draft, ...result.draftPatch };
  return { draft: generatedDraft, result };
}

describe("Baba Ghanouj AI-assisted generation", () => {
  it("provider layer is adaptable and recipe-configured", () => {
    assert.equal(isRecipeGenerationConfigured(), true);
    const providers = listRecipeGenerationProviders();
    assert.ok(providers.length >= 1);
    assert.ok(providers.every((p) => typeof p.generateRecipe === "function"));
    assert.equal(canGenerateDish("Baba Ghanouj"), true);
    assert.equal(canGenerateDish("Something Not In Library"), false);
    assert.equal(getActiveRecipeProvider("Baba Ghanouj")?.id, "local-authored");
  });

  it("image generation is reported as not connected (no fake)", () => {
    assert.equal(isImageGenerationConfigured(), false);
  });

  it("matches dish name aliases including Arabic", () => {
    assert.ok(findGeneratedRecipe("baba ganoush"));
    assert.ok(findGeneratedRecipe("Baba Ghanouj"));
    assert.ok(findGeneratedRecipe("بابا غنوج"));
    assert.equal(findGeneratedRecipe("kartoffelsuppe"), null);
    assert.equal(normalizeDishName("Baba  Ghanouj!"), "baba ghanouj");
  });

  it("generates complete content in all four locales", () => {
    const { draft } = makeBabaGhanoujDraft();
    assert.equal(draft.title, "Baba Ghanouj");
    for (const locale of LOCALES) {
      const copy = draft.localeCopy[locale];
      assert.ok(copy.reason.length > 10, `${locale} reason`);
      assert.equal(copy.steps.length, 6, `${locale} step count`);
      assert.ok(copy.storageTip.length > 5, `${locale} storage`);
    }
    assert.ok(draft.ingredients.length >= 6);
  });

  it("is the Syrian variant: eggplant main plus small tomato and green pepper", () => {
    const { draft } = makeBabaGhanoujDraft();
    const ids = draft.ingredients.map((i) => i.id);
    assert.ok(ids.includes("eggplant"));
    assert.ok(ids.includes("tomato"));
    assert.ok(ids.includes("green-pepper"));
    // Restrained garnish — no excessive pomegranate decoration.
    assert.ok(!ids.includes("pomegranate"));
    assert.ok(draft.ingredientTokens.includes("tomato"));
    assert.ok(draft.ingredientTokens.includes("green pepper"));
    // Every locale mentions tomato + green pepper consistently.
    const tomatoWords: Record<AppLocale, string> = {
      en: "tomato",
      de: "tomate",
      ar: "طماطم",
      tr: "domates",
    };
    for (const locale of LOCALES) {
      const stepsText = draft.localeCopy[locale].steps.join(" ").toLowerCase();
      assert.ok(
        stepsText.includes(tomatoWords[locale]),
        `${locale} steps mention tomato`,
      );
    }
    // Eggplant stays dominant: tahini reduced to a balanced 2 tbsp.
    const tahini = draft.ingredients.find((i) => i.id === "tahini");
    assert.ok(tahini?.detailEn.includes("2 tbsp"));
    // Arabic flatbread served alongside.
    assert.ok(draft.ingredients.some((i) => i.id === "flatbread"));
  });

  it("chooses a natural mezze yield with a dish-specific scaling note", () => {
    const { draft } = makeBabaGhanoujDraft();
    assert.equal(draft.naturalYield?.baseServingsMin, 3);
    assert.equal(draft.naturalYield?.baseServingsMax, 4);
    assert.ok(draft.naturalYield?.servingLabel?.toLowerCase().includes("mezze"));
    assert.ok(draft.naturalYield?.scalingNote?.toLowerCase().includes("eggplant"));
  });

  it("declares allergens and dietary tags consistently", () => {
    const { draft } = makeBabaGhanoujDraft();
    assert.deepEqual(draft.allergens, ["Sesame"]);
    assert.equal(draft.allergenDeclared, true);
    assert.ok(draft.dietaryTags.includes("vegan_ok"));
    assert.ok(draft.dietaryTags.includes("vegetarian_ok"));
    assert.ok(!draft.dietaryTags.includes("contains_dairy"));
  });

  it("passes the Recipe Studio QA audit with zero blocking warnings", () => {
    const { draft } = makeBabaGhanoujDraft();
    const dish = draftRecordToDish(draft);
    const warnings = auditRecipeContent(dish);
    const blocking = warnings.filter((w) => w.severity === "warn");
    assert.deepEqual(
      blocking,
      [],
      `unexpected warnings: ${JSON.stringify(blocking)}`,
    );
    assert.equal(recipeHasQaWarnings(dish), false);
  });

  it("references a prepared hero image under /assets/dishes", () => {
    const { draft } = makeBabaGhanoujDraft();
    assert.equal(draft.imageUrl, "/assets/dishes/arab/baba-ghanouj.jpg");
    const meta = metadataPatchFromGeneratedRecipe(
      findGeneratedRecipe("Baba Ghanouj")!,
      emptyStudioMetadata(),
      "{}",
    );
    assert.equal(meta.focalPointX, 50);
    assert.equal(meta.focalPointY, 50);
    assert.ok(meta.culturalAuthenticityNotes?.toLowerCase().includes("smoky"));
  });

  it("never promotes Baba Ghanouj into the consumer catalog", () => {
    makeBabaGhanoujDraft();
    assert.equal(getDishById("draft-existing-1"), undefined);
    assert.equal(getDishById("baba-ghanouj"), undefined);
    assert.ok(!listConsumerCatalogIds().includes("draft-existing-1"));
    assert.equal(listAllDishes().length, 43);
  });

  it("interprets scoped change requests without regenerating everything", () => {
    assert.ok(interpretRevisionInstruction("Change only the image").imageOnly);
    assert.ok(
      interpretRevisionInstruction("Reduce the tahini").recognizedAreas.includes(
        "ingredients",
      ),
    );
    assert.ok(
      interpretRevisionInstruction(
        "The Arabic instructions need correction",
      ).recognizedAreas.includes("locale_ar"),
    );
    assert.ok(
      interpretRevisionInstruction(
        "Make the base quantity suitable for 3–4 people",
      ).recognizedAreas.includes("yield"),
    );
    assert.ok(
      interpretRevisionInstruction("Use more authentic Levantine preparation")
        .recognizedAreas.includes("authenticity"),
    );
  });
});
