/**
 * READ-ONLY catalog export for external Recipe/Content QA.
 * Does not mutate source data. Run: npx tsx scripts/exportCatalog88.mts
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { DISH_CATALOG } from "../src/data/catalog/dishes/index.ts";
import { IMAGE_FOCAL_POINTS } from "../src/data/imageFocalPoints.ts";
import { ARAB_BATCH_1 } from "../src/admin/arabBatch1Library.ts";
import { arabBatch1DraftId } from "../src/admin/arabBatch1StudioSeed.ts";
import { ARAB_BATCH_2_GROUP_1 } from "../src/admin/arabBatch2Group1Library.ts";
import { arabBatch2Group1DraftId } from "../src/admin/arabBatch2Group1StudioSeed.ts";
import { ARAB_BATCH_2_GROUP_2, ARAB_BATCH_2_GROUP_2_SKIPPED } from "../src/admin/arabBatch2Group2Library.ts";
import { arabBatch2Group2DraftId } from "../src/admin/arabBatch2Group2StudioSeed.ts";
import { ARAB_BATCH_2_GROUP_1_SKIPPED_EXISTING } from "../src/admin/arabBatch2Group1Library.ts";
import {
  GENERATED_RECIPE_LIBRARY,
  type GeneratedRecipe,
} from "../src/admin/generatedRecipeLibrary.ts";
import { auditRecipeContent } from "../src/admin/recipeQaAudit.ts";
import { KNOWN_STUDIO_FINDINGS } from "../src/admin/recipeStudioKnownFindings.ts";
import { draftRecordToDish } from "../src/admin/recipeStudioMerge.ts";
import type {
  DraftRecipeRecord,
  RecipeQaStore,
  RecipeStudioPersistedState,
} from "../src/admin/recipeStudioTypes.ts";
import type { PhotoReviewStore } from "../src/admin/recipePhotoReview.ts";
import type { DishCatalogEntry } from "../src/data/catalog/types.ts";
import { NEEDS_PHOTO_PLACEHOLDER_PATH } from "../src/data/catalog/imageAssets.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const EXPORT_DIR = join(__dirname, "..", "exports");
const RUNTIME_STUDIO_PATH = join(EXPORT_DIR, "_runtime-studio-v2.json");
const RUNTIME_PHOTO_PATH = join(EXPORT_DIR, "_runtime-photo-review-v1.json");

type LocaleBundle = {
  title: string | null;
  reason: string | null;
  reasonGuests: string | null;
  cuisineLabel: string | null;
  ingredients: Array<{
    id: string;
    name: string;
    detail: string;
    status?: string;
  }>;
  steps: Array<{ order: number; instruction: string }>;
  tips: string[];
  storageTip: string | null;
};

type ExportRecipe = {
  id: string;
  canonicalTitle: string;
  sourceLayer: "consumer" | "studio_seed" | "generation_only";
  sourceFile: string;
  studioDraftId: string | null;
  cuisineFamilyId: string;
  cuisineFolder: string | null;
  regionSubcuisine: string | null;
  defaultRole: string | null;
  canServeAsMain: boolean | null;
  mealSlotRole: string | null;
  mealTypes: string[];
  mealIntents: string[];
  suitability: string[];
  moods: string[];
  dietaryTags: string[];
  allergens: string[];
  mayContain: string[];
  allergenDeclared: boolean | null;
  servings: number | null;
  naturalYield: unknown;
  prepMinutes: number | null;
  difficulty: string | null;
  specialness: number | null;
  familiarity: number | null;
  proteinCategory: string | null;
  budgetTier: string | null;
  nutrition: unknown;
  imageFile: string | null;
  imageUrl: string | null;
  preparedImageUrl: string | null;
  imageFocalPoint: string | null;
  recipeQaStatus: string;
  photoQaStatus: string;
  knownFindings: unknown;
  qaWarnings: unknown[];
  locales: Record<"en" | "de" | "ar" | "tr", LocaleBundle>;
  provenance: {
    sourceLayer: string;
    sourceFile: string;
    hasRuntimeDraft: boolean;
    hasRuntimeOverride: boolean;
    runtimeDraftId: string | null;
    liveLocalStorageIncluded: boolean;
  };
  sourceSnapshot: unknown;
  effectiveSnapshot: unknown;
  runtimeDraft: unknown;
  runtimeOverride: unknown;
};

function emptyLocale(): LocaleBundle {
  return {
    title: null,
    reason: null,
    reasonGuests: null,
    cuisineLabel: null,
    ingredients: [],
    steps: [],
    tips: [],
    storageTip: null,
  };
}

function localesFromDish(dish: DishCatalogEntry, title: string): Record<"en" | "de" | "ar" | "tr", LocaleBundle> {
  const out = {
    en: emptyLocale(),
    de: emptyLocale(),
    ar: emptyLocale(),
    tr: emptyLocale(),
  } as Record<"en" | "de" | "ar" | "tr", LocaleBundle>;
  for (const loc of ["en", "de", "ar", "tr"] as const) {
    const c = dish.content[loc];
    out[loc] = {
      title,
      reason: c?.reason ?? null,
      reasonGuests: c?.reasonGuests ?? null,
      cuisineLabel: c?.cuisineLabel ?? null,
      ingredients: (c?.ingredients ?? []).map((i) => ({
        id: i.id,
        name: i.name,
        detail: i.detail,
        status: i.status,
      })),
      steps: (c?.steps ?? []).map((s) => ({
        order: s.order,
        instruction: s.instruction,
      })),
      tips: [...(c?.tips ?? [])],
      storageTip: c?.storageTip ?? null,
    };
  }
  return out;
}

function localesFromGenerated(recipe: GeneratedRecipe): Record<"en" | "de" | "ar" | "tr", LocaleBundle> {
  const out = {
    en: emptyLocale(),
    de: emptyLocale(),
    ar: emptyLocale(),
    tr: emptyLocale(),
  } as Record<"en" | "de" | "ar" | "tr", LocaleBundle>;
  for (const loc of ["en", "de", "ar", "tr"] as const) {
    const copy = recipe.localeCopy[loc];
    out[loc] = {
      title: recipe.canonicalTitle,
      reason: copy?.reason ?? null,
      reasonGuests: copy?.reasonGuests ?? null,
      cuisineLabel: copy?.cuisineLabel ?? null,
      ingredients: recipe.ingredients.map((ing) => ({
        id: ing.id,
        name: loc === "en" ? ing.en : loc === "de" ? ing.de : loc === "ar" ? ing.ar : ing.tr,
        detail:
          loc === "en"
            ? ing.detailEn
            : loc === "de"
              ? ing.detailDe
              : loc === "ar"
                ? ing.detailAr
                : ing.detailTr,
        status: ing.status,
      })),
      steps: (copy?.steps ?? []).map((instruction, index) => ({
        order: index + 1,
        instruction,
      })),
      tips: [...(copy?.tips ?? [])],
      storageTip: copy?.storageTip ?? null,
    };
  }
  return out;
}

function isPlaceholderImage(url: string | null | undefined): boolean {
  if (!url) return true;
  return url.includes(NEEDS_PHOTO_PLACEHOLDER_PATH);
}

function loadJsonFile(path: string): unknown {
  const raw = readFileSync(path, "utf8");
  if (!raw || raw === "null") return null;
  return JSON.parse(raw);
}

function consumerSourceFile(id: string): string {
  const map: Record<string, string> = {
    tabbouleh: "dishes/arab.ts",
    fattoush: "dishes/arab.ts",
    mujaddara: "dishes/arab.ts",
    "shorbat-adas": "dishes/arab.ts",
    "sumac-chicken": "dishes/arab.ts",
    "kabsa-chicken": "dishes/arab.ts",
    kofte: "dishes/turkish.ts",
    "mercimek-corbasi": "dishes/turkish.ts",
    cacik: "dishes/turkish.ts",
    menemen: "dishes/turkish.ts",
    ezogelin: "dishes/turkish.ts",
    "wiener-schnitzel": "dishes/centralEuropean.ts",
    gurkensalat: "dishes/centralEuropean.ts",
    kartoffelsuppe: "dishes/centralEuropean.ts",
    "paprika-chicken": "dishes/centralEuropean.ts",
    gulasch: "dishes/centralEuropean.ts",
    "pomodoro-pasta": "dishes/italian.ts",
    minestrone: "dishes/italian.ts",
    caprese: "dishes/italian.ts",
    "garlic-rosemary-chicken": "dishes/italian.ts",
    "mushroom-risotto": "dishes/italian.ts",
    dumplings: "dishes/chinese.ts",
    "tomato-egg-stirfry": "dishes/chinese.ts",
    "cucumber-salad-smashed": "dishes/chinese.ts",
    "egg-fried-rice": "dishes/chinese.ts",
    "ginger-soy-chicken": "dishes/chinese.ts",
    "dal-tadka": "dishes/indian.ts",
    "jeera-rice": "dishes/indian.ts",
    "cucumber-raita": "dishes/indian.ts",
    "aloo-gobi": "dishes/indian.ts",
    "tandoori-style-chicken": "dishes/indian.ts",
    "street-tacos": "dishes/mexican.ts",
    "black-bean-soup": "dishes/mexican.ts",
    "mexican-rice": "dishes/mexican.ts",
    "chicken-tinga": "dishes/mexican.ts",
    "guacamole-plates": "dishes/mexican.ts",
    "foul-medames": "dishes/coverageExpansion.ts",
    "imam-bayildi": "dishes/coverageExpansion.ts",
    eiernockerl: "dishes/coverageExpansion.ts",
    "pasta-e-ceci": "dishes/coverageExpansion.ts",
    "mapo-tofu": "dishes/coverageExpansion.ts",
    "chana-masala": "dishes/coverageExpansion.ts",
    "huevos-rancheros": "dishes/coverageExpansion.ts",
  };
  return `apps/recipe-ai/src/data/catalog/${map[id] ?? "dishes/index.ts"}`;
}

function batchSourceFile(title: string, batch: "b1" | "b2g1" | "b2g2"): string {
  // Best-effort labeling by batch aggregator; group files hold the literals.
  if (batch === "b1") return "apps/recipe-ai/src/admin/arabBatch1Group{A|B|C}.ts (via arabBatch1Library.ts)";
  if (batch === "b2g1") {
    const g1a = ARAB_BATCH_2_GROUP_1.slice(0, 6).some((r) => r.canonicalTitle === title);
    return g1a
      ? "apps/recipe-ai/src/admin/arabBatch2Group1A.ts"
      : "apps/recipe-ai/src/admin/arabBatch2Group1B.ts";
  }
  const g2a = ARAB_BATCH_2_GROUP_2.slice(0, 6).some((r) => r.canonicalTitle === title);
  return g2a
    ? "apps/recipe-ai/src/admin/arabBatch2Group2A.ts"
    : "apps/recipe-ai/src/admin/arabBatch2Group2B.ts";
}

function fromGenerated(
  recipe: GeneratedRecipe,
  opts: {
    sourceLayer: "studio_seed" | "generation_only";
    sourceFile: string;
    studioDraftId: string | null;
    recipeQa: RecipeQaStore;
    photoReview: PhotoReviewStore;
    drafts: Record<string, DraftRecipeRecord>;
    liveIncluded: boolean;
  },
): ExportRecipe {
  const draftId = opts.studioDraftId;
  const runtimeDraft = draftId ? opts.drafts[draftId] ?? null : null;
  const sourceImage = recipe.photo.preparedImageUrl ?? null;
  const effectiveImage = runtimeDraft?.imageUrl ?? sourceImage;
  const imageUrl = effectiveImage;
  const focal =
    (imageUrl && IMAGE_FOCAL_POINTS[imageUrl.split("?")[0]!]) ||
    (sourceImage && IMAGE_FOCAL_POINTS[sourceImage]) ||
    null;

  // Effective dish for QA warnings: prefer runtime draft if present.
  const dishForAudit = runtimeDraft
    ? draftRecordToDish(runtimeDraft)
    : draftRecordToDish({
        id: draftId ?? `gen-${recipe.canonicalTitle}`,
        title: recipe.canonicalTitle,
        cuisineFamilyId: recipe.cuisineFamilyId,
        cuisineFolder:
          recipe.cuisineFamilyId === "central_european"
            ? "central-european"
            : recipe.cuisineFamilyId,
        prepMinutes: recipe.prepMinutes,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        mealTypes: [...recipe.mealTypes],
        mealSlotRole: recipe.mealSlotRole,
        suitability: [...recipe.suitability],
        specialness: 2,
        familiarity: 2,
        ingredientTokens: [...recipe.ingredientTokens],
        pantryIngredients: recipe.pantryIngredients.map((p) => ({
          ...p,
          tokens: [...p.tokens],
        })),
        allergens: [...recipe.allergens],
        mayContain: [...recipe.mayContain],
        allergenDeclared: recipe.allergenDeclared,
        dietaryTags: [...recipe.dietaryTags],
        mealIntents: [...recipe.mealIntents],
        budgetTier: recipe.budgetTier,
        proteinCategory: recipe.proteinCategory,
        moods: [...recipe.moods],
        ingredients: recipe.ingredients.map((i) => ({ ...i })),
        localeCopy: {
          en: { ...recipe.localeCopy.en },
          de: { ...recipe.localeCopy.de },
          ar: { ...recipe.localeCopy.ar },
          tr: { ...recipe.localeCopy.tr },
        },
        companionIds: [],
        naturalYield: { ...recipe.naturalYield },
        defaultRole: recipe.defaultRole,
        canServeAsMain: recipe.canServeAsMain,
        regionSubcuisine: recipe.regionSubcuisine,
        imageUrl: sourceImage ?? undefined,
        createdAt: "",
        updatedAt: "",
      });

  const findingKey = draftId ?? recipe.canonicalTitle;
  const known =
    (draftId && KNOWN_STUDIO_FINDINGS[draftId]) ||
    KNOWN_STUDIO_FINDINGS[findingKey] ||
    null;

  const recipeQaStatus =
    (draftId && opts.recipeQa[draftId]?.status) ||
    known?.recipeQaStatus ||
    (opts.sourceLayer === "generation_only" ? "not_in_studio" : "draft");

  const photoQaStatus =
    (draftId && opts.photoReview[draftId]) ||
    known?.suggestedPhotoQa ||
    "pending";

  const sourceLocales = localesFromGenerated(recipe);
  const effectiveLocales = runtimeDraft
    ? localesFromDish(dishForAudit, runtimeDraft.title)
    : sourceLocales;

  return {
    id: draftId ?? `generation-only:${recipe.canonicalTitle.toLowerCase().replace(/\s+/g, "-")}`,
    canonicalTitle: recipe.canonicalTitle,
    sourceLayer: opts.sourceLayer,
    sourceFile: opts.sourceFile,
    studioDraftId: draftId,
    cuisineFamilyId: recipe.cuisineFamilyId,
    cuisineFolder:
      recipe.cuisineFamilyId === "central_european"
        ? "central-european"
        : recipe.cuisineFamilyId,
    regionSubcuisine: recipe.regionSubcuisine,
    defaultRole: recipe.defaultRole,
    canServeAsMain: recipe.canServeAsMain,
    mealSlotRole: recipe.mealSlotRole,
    mealTypes: [...recipe.mealTypes],
    mealIntents: [...recipe.mealIntents],
    suitability: [...recipe.suitability],
    moods: [...recipe.moods],
    dietaryTags: [...recipe.dietaryTags],
    allergens: [...recipe.allergens],
    mayContain: [...recipe.mayContain],
    allergenDeclared: recipe.allergenDeclared,
    servings: runtimeDraft?.servings ?? recipe.servings,
    naturalYield: runtimeDraft?.naturalYield ?? recipe.naturalYield,
    prepMinutes: runtimeDraft?.prepMinutes ?? recipe.prepMinutes,
    difficulty: runtimeDraft?.difficulty ?? recipe.difficulty,
    specialness: runtimeDraft?.specialness ?? null,
    familiarity: runtimeDraft?.familiarity ?? null,
    proteinCategory: runtimeDraft?.proteinCategory ?? recipe.proteinCategory,
    budgetTier: runtimeDraft?.budgetTier ?? recipe.budgetTier,
    nutrition: { verified: false },
    imageFile: null,
    imageUrl,
    preparedImageUrl: sourceImage,
    imageFocalPoint: focal,
    recipeQaStatus,
    photoQaStatus,
    knownFindings: known,
    qaWarnings: auditRecipeContent(dishForAudit),
    locales: effectiveLocales,
    provenance: {
      sourceLayer: opts.sourceLayer,
      sourceFile: opts.sourceFile,
      hasRuntimeDraft: Boolean(runtimeDraft),
      hasRuntimeOverride: false,
      runtimeDraftId: draftId,
      liveLocalStorageIncluded: opts.liveIncluded,
    },
    sourceSnapshot: {
      canonicalTitle: recipe.canonicalTitle,
      prepMinutes: recipe.prepMinutes,
      servings: recipe.servings,
      difficulty: recipe.difficulty,
      preparedImageUrl: sourceImage,
      localeCopy: recipe.localeCopy,
      ingredients: recipe.ingredients,
      naturalYield: recipe.naturalYield,
      photo: recipe.photo,
    },
    effectiveSnapshot: runtimeDraft
      ? {
          note: "Runtime draft present — effective locales/fields reflect draftRecordToDish(runtimeDraft).",
          title: runtimeDraft.title,
          imageUrl: runtimeDraft.imageUrl ?? null,
          prepMinutes: runtimeDraft.prepMinutes,
          servings: runtimeDraft.servings,
        }
      : {
          note: "No runtime draft override — effective equals source.",
        },
    runtimeDraft,
    runtimeOverride: null,
  };
}

function fromConsumer(
  dish: DishCatalogEntry,
  opts: {
    recipeQa: RecipeQaStore;
    photoReview: PhotoReviewStore;
    overrides: RecipeStudioPersistedState["overrides"];
    liveIncluded: boolean;
  },
): ExportRecipe {
  const override = opts.overrides[dish.id] ?? null;
  // Overrides do not currently carry imageUrl; applyOverrideToCanonical is used in runtime.
  // For export we keep source dish as sourceSnapshot and note override presence.
  const known = KNOWN_STUDIO_FINDINGS[dish.id] ?? null;
  const recipeQaStatus =
    opts.recipeQa[dish.id]?.status || known?.recipeQaStatus || "approved_catalog_default";
  const photoQaStatus =
    opts.photoReview[dish.id] || known?.suggestedPhotoQa || "pending";
  const focal = IMAGE_FOCAL_POINTS[dish.imageUrl.split("?")[0]!] ?? null;
  const sourceFile = consumerSourceFile(dish.id);

  return {
    id: dish.id,
    canonicalTitle: dish.title,
    sourceLayer: "consumer",
    sourceFile,
    studioDraftId: null,
    cuisineFamilyId: dish.cuisineFamilyId,
    cuisineFolder: null,
    regionSubcuisine: null,
    defaultRole: null,
    canServeAsMain: null,
    mealSlotRole: dish.mealSlotRole,
    mealTypes: [...dish.mealTypes],
    mealIntents: [...dish.mealIntents],
    suitability: [...dish.suitability],
    moods: [...dish.moods],
    dietaryTags: [...dish.dietaryTags],
    allergens: [...dish.allergens],
    mayContain: [...dish.mayContain],
    allergenDeclared: dish.allergenDeclared,
    servings: dish.servings,
    naturalYield: null,
    prepMinutes: dish.prepMinutes,
    difficulty: dish.difficulty,
    specialness: dish.specialness,
    familiarity: dish.familiarity,
    proteinCategory: dish.proteinCategory,
    budgetTier: dish.budgetTier,
    nutrition: { verified: false, note: "No verified nutrition fields on consumer dishes" },
    imageFile: dish.id === "sumac-chicken" ? "musakhan-wraps" : null,
    imageUrl: dish.imageUrl,
    preparedImageUrl: null,
    imageFocalPoint: focal,
    recipeQaStatus,
    photoQaStatus,
    knownFindings: known,
    qaWarnings: auditRecipeContent(dish),
    locales: localesFromDish(dish, dish.title),
    provenance: {
      sourceLayer: "consumer",
      sourceFile,
      hasRuntimeDraft: false,
      hasRuntimeOverride: Boolean(override),
      runtimeDraftId: null,
      liveLocalStorageIncluded: opts.liveIncluded,
    },
    sourceSnapshot: {
      id: dish.id,
      title: dish.title,
      imageUrl: dish.imageUrl,
      prepMinutes: dish.prepMinutes,
      servings: dish.servings,
      content: dish.content,
    },
    effectiveSnapshot: override
      ? { note: "Runtime override present on consumer recipe", override }
      : { note: "No runtime override — effective equals source." },
    runtimeDraft: null,
    runtimeOverride: override,
  };
}

function main() {
  mkdirSync(EXPORT_DIR, { recursive: true });

  const studioRaw = loadJsonFile(RUNTIME_STUDIO_PATH) as RecipeStudioPersistedState | null;
  const photoRaw = loadJsonFile(RUNTIME_PHOTO_PATH) as PhotoReviewStore | null;
  const liveIncluded = Boolean(studioRaw);

  if (!liveIncluded) {
    console.error(
      "STOP: Live localStorage dump missing at",
      RUNTIME_STUDIO_PATH,
      "— cannot invent runtime state.",
    );
    process.exit(2);
  }

  const recipeQa = studioRaw!.recipeQa ?? {};
  const drafts = studioRaw!.drafts ?? {};
  const overrides = studioRaw!.overrides ?? {};
  const photoReview = photoRaw ?? {};

  const recipes: ExportRecipe[] = [];

  // 1) Consumer catalog (43)
  for (const dish of DISH_CATALOG) {
    recipes.push(
      fromConsumer(dish, {
        recipeQa,
        photoReview,
        overrides,
        liveIncluded,
      }),
    );
  }

  // 2) Studio seeds Batch 1 / 2 (43)
  for (const recipe of ARAB_BATCH_1) {
    recipes.push(
      fromGenerated(recipe, {
        sourceLayer: "studio_seed",
        sourceFile: batchSourceFile(recipe.canonicalTitle, "b1"),
        studioDraftId: arabBatch1DraftId(recipe),
        recipeQa,
        photoReview,
        drafts,
        liveIncluded,
      }),
    );
  }
  for (const recipe of ARAB_BATCH_2_GROUP_1) {
    recipes.push(
      fromGenerated(recipe, {
        sourceLayer: "studio_seed",
        sourceFile: batchSourceFile(recipe.canonicalTitle, "b2g1"),
        studioDraftId: arabBatch2Group1DraftId(recipe),
        recipeQa,
        photoReview,
        drafts,
        liveIncluded,
      }),
    );
  }
  for (const recipe of ARAB_BATCH_2_GROUP_2) {
    recipes.push(
      fromGenerated(recipe, {
        sourceLayer: "studio_seed",
        sourceFile: batchSourceFile(recipe.canonicalTitle, "b2g2"),
        studioDraftId: arabBatch2Group2DraftId(recipe),
        recipeQa,
        photoReview,
        drafts,
        liveIncluded,
      }),
    );
  }

  // 3) Generation-only: Baba Ghanouj + Yalanji
  const generationOnly = GENERATED_RECIPE_LIBRARY.filter(
    (r) =>
      r.canonicalTitle === "Baba Ghanouj" || r.canonicalTitle === "Yalanji",
  );
  for (const recipe of generationOnly) {
    // May exist as a draft if manually generated; prefer matching draft by title.
    const byTitle = Object.values(drafts).find(
      (d) => d.title.trim().toLowerCase() === recipe.canonicalTitle.trim().toLowerCase(),
    );
    recipes.push(
      fromGenerated(recipe, {
        sourceLayer: "generation_only",
        sourceFile: "apps/recipe-ai/src/admin/generatedRecipeLibrary.ts",
        studioDraftId: byTitle?.id ?? null,
        recipeQa,
        photoReview,
        drafts,
        liveIncluded,
      }),
    );
  }

  if (recipes.length !== 88) {
    console.error(`Expected 88 recipes, got ${recipes.length}`);
  }

  // Validation
  const ids = recipes.map((r) => r.id);
  const idCollisions = ids.filter((id, i) => ids.indexOf(id) !== i);
  const titles = recipes.map((r) => r.canonicalTitle.trim().toLowerCase());
  const titleCollisions = recipes
    .filter(
      (r, i) =>
        titles.indexOf(r.canonicalTitle.trim().toLowerCase()) !== i,
    )
    .map((r) => r.canonicalTitle);

  const missingTranslations = recipes.filter((r) => {
    for (const loc of ["en", "de", "ar", "tr"] as const) {
      const L = r.locales[loc];
      if (!L.reason || L.ingredients.length === 0 || L.steps.length === 0) return true;
    }
    return false;
  });

  const weakSteps = recipes.filter((r) => r.locales.en.steps.length < 3);
  const missingImages = recipes.filter(
    (r) => isPlaceholderImage(r.imageUrl) && isPlaceholderImage(r.preparedImageUrl),
  );
  const withRuntimeOverride = recipes.filter(
    (r) => r.provenance.hasRuntimeOverride || r.provenance.hasRuntimeDraft,
  );
  // hasRuntimeDraft is true for all seeded drafts that exist in LS — count overrides separately
  const withOverrides = recipes.filter((r) => r.provenance.hasRuntimeOverride);
  const withRuntimeDraftPresent = recipes.filter((r) => r.provenance.hasRuntimeDraft);

  const nutritionUnverified = recipes.filter((r) => {
    const n = r.nutrition as { verified?: boolean } | null;
    return !n || n.verified === false;
  });

  const knownNearDupes = [
    ...ARAB_BATCH_2_GROUP_2_SKIPPED.map((s) => ({
      kind: "skipped_near_duplicate",
      title: s.title,
      reason: s.reason,
      existingMatch: s.existingMatch,
    })),
    ...ARAB_BATCH_2_GROUP_1_SKIPPED_EXISTING.map((t) => ({
      kind: "skipped_existing",
      title: t,
      reason: "Already exists in Batch 1 — intentionally omitted from Batch 2 Group 1.",
      existingMatch: t,
    })),
    {
      kind: "intentional_family_pair",
      title: "Musakhan Wraps (sumac-chicken) vs Palestinian Musakhan",
      reason: "Distinct wrap vs traditional taboon Musakhan; not a duplicate.",
      existingMatch: "draft-arab-batch1-musakhan / sumac-chicken",
    },
    {
      kind: "intentional_family_pair",
      title: "Syrian Meat Maqluba vs Palestinian Maqluba",
      reason: "Distinct regional variants (no cauliflower vs cauliflower).",
      existingMatch: "draft-arab-batch1 + draft-arab-batch2-g1",
    },
  ];

  const full = {
    exportedAt: new Date().toISOString(),
    purpose: "READ-ONLY ShareYum catalog export for external recipe/content QA",
    liveLocalStorageIncluded: liveIncluded,
    localStorageKeys: {
      studio: "shareyum-recipe-studio-v2",
      photoReview: "shareyum-admin-photo-review-v1",
    },
    runtimeSnapshotStats: {
      drafts: Object.keys(drafts).length,
      overrides: Object.keys(overrides).length,
      recipeQaEntries: Object.keys(recipeQa).length,
      photoReviewEntries: Object.keys(photoReview).length,
    },
    totals: {
      expected: 88,
      exported: recipes.length,
      consumer: recipes.filter((r) => r.sourceLayer === "consumer").length,
      studio_seed: recipes.filter((r) => r.sourceLayer === "studio_seed").length,
      generation_only: recipes.filter((r) => r.sourceLayer === "generation_only").length,
    },
    validation: {
      idCollisions: [...new Set(idCollisions)],
      titleCollisions: [...new Set(titleCollisions)],
      missingTranslationsCount: missingTranslations.length,
      missingTranslationIds: missingTranslations.map((r) => r.id),
      weakStepsCount: weakSteps.length,
      weakStepIds: weakSteps.map((r) => ({
        id: r.id,
        title: r.canonicalTitle,
        enStepCount: r.locales.en.steps.length,
      })),
      missingImagesCount: missingImages.length,
      missingImageIds: missingImages.map((r) => ({
        id: r.id,
        title: r.canonicalTitle,
        imageUrl: r.imageUrl,
        preparedImageUrl: r.preparedImageUrl,
      })),
      nutritionUnverifiedCount: nutritionUnverified.length,
      runtimeOverridesCount: withOverrides.length,
      runtimeDraftsPresentCount: withRuntimeDraftPresent.length,
      knownNearDuplicates: knownNearDupes,
    },
    recipes,
  };

  const summary = {
    exportedAt: full.exportedAt,
    verifiedTotal: recipes.length,
    liveLocalStorageIncluded: liveIncluded,
    runtimeSnapshotStats: full.runtimeSnapshotStats,
    totals: full.totals,
    validation: full.validation,
    recipes: recipes.map((r) => ({
      id: r.id,
      canonicalTitle: r.canonicalTitle,
      sourceLayer: r.sourceLayer,
      sourceFile: r.sourceFile,
      studioDraftId: r.studioDraftId,
      recipeQaStatus: r.recipeQaStatus,
      photoQaStatus: r.photoQaStatus,
      hasImage: !isPlaceholderImage(r.imageUrl) || !isPlaceholderImage(r.preparedImageUrl),
      imageUrl: r.imageUrl,
      preparedImageUrl: r.preparedImageUrl,
      localeCompleteness: {
        en: Boolean(r.locales.en.reason && r.locales.en.ingredients.length && r.locales.en.steps.length),
        de: Boolean(r.locales.de.reason && r.locales.de.ingredients.length && r.locales.de.steps.length),
        ar: Boolean(r.locales.ar.reason && r.locales.ar.ingredients.length && r.locales.ar.steps.length),
        tr: Boolean(r.locales.tr.reason && r.locales.tr.ingredients.length && r.locales.tr.steps.length),
      },
      ingredientCountEn: r.locales.en.ingredients.length,
      stepCountEn: r.locales.en.steps.length,
      hasRuntimeOverride: r.provenance.hasRuntimeOverride,
      hasRuntimeDraft: r.provenance.hasRuntimeDraft,
      qaWarningCodes: (r.qaWarnings as Array<{ code: string }>).map((w) => w.code),
    })),
  };

  const fullPath = join(EXPORT_DIR, "shareyum-catalog-88-full.json");
  const summaryPath = join(EXPORT_DIR, "shareyum-catalog-88-summary.json");
  writeFileSync(fullPath, JSON.stringify(full, null, 2), "utf8");
  writeFileSync(summaryPath, JSON.stringify(summary, null, 2), "utf8");

  console.log(JSON.stringify({
    fullPath,
    summaryPath,
    exported: recipes.length,
    liveLocalStorageIncluded: liveIncluded,
    overrides: withOverrides.length,
    runtimeDrafts: withRuntimeDraftPresent.length,
    missingImages: missingImages.length,
    missingTranslations: missingTranslations.length,
    weakSteps: weakSteps.length,
    idCollisions: [...new Set(idCollisions)],
    titleCollisions: [...new Set(titleCollisions)],
  }, null, 2));
}

main();
