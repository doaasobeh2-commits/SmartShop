import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AppLocale } from "../i18n/types";
import { getDishById, listAllDishes } from "../data/catalog/dishes";
import { generateDraftContent } from "./recipeAiGeneration";
import { findGeneratedRecipe } from "./generatedRecipeLibrary";
import { ARAB_BATCH_1_TITLES } from "./arabBatch1Library";
import { ARAB_BATCH_2_GROUP_1_TITLES } from "./arabBatch2Group1Library";
import {
  ARAB_BATCH_2_GROUP_2,
  ARAB_BATCH_2_GROUP_2_SKIPPED,
  ARAB_BATCH_2_GROUP_2_TITLES,
} from "./arabBatch2Group2Library";
import {
  arabBatch2Group2DraftId,
  ensureArabBatch2Group2StudioDrafts,
  listArabBatch2Group2DraftIds,
} from "./arabBatch2Group2StudioSeed";
import { auditRecipeContent } from "./recipeQaAudit";
import { buildStudioSummary } from "./recipeCatalogAdmin";
import {
  draftRecordToDish,
  listConsumerCatalogIds,
  listStudioRecipeViews,
} from "./recipeStudioMerge";
import {
  createDraftFromCreationInput,
  emptyStudioMetadata,
  type DraftRecipeRecord,
} from "./recipeStudioTypes";
import { emptyStudioState } from "./recipeStudioStorage";
import { defaultPhotoReviewStatus } from "./recipePhotoReview";
import { auditMealRole } from "./mealRole";

const LOCALES: AppLocale[] = ["en", "de", "ar", "tr"];

const EXPECTED_TITLES = [
  "Fattet Dajaj",
  "Basha wa Asakro",
  "Harraq Esbao",
  "Macarona bil Lahmeh",
  "Beetroot Mutabbal",
  "Syrian Boiled Potato Salad",
  "Dawood Basha",
  "Syrian Stuffed Cabbage Stew",
  "Syrian Cauliflower with Meat",
  "Syrian Potato Garlic Olive Oil Stew",
  "Tunisian Couscous with Meat and Vegetables",
  "Moroccan Meat Tagine with Prunes",
  "Moroccan Chicken with Preserved Lemon and Olives",
  "Lebanese Batata Harra",
];

const SIDE_CAN_BE_MAIN = new Set(["Lebanese Batata Harra"]);
const SIDE_ONLY = new Set([
  "Beetroot Mutabbal",
  "Syrian Boiled Potato Salad",
]);

function generateBatchDraft(index: number): DraftRecipeRecord {
  const recipe = ARAB_BATCH_2_GROUP_2[index]!;
  const draft = createDraftFromCreationInput(`draft-arab-batch2-g2-${index}`, {
    dishName: recipe.canonicalTitle,
    cuisineFamilyId: "arab",
    regionSubcuisine: recipe.regionSubcuisine,
  });
  const result = generateDraftContent({
    dishName: draft.title,
    cuisineFamilyId: draft.cuisineFamilyId,
    regionSubcuisine: recipe.regionSubcuisine,
    metadata: emptyStudioMetadata(),
  });
  assert.equal(result.status, "generated", `generate ${recipe.canonicalTitle}`);
  if (result.status !== "generated") throw new Error("generation failed");
  return { ...draft, ...result.draftPatch } as DraftRecipeRecord;
}

describe("Arab Batch 2 Group 2 — shape and dedupe", () => {
  it("defines exactly 14 recipes and skips Mutabbal Batinjan near-dup", () => {
    assert.equal(ARAB_BATCH_2_GROUP_2.length, 14);
    assert.deepEqual(ARAB_BATCH_2_GROUP_2_TITLES, EXPECTED_TITLES);
    assert.equal(ARAB_BATCH_2_GROUP_2_SKIPPED.length, 1);
    assert.equal(ARAB_BATCH_2_GROUP_2_SKIPPED[0]!.title, "Mutabbal Batinjan");
    assert.equal(ARAB_BATCH_2_GROUP_2_SKIPPED[0]!.existingMatch, "Baba Ghanouj");
    assert.ok(!ARAB_BATCH_2_GROUP_2_TITLES.includes("Mutabbal Batinjan"));
    assert.ok(!ARAB_BATCH_2_GROUP_2_TITLES.includes("Sheikh al-Mahshi"));
  });

  it("has no duplicate titles or match keys within the group", () => {
    const titles = ARAB_BATCH_2_GROUP_2.map((r) => r.canonicalTitle);
    assert.equal(new Set(titles).size, titles.length);
    const keys = ARAB_BATCH_2_GROUP_2.flatMap((r) => r.matchKeys);
    assert.equal(new Set(keys).size, keys.length);
  });

  it("does not collide with Batch 1 or Batch 2 Group 1 titles", () => {
    const prior = new Set(
      [...ARAB_BATCH_1_TITLES, ...ARAB_BATCH_2_GROUP_1_TITLES].map((t) =>
        t.toLowerCase(),
      ),
    );
    for (const title of ARAB_BATCH_2_GROUP_2_TITLES) {
      assert.ok(!prior.has(title.toLowerCase()), `collides: ${title}`);
    }
  });

  it("keeps Fattet Dajaj distinct from Fattet Hummus", () => {
    assert.equal(findGeneratedRecipe("Fattet Dajaj")?.canonicalTitle, "Fattet Dajaj");
    assert.equal(findGeneratedRecipe("Fattet Hummus")?.canonicalTitle, "Fattet Hummus");
  });

  it("wires prepared images only where assets exist (Photo QA remains pending)", () => {
    const withImage = ARAB_BATCH_2_GROUP_2.filter((r) => r.photo.preparedImageUrl);
    const withoutImage = ARAB_BATCH_2_GROUP_2.filter((r) => !r.photo.preparedImageUrl);
    assert.ok(withImage.length > 0, "expected some Group 2 recipes to have prepared images");
    for (const recipe of withImage) {
      assert.match(
        recipe.photo.preparedImageUrl!,
        /^\/assets\/dishes\/arab\/.+\.jpg$/,
        recipe.canonicalTitle,
      );
    }
    for (const recipe of withoutImage) {
      assert.equal(recipe.photo.preparedImageUrl, undefined, recipe.canonicalTitle);
    }
  });
});

describe("Arab Batch 2 Group 2 — Admin studio seed", () => {
  it("seeds all 14 as Draft / Photo Pending without consumer leakage", () => {
    const studio = emptyStudioState();
    const views = listStudioRecipeViews(
      studio.overrides,
      studio.drafts,
      studio.recipeQa,
      {},
    );
    const summary = buildStudioSummary(views);
    const draftTitles = views.filter((v) => v.isDraft).map((v) => v.title);

    assert.equal(summary.canonicalCount, 43);
    assert.equal(listAllDishes().length, 43);
    assert.equal(listConsumerCatalogIds().length, 43);
    assert.equal(summary.draftCount, 43);
    assert.equal(summary.totalRecipes, 86);

    for (const title of EXPECTED_TITLES) {
      assert.ok(draftTitles.includes(title), `missing Admin draft: ${title}`);
    }
    for (const id of listArabBatch2Group2DraftIds()) {
      const view = views.find((v) => v.id === id);
      assert.ok(view?.isDraft, id);
      assert.equal(view?.recipeQaStatus, "draft", id);
      assert.equal(view?.photoQaStatus, "pending", id);
      assert.equal(defaultPhotoReviewStatus(), "pending");
      assert.equal(getDishById(id), undefined, id);
    }
  });

  it("is idempotent with stable draft ids", () => {
    const once = emptyStudioState();
    const twice = ensureArabBatch2Group2StudioDrafts(once);
    assert.equal(
      Object.keys(twice.drafts).filter((id) => id.startsWith("draft-arab-batch2-g2-"))
        .length,
      14,
    );
    assert.equal(
      arabBatch2Group2DraftId(ARAB_BATCH_2_GROUP_2[0]!),
      "draft-arab-batch2-g2-fattet-dajaj",
    );
  });
});

describe("Arab Batch 2 Group 2 — locale, roles, QA audit", () => {
  it("has EN/DE/AR/TR parity and ingredient↔step consistency", () => {
    for (let i = 0; i < ARAB_BATCH_2_GROUP_2.length; i++) {
      const recipe = ARAB_BATCH_2_GROUP_2[i]!;
      const draft = generateBatchDraft(i);
      for (const locale of LOCALES) {
        const copy = draft.localeCopy[locale];
        assert.ok(copy?.reason, `${recipe.canonicalTitle} ${locale} reason`);
        assert.ok(copy?.steps?.length, `${recipe.canonicalTitle} ${locale} steps`);
        assert.equal(
          copy!.steps.length,
          recipe.localeCopy.en.steps.length,
          `${recipe.canonicalTitle} ${locale} step parity`,
        );
      }
      assert.ok(/[\u0600-\u06ff]/.test(draft.localeCopy.ar.reason), recipe.canonicalTitle);

      const dish = draftRecordToDish(draft);
      const serious = auditRecipeContent(dish).filter((w) => w.severity === "warn");
      assert.equal(
        serious.length,
        0,
        `${recipe.canonicalTitle}: ${serious.map((w) => w.message).join("; ")}`,
      );

      const roleWarnings = auditMealRole(
        { defaultRole: draft.defaultRole, canServeAsMain: draft.canServeAsMain },
        { isDraft: true },
      );
      assert.equal(roleWarnings.length, 0, recipe.canonicalTitle);
    }
  });

  it("assigns meal roles and servings correctly", () => {
    for (const recipe of ARAB_BATCH_2_GROUP_2) {
      if (SIDE_CAN_BE_MAIN.has(recipe.canonicalTitle)) {
        assert.equal(recipe.defaultRole, "side", recipe.canonicalTitle);
        assert.equal(recipe.canServeAsMain, true, recipe.canonicalTitle);
      } else if (SIDE_ONLY.has(recipe.canonicalTitle)) {
        assert.equal(recipe.defaultRole, "side", recipe.canonicalTitle);
        assert.equal(recipe.canServeAsMain, false, recipe.canonicalTitle);
      } else {
        assert.equal(recipe.defaultRole, "main", recipe.canonicalTitle);
        assert.equal(recipe.canServeAsMain, false, recipe.canonicalTitle);
      }
      assert.ok(recipe.servings >= 3 && recipe.servings <= 4, recipe.canonicalTitle);
    }
  });
});
