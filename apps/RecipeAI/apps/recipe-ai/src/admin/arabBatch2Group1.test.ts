import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AppLocale } from "../i18n/types";
import { getDishById, listAllDishes } from "../data/catalog/dishes";
import { generateDraftContent } from "./recipeAiGeneration";
import { findGeneratedRecipe } from "./generatedRecipeLibrary";
import { ARAB_BATCH_1_TITLES } from "./arabBatch1Library";
import {
  ARAB_BATCH_2_GROUP_1,
  ARAB_BATCH_2_GROUP_1_SKIPPED_EXISTING,
  ARAB_BATCH_2_GROUP_1_TITLES,
} from "./arabBatch2Group1Library";
import {
  arabBatch2Group1DraftId,
  ensureArabBatch2Group1StudioDrafts,
  listArabBatch2Group1DraftIds,
} from "./arabBatch2Group1StudioSeed";
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
  "Bamieh bil Lahmeh",
  "Shakriyeh with Rice",
  "Syrian Molokhia with Chicken",
  "Syrian Meat Maqluba",
  "Shish Barak",
  "Fasolia bi Zeit",
  "Artichoke Salad",
  "Syrian Ouzi",
  "Peas with Tomato",
  "Syrian Stuffed Chicken",
  "Freekeh with Meat",
  "Syrian Savory Pastries",
  "Syrian Sfiha",
  "Spinach Fatayer",
];

const SIDE_CAN_BE_MAIN = new Set([
  "Fasolia bi Zeit",
  "Syrian Savory Pastries",
  "Syrian Sfiha",
  "Spinach Fatayer",
]);

const SIDE_ONLY = new Set(["Artichoke Salad"]);

function generateBatchDraft(index: number): DraftRecipeRecord {
  const recipe = ARAB_BATCH_2_GROUP_1[index]!;
  const draft = createDraftFromCreationInput(`draft-arab-batch2-g1-${index}`, {
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

describe("Arab Batch 2 Group 1 — shape and dedupe", () => {
  it("defines exactly 14 recipes and skips existing Sheikh al-Mahshi", () => {
    assert.equal(ARAB_BATCH_2_GROUP_1.length, 14);
    assert.deepEqual(ARAB_BATCH_2_GROUP_1_TITLES, EXPECTED_TITLES);
    assert.deepEqual([...ARAB_BATCH_2_GROUP_1_SKIPPED_EXISTING], ["Sheikh al-Mahshi"]);
    assert.ok(ARAB_BATCH_1_TITLES.includes("Sheikh al-Mahshi"));
    assert.ok(!ARAB_BATCH_2_GROUP_1_TITLES.includes("Sheikh al-Mahshi"));
  });

  it("has no duplicate titles or match keys within the group", () => {
    const titles = ARAB_BATCH_2_GROUP_1.map((r) => r.canonicalTitle);
    assert.equal(new Set(titles).size, titles.length);
    const keys = ARAB_BATCH_2_GROUP_1.flatMap((r) => r.matchKeys);
    assert.equal(new Set(keys).size, keys.length);
  });

  it("does not collide with Batch 1 titles", () => {
    const batch1 = new Set(ARAB_BATCH_1_TITLES.map((t) => t.toLowerCase()));
    for (const title of ARAB_BATCH_2_GROUP_1_TITLES) {
      assert.ok(!batch1.has(title.toLowerCase()), `collides with Batch 1: ${title}`);
    }
  });

  it("Syrian Meat Maqluba does not claim bare maqluba keys", () => {
    const maqluba = ARAB_BATCH_2_GROUP_1.find((r) => r.canonicalTitle === "Syrian Meat Maqluba");
    assert.ok(maqluba);
    assert.ok(!maqluba!.matchKeys.includes("maqluba"));
    assert.ok(!maqluba!.matchKeys.includes("مقلوبة"));
    assert.ok(maqluba!.matchKeys.includes("syrian meat maqluba"));
    assert.ok(maqluba!.matchKeys.includes("مقلوبة باللحمة"));
    // Generic lookup still resolves to Palestinian Maqluba (Batch 1).
    assert.equal(findGeneratedRecipe("maqluba")?.canonicalTitle, "Palestinian Maqluba");
    assert.equal(
      findGeneratedRecipe("Syrian Meat Maqluba")?.canonicalTitle,
      "Syrian Meat Maqluba",
    );
  });

  it("wires prepared images only where assets exist (Photo QA remains pending)", () => {
    const withImage = ARAB_BATCH_2_GROUP_1.filter((r) => r.photo.preparedImageUrl);
    const withoutImage = ARAB_BATCH_2_GROUP_1.filter((r) => !r.photo.preparedImageUrl);
    assert.ok(withImage.length > 0, "expected some Group 1 recipes to have prepared images");
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

describe("Arab Batch 2 Group 1 — Admin studio seed", () => {
  it("seeds all 14 as Recipe QA draft / Photo QA pending without consumer catalog leakage", () => {
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
    for (const id of listArabBatch2Group1DraftIds()) {
      const view = views.find((v) => v.id === id);
      assert.ok(view?.isDraft, id);
      assert.equal(view?.recipeQaStatus, "draft", id);
      assert.equal(view?.photoQaStatus, "pending", id);
      assert.equal(defaultPhotoReviewStatus(), "pending");
      assert.equal(getDishById(id), undefined, id);
      assert.ok(!listConsumerCatalogIds().includes(id), id);
    }
  });

  it("is idempotent and uses stable draft ids", () => {
    const once = emptyStudioState();
    const twice = ensureArabBatch2Group1StudioDrafts(once);
    assert.equal(
      Object.keys(twice.drafts).filter((id) => id.startsWith("draft-arab-batch2-g1-"))
        .length,
      14,
    );
    assert.equal(
      arabBatch2Group1DraftId(ARAB_BATCH_2_GROUP_1[0]!),
      "draft-arab-batch2-g1-bamieh-bil-lahmeh",
    );
  });
});

describe("Arab Batch 2 Group 1 — locale, roles, QA audit", () => {
  it("has EN/DE/AR/TR parity and ingredient↔step consistency", () => {
    for (let i = 0; i < ARAB_BATCH_2_GROUP_1.length; i++) {
      const recipe = ARAB_BATCH_2_GROUP_1[i]!;
      const draft = generateBatchDraft(i);
      for (const locale of LOCALES) {
        const copy = draft.localeCopy[locale];
        assert.ok(copy?.reason, `${recipe.canonicalTitle} ${locale} reason`);
        assert.ok(copy?.steps?.length, `${recipe.canonicalTitle} ${locale} steps`);
        assert.equal(
          draft.ingredients.length,
          recipe.ingredients.length,
          `${recipe.canonicalTitle} ingredient count`,
        );
        assert.equal(
          copy!.steps.length,
          recipe.localeCopy.en.steps.length,
          `${recipe.canonicalTitle} ${locale} step parity`,
        );
      }

      const dish = draftRecordToDish(draft);
      const warnings = auditRecipeContent(dish);
      const serious = warnings.filter((w) => w.severity === "warn");
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

  it("assigns meal roles correctly", () => {
    for (const recipe of ARAB_BATCH_2_GROUP_1) {
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
      assert.equal(recipe.servings >= 3 && recipe.servings <= 4, true, recipe.canonicalTitle);
    }
  });
});
