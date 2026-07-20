import assert from "node:assert/strict";
import { describe, it } from "node:test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { AppLocale } from "../i18n/types";
import { getDishById, listAllDishes } from "../data/catalog/dishes";
import {
  generateDraftContent,
  metadataPatchFromGeneratedRecipe,
} from "./recipeAiGeneration";
import { canGenerateDish } from "./recipeGenerationProviders";
import { findGeneratedRecipe } from "./generatedRecipeLibrary";
import { ARAB_BATCH_1, ARAB_BATCH_1_TITLES } from "./arabBatch1Library";
import {
  arabBatch1DraftId,
  ensureArabBatch1StudioDrafts,
  listArabBatch1DraftIds,
} from "./arabBatch1StudioSeed";
import { auditRecipeContent, recipeHasQaWarnings } from "./recipeQaAudit";
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
import { emptyStudioState, loadStudioState } from "./recipeStudioStorage";
import { savePhotoReviewToStore, defaultPhotoReviewStatus } from "./recipePhotoReview";
import { auditMealRole } from "./mealRole";

const LOCALES: AppLocale[] = ["en", "de", "ar", "tr"];

const EXPECTED_TITLES = [
  "Egyptian Koshari",
  "Yemeni Chicken Mandi",
  "Saudi Lamb Kabsa",
  "Iraqi Dolma",
  "Iraqi Tepsi Baytinijan",
  "Kibbeh Nayyeh",
  "Fried Kibbeh",
  "Syrian Stuffed Grape Leaves with Meat",
  "Sheikh al-Mahshi",
  "Fattet Hummus",
  "Levantine Chicken Shawarma",
  "Lebanese Sayadiyeh",
  "Palestinian Musakhan",
  "Palestinian Maqluba",
  "Jordanian Mansaf",
];

// side + can-be-main dishes; everything else is a plain main.
const SIDE_CAN_BE_MAIN = new Set(["Kibbeh Nayyeh", "Fried Kibbeh", "Fattet Hummus"]);

const here = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(here, "../../public");

function generateBatchDraft(index: number): DraftRecipeRecord {
  const recipe = ARAB_BATCH_1[index]!;
  const draft = createDraftFromCreationInput(`draft-arab-batch1-${index}`, {
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

function allBatchDrafts(): DraftRecipeRecord[] {
  return ARAB_BATCH_1.map((_, i) => generateBatchDraft(i));
}

function ingredientText(draft: DraftRecipeRecord): string {
  return draft.ingredients
    .map((i) => `${i.id} ${i.en} ${i.de} ${i.ar} ${i.tr}`)
    .join(" ")
    .toLowerCase();
}

describe("Arab Batch 1 — Admin catalog visibility (studio seed)", () => {
  it("empty / loaded Studio state exposes all 15 Batch 1 titles as reviewable drafts", () => {
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
    // Batch 1 (15) + Batch 2 G1 (14) + Batch 2 G2 (14) on a fresh studio seed.
    assert.ok(summary.draftCount >= 43, `draftCount=${summary.draftCount}`);
    for (const title of EXPECTED_TITLES) {
      assert.ok(draftTitles.includes(title), `missing Admin draft: ${title}`);
    }
    for (const id of listArabBatch1DraftIds()) {
      const view = views.find((v) => v.id === id);
      assert.ok(view?.isDraft, id);
      assert.equal(view?.recipeQaStatus, "draft", id);
      assert.equal(view?.photoQaStatus, "pending", id);
      assert.equal(getDishById(id), undefined, id);
      assert.ok(!listConsumerCatalogIds().includes(id), id);
    }
  });

  it("Admin total includes Batch 1 without changing the consumer catalog", () => {
    // Fresh studio = Batch 1 only (no Baba/Yalanji local drafts).
    const studio = emptyStudioState();
    const views = listStudioRecipeViews(
      studio.overrides,
      studio.drafts,
      studio.recipeQa,
      {},
    );
    const summary = buildStudioSummary(views);
    assert.equal(listAllDishes().length, 43);
    assert.equal(listConsumerCatalogIds().length, 43);
    assert.equal(summary.canonicalCount, 43);
    // Fresh studio seeds Batch 1 (15) + Batch 2 G1 (14) + Batch 2 G2 (14).
    assert.equal(summary.draftCount, 43);
    assert.equal(summary.totalRecipes, 86);

    // With the two pre-existing local drafts (Baba + Yalanji), Admin total is 88.
    const withExisting = ensureArabBatch1StudioDrafts({
      ...emptyStudioState(),
      drafts: {
        ...emptyStudioState().drafts,
        "draft-baba": createDraftFromCreationInput("draft-baba", {
          dishName: "Baba Ghanouj",
          cuisineFamilyId: "arab",
        }),
        "draft-yalanji": createDraftFromCreationInput("draft-yalanji", {
          dishName: "Yalanji",
          cuisineFamilyId: "arab",
        }),
      },
    });
    const withViews = listStudioRecipeViews(
      withExisting.overrides,
      withExisting.drafts,
      withExisting.recipeQa,
      {},
    );
    const withSummary = buildStudioSummary(withViews);
    assert.equal(withSummary.canonicalCount, 43);
    assert.equal(withSummary.draftCount, 45);
    assert.equal(withSummary.totalRecipes, 88);
  });

  it("does not introduce duplicate ids or titles when seeding twice", () => {
    const once = emptyStudioState();
    const twice = ensureArabBatch1StudioDrafts(once);
    const ids = Object.keys(twice.drafts);
    const titles = Object.values(twice.drafts).map((d) => d.title);
    assert.equal(new Set(ids).size, ids.length);
    assert.equal(new Set(titles).size, titles.length);
    assert.equal(listArabBatch1DraftIds().length, 15);
    assert.equal(
      listArabBatch1DraftIds().filter((id) => twice.drafts[id]).length,
      15,
    );
    // loadStudioState path also seeds without duplicating.
    const loaded = loadStudioState(JSON.stringify(twice));
    assert.equal(
      Object.keys(loaded.drafts).filter((id) => id.startsWith("draft-arab-batch1-"))
        .length,
      15,
    );
  });

  it("stable draft ids are derived from prepared image slugs", () => {
    assert.equal(arabBatch1DraftId(ARAB_BATCH_1[0]!), "draft-arab-batch1-koshari");
    assert.equal(arabBatch1DraftId(ARAB_BATCH_1[14]!), "draft-arab-batch1-mansaf");
  });
});

describe("Arab Batch 1 — batch shape and isolation", () => {
  it("defines exactly the 15 intended recipes in order", () => {
    assert.equal(ARAB_BATCH_1.length, 15);
    assert.deepEqual(ARAB_BATCH_1_TITLES, EXPECTED_TITLES);
  });

  it("has no duplicate titles, image paths or match keys", () => {
    const titles = ARAB_BATCH_1.map((r) => r.canonicalTitle);
    assert.equal(new Set(titles).size, titles.length);

    const images = ARAB_BATCH_1.map((r) => r.photo.preparedImageUrl);
    assert.equal(new Set(images).size, images.length);

    const keys = ARAB_BATCH_1.flatMap((r) => r.matchKeys);
    assert.equal(new Set(keys).size, keys.length, "match keys must be unique across the batch");
  });

  it("is generatable by English title and Arabic alias", () => {
    for (const recipe of ARAB_BATCH_1) {
      assert.equal(canGenerateDish(recipe.canonicalTitle), true, recipe.canonicalTitle);
      const arabicKey = recipe.matchKeys.find((k) => /[\u0600-\u06ff]/.test(k));
      assert.ok(arabicKey, `${recipe.canonicalTitle} has an Arabic alias`);
      assert.equal(canGenerateDish(arabicKey!), true, arabicKey);
      const found = findGeneratedRecipe(recipe.canonicalTitle);
      assert.equal(found?.canonicalTitle, recipe.canonicalTitle);
    }
  });

  it("produces 15 Studio drafts that are Draft + Pending and never consumer-resolvable", () => {
    const drafts = allBatchDrafts();
    const store: Record<string, DraftRecipeRecord> = {};
    let photo: Record<string, ReturnType<typeof defaultPhotoReviewStatus>> = {};
    for (const d of drafts) {
      store[d.id] = d;
      photo = savePhotoReviewToStore(photo, d.id, defaultPhotoReviewStatus());
    }
    const views = listStudioRecipeViews({}, store, {}, photo);
    const draftViews = views.filter((v) => v.isDraft);
    assert.equal(draftViews.length, 15);
    for (const v of draftViews) {
      assert.equal(v.recipeQaStatus, "draft", `${v.title} recipe QA`);
      assert.equal(v.photoQaStatus, "pending", `${v.title} photo QA`);
    }
    // Drafts must never leak into the consumer catalog.
    const consumerIds = listConsumerCatalogIds();
    for (const d of drafts) {
      assert.equal(getDishById(d.id), undefined, `${d.title} not resolvable`);
      assert.ok(!consumerIds.includes(d.id), `${d.title} not in consumer catalog`);
    }
  });

  it("leaves the canonical catalog unchanged (43) and does not collide with it", () => {
    assert.equal(listAllDishes().length, 43);
    assert.equal(listConsumerCatalogIds().length, 43);

    const canonicalTitles = new Set(listAllDishes().map((d) => d.title));
    const canonicalImages = new Set(listAllDishes().map((d) => d.imageUrl));
    for (const recipe of ARAB_BATCH_1) {
      assert.ok(!canonicalTitles.has(recipe.canonicalTitle), `${recipe.canonicalTitle} title collision`);
      assert.ok(
        !canonicalImages.has(recipe.photo.preparedImageUrl!),
        `${recipe.canonicalTitle} image collision`,
      );
    }
    // Existing canonical dishes explicitly referenced by the brief must remain.
    assert.equal(getDishById("kabsa-chicken")?.title, "Kabsa Chicken");
    assert.equal(getDishById("sumac-chicken")?.title, "Musakhan Wraps");
    // Prior Studio-only drafts stay unresolvable.
    assert.equal(getDishById("yalanji"), undefined);
  });
});

describe("Arab Batch 1 — content, locales and QA", () => {
  it("passes the recipe content audit with zero blocking warnings", () => {
    for (let i = 0; i < ARAB_BATCH_1.length; i++) {
      const draft = generateBatchDraft(i);
      const dish = draftRecordToDish(draft);
      const blocking = auditRecipeContent(dish).filter((w) => w.severity === "warn");
      assert.deepEqual(
        blocking,
        [],
        `${draft.title} warnings: ${JSON.stringify(blocking)}`,
      );
      assert.equal(recipeHasQaWarnings(dish), false, draft.title);
    }
  });

  it("has consistent, non-empty content in all four locales with matching step counts", () => {
    for (let i = 0; i < ARAB_BATCH_1.length; i++) {
      const draft = generateBatchDraft(i);
      const stepCounts = LOCALES.map((l) => draft.localeCopy[l].steps.length);
      assert.equal(new Set(stepCounts).size, 1, `${draft.title} step counts ${stepCounts}`);
      assert.ok(stepCounts[0]! >= 5, `${draft.title} has enough steps`);
      for (const locale of LOCALES) {
        const copy = draft.localeCopy[locale];
        assert.ok(copy.reason.length > 10, `${draft.title} ${locale} reason`);
        assert.ok(copy.storageTip.length > 5, `${draft.title} ${locale} storage`);
        assert.ok(copy.steps.every((s) => s.trim().length > 0), `${draft.title} ${locale} steps`);
      }
      // Arabic content must actually be Arabic script.
      assert.ok(/[\u0600-\u06ff]/.test(draft.localeCopy.ar.reason), `${draft.title} AR reason script`);
      assert.ok(
        draft.localeCopy.ar.steps.every((s) => /[\u0600-\u06ff]/.test(s)),
        `${draft.title} AR steps script`,
      );
    }
  });

  it("gives every ingredient an explicit quantity/detail in every locale", () => {
    for (let i = 0; i < ARAB_BATCH_1.length; i++) {
      const draft = generateBatchDraft(i);
      for (const ing of draft.ingredients) {
        assert.ok(ing.detailEn.trim().length > 0, `${draft.title} ${ing.id} EN detail`);
        assert.ok(ing.detailDe.trim().length > 0, `${draft.title} ${ing.id} DE detail`);
        assert.ok(ing.detailAr.trim().length > 0, `${draft.title} ${ing.id} AR detail`);
        assert.ok(ing.detailTr.trim().length > 0, `${draft.title} ${ing.id} TR detail`);
      }
    }
  });

  it("carries region/subcuisine, natural yield and a coherent scaling note", () => {
    const rebalance = /salt|acid|lemon|spice|molasses|oil|vinegar|sumac|jameed|tang/i;
    for (let i = 0; i < ARAB_BATCH_1.length; i++) {
      const draft = generateBatchDraft(i);
      assert.ok(draft.regionSubcuisine && draft.regionSubcuisine.length > 2, `${draft.title} region`);
      const y = draft.naturalYield;
      assert.ok(y, `${draft.title} natural yield`);
      assert.equal(typeof y!.baseServingsMin, "number");
      assert.equal(typeof y!.baseServingsMax, "number");
      assert.ok(y!.baseServingsMin! <= y!.baseServingsMax!, `${draft.title} yield range`);
      assert.ok((y!.servingLabel ?? "").length > 3, `${draft.title} serving label`);
      assert.ok((y!.scalingNote ?? "").length > 20, `${draft.title} scaling note`);
      assert.ok(rebalance.test(y!.scalingNote ?? ""), `${draft.title} scaling note rebalancing`);
    }
  });
});

describe("Arab Batch 1 — meal role", () => {
  it("assigns an explicit, normalized meal role with a clean audit", () => {
    for (let i = 0; i < ARAB_BATCH_1.length; i++) {
      const draft = generateBatchDraft(i);
      assert.ok(draft.defaultRole === "main" || draft.defaultRole === "side", draft.title);
      assert.equal(typeof draft.canServeAsMain, "boolean", draft.title);
      // Never encode the redundant main + canServeAsMain=true combination.
      if (draft.defaultRole === "main") {
        assert.equal(draft.canServeAsMain, false, `${draft.title} main normalization`);
      }
      const warnings = auditMealRole(
        { defaultRole: draft.defaultRole!, canServeAsMain: draft.canServeAsMain! },
        { isDraft: true },
      );
      assert.deepEqual(warnings, [], `${draft.title} meal-role warnings`);
    }
  });

  it("matches the intended per-dish role direction", () => {
    for (let i = 0; i < ARAB_BATCH_1.length; i++) {
      const draft = generateBatchDraft(i);
      if (SIDE_CAN_BE_MAIN.has(draft.title)) {
        assert.equal(draft.defaultRole, "side", `${draft.title} side`);
        assert.equal(draft.canServeAsMain, true, `${draft.title} can be main`);
      } else {
        assert.equal(draft.defaultRole, "main", `${draft.title} main`);
        assert.equal(draft.canServeAsMain, false, `${draft.title} main only`);
      }
    }
  });
});

describe("Arab Batch 1 — dietary, allergen and image integrity", () => {
  it("derives dietary tags and allergens honestly from the ingredients", () => {
    for (let i = 0; i < ARAB_BATCH_1.length; i++) {
      const draft = generateBatchDraft(i);
      const text = ingredientText(draft);
      const diet = draft.dietaryTags;

      // No contradictory dietary tags.
      if (diet.includes("vegetarian_ok")) {
        assert.ok(!diet.includes("contains_meat"), `${draft.title} veg vs meat`);
        assert.ok(!diet.includes("contains_fish"), `${draft.title} veg vs fish`);
      }
      if (diet.includes("vegan_ok")) {
        for (const animal of ["contains_meat", "contains_fish", "contains_dairy", "contains_egg"] as const) {
          assert.ok(!diet.includes(animal), `${draft.title} vegan vs ${animal}`);
        }
      }
      assert.equal(draft.allergenDeclared, true, `${draft.title} allergenDeclared`);

      // Allergen presence must follow the actual ingredients.
      if (/tahini/.test(text)) assert.ok(draft.allergens.includes("Sesame"), `${draft.title} sesame`);
      if (/\bpine nuts\b|\balmond|\bnuts\b/.test(text)) {
        assert.ok(draft.allergens.includes("Nuts"), `${draft.title} nuts`);
      }
      if (/yogurt|jameed/.test(text)) {
        assert.ok(draft.allergens.includes("Dairy"), `${draft.title} dairy`);
        assert.ok(draft.dietaryTags.includes("contains_dairy"), `${draft.title} contains_dairy`);
      }
      if (/bulgur|pita|macaroni|flatbread|bread|shrak|markook/.test(text)) {
        assert.ok(draft.allergens.includes("Gluten"), `${draft.title} gluten`);
      }
      if (/white fish|fish fillet/.test(text)) {
        assert.ok(draft.allergens.includes("Fish"), `${draft.title} fish`);
        assert.ok(draft.dietaryTags.includes("contains_fish"), `${draft.title} contains_fish`);
      }

      // Only existing MealIntentTag values are used.
      const validIntents = new Set([
        "budget",
        "healthy",
        "high_calorie",
        "special",
        "quick",
        "family_friendly",
      ]);
      for (const tag of draft.mealIntents) {
        assert.ok(validIntents.has(tag), `${draft.title} intent ${tag}`);
      }
    }
  });

  it("references a valid, existing hero JPG under /assets/dishes/arab", () => {
    for (const recipe of ARAB_BATCH_1) {
      const url = recipe.photo.preparedImageUrl!;
      assert.ok(url.startsWith("/assets/dishes/arab/"), `${recipe.canonicalTitle} path`);
      assert.ok(url.endsWith(".jpg"), `${recipe.canonicalTitle} extension`);
      const file = path.join(publicDir, url.replace(/^\//, ""));
      assert.ok(fs.existsSync(file), `${recipe.canonicalTitle} image file exists: ${file}`);
    }
  });

  it("exposes prepared photo metadata via the studio metadata patch", () => {
    for (const recipe of ARAB_BATCH_1) {
      const meta = metadataPatchFromGeneratedRecipe(recipe, emptyStudioMetadata(), "{}");
      assert.equal(typeof meta.focalPointX, "number");
      assert.equal(typeof meta.focalPointY, "number");
      assert.ok((meta.culturalAuthenticityNotes ?? "").length > 5, recipe.canonicalTitle);
    }
  });
});

describe("Arab Batch 1 — cultural identity checks", () => {
  it("Koshari shows all its defining components", () => {
    const draft = generateBatchDraft(0);
    const ids = draft.ingredients.map((i) => i.id);
    for (const id of ["rice", "brown-lentils", "macaroni", "chickpeas", "onion"]) {
      assert.ok(ids.includes(id), `koshari missing ${id}`);
    }
    assert.equal(draft.proteinCategory, "legume");
    assert.ok(draft.dietaryTags.includes("vegan_ok"));
  });

  it("Saudi Lamb Kabsa is lamb and distinct from the canonical Chicken Kabsa", () => {
    const draft = generateBatchDraft(2);
    assert.equal(draft.proteinCategory, "lamb");
    assert.notEqual(draft.imageUrl, getDishById("kabsa-chicken")?.imageUrl);
    assert.notEqual(draft.title, "Kabsa Chicken");
  });

  it("Kibbeh Nayyeh is honestly raw meat with a food-safety note", () => {
    const draft = generateBatchDraft(5);
    assert.ok(draft.dietaryTags.includes("contains_meat"));
    assert.ok(!draft.dietaryTags.includes("vegetarian_ok"));
    assert.ok(!draft.dietaryTags.includes("vegan_ok"));
    const tips = draft.localeCopy.en.tips.join(" ").toLowerCase();
    assert.ok(tips.includes("food safety") || tips.includes("raw"), "safety note present");
    assert.ok(draft.localeCopy.en.reason.toLowerCase().includes("raw"), "reason notes raw meat");
  });

  it("Musakhan is bread-based and distinct from consumer Musakhan Wraps", () => {
    const draft = generateBatchDraft(12);
    const ids = draft.ingredients.map((i) => i.id);
    assert.ok(ids.includes("flatbread"));
    assert.ok(ids.includes("sumac"));
    assert.ok(ids.includes("pine-nuts"));
    assert.equal(draft.title, "Palestinian Musakhan");
    assert.notEqual(draft.title, "Musakhan Wraps");
    const wraps = getDishById("sumac-chicken");
    assert.equal(wraps?.title, "Musakhan Wraps");
    const wrapIds = wraps?.content.en.ingredients.map((i) => i.id) ?? [];
    assert.ok(wrapIds.includes("tortilla"));
    assert.ok(!wrapIds.includes("flatbread"));
    assert.equal(findGeneratedRecipe("musakhan")?.canonicalTitle, "Palestinian Musakhan");
    assert.equal(findGeneratedRecipe("مسخن")?.canonicalTitle, "Palestinian Musakhan");
    assert.equal(findGeneratedRecipe("musakhan wraps"), null);
  });

  it("Mansaf carries jameed with declared dairy", () => {
    const draft = generateBatchDraft(14);
    assert.ok(draft.ingredients.some((i) => i.id === "jameed"));
    assert.ok(draft.dietaryTags.includes("contains_dairy"));
    assert.ok(draft.allergens.includes("Dairy"));
    assert.equal(draft.proteinCategory, "lamb");
  });

  it("Stuffed Grape Leaves with Meat is a meat main, distinct from meatless Yalanji", () => {
    const draft = generateBatchDraft(7);
    assert.ok(draft.dietaryTags.includes("contains_meat"));
    assert.equal(draft.defaultRole, "main");
    assert.ok(draft.ingredients.some((i) => i.id === "minced-meat"));
    assert.equal(getDishById("yalanji"), undefined);
  });
});
