import type { SeedIngredient } from "../data/catalog/buildDish";
import { DISH_CATALOG, getDishById, listAllDishes } from "../data/catalog/dishes";
import { NEEDS_PHOTO_PLACEHOLDER_PATH } from "../data/catalog/imageAssets";
import type { DishCatalogEntry } from "../data/catalog/types";
import type { AppLocale } from "../i18n/types";
import { getPhotoReviewStatus, type PhotoReviewStatus } from "./recipePhotoReview";
import { getRecipeQaEntry } from "./recipeQaReview";
import {
  buildLocalizedContent,
  type DraftRecipeRecord,
  type DraftRecipeStore,
  type RecipeContentOverride,
  type RecipeOverrideStore,
  type RecipeQaStore,
  type StudioEditableIngredient,
  type StudioRecipeView,
} from "./recipeStudioTypes";

const LOCALES: AppLocale[] = ["en", "de", "ar", "tr"];

export function isDraftRecipeId(id: string, drafts: DraftRecipeStore): boolean {
  return Boolean(drafts[id]);
}

export function listDraftRecipeIds(drafts: DraftRecipeStore): string[] {
  return Object.keys(drafts).sort();
}

export function canonicalIngredientsToEditable(
  dish: DishCatalogEntry,
): StudioEditableIngredient[] {
  const en = dish.content.en.ingredients;
  return en.map((ing) => {
    const de = dish.content.de.ingredients.find((x) => x.id === ing.id);
    const ar = dish.content.ar.ingredients.find((x) => x.id === ing.id);
    const tr = dish.content.tr.ingredients.find((x) => x.id === ing.id);
    return {
      id: ing.id,
      en: ing.name,
      de: de?.name ?? ing.name,
      ar: ar?.name ?? ing.name,
      tr: tr?.name ?? ing.name,
      detailEn: ing.detail,
      detailDe: de?.detail ?? ing.detail,
      detailAr: ar?.detail ?? ing.detail,
      detailTr: tr?.detail ?? ing.detail,
      status: ing.status,
    };
  });
}

export function localeCopyFromDish(dish: DishCatalogEntry) {
  return {
    en: {
      reason: dish.content.en.reason,
      reasonGuests: dish.content.en.reasonGuests,
      cuisineLabel: dish.content.en.cuisineLabel,
      tips: dish.content.en.tips,
      storageTip: dish.content.en.storageTip,
      steps: dish.content.en.steps.map((s) => s.instruction),
    },
    de: {
      reason: dish.content.de.reason,
      reasonGuests: dish.content.de.reasonGuests,
      cuisineLabel: dish.content.de.cuisineLabel,
      tips: dish.content.de.tips,
      storageTip: dish.content.de.storageTip,
      steps: dish.content.de.steps.map((s) => s.instruction),
    },
    ar: {
      reason: dish.content.ar.reason,
      reasonGuests: dish.content.ar.reasonGuests,
      cuisineLabel: dish.content.ar.cuisineLabel,
      tips: dish.content.ar.tips,
      storageTip: dish.content.ar.storageTip,
      steps: dish.content.ar.steps.map((s) => s.instruction),
    },
    tr: {
      reason: dish.content.tr.reason,
      reasonGuests: dish.content.tr.reasonGuests,
      cuisineLabel: dish.content.tr.cuisineLabel,
      tips: dish.content.tr.tips,
      storageTip: dish.content.tr.storageTip,
      steps: dish.content.tr.steps.map((s) => s.instruction),
    },
  };
}

function applyOverrideToCanonical(
  base: DishCatalogEntry,
  override?: RecipeContentOverride,
): DishCatalogEntry {
  if (!override) return base;

  const ingredients =
    override.ingredients ?? canonicalIngredientsToEditable(base);
  const localeBase = localeCopyFromDish(base);
  const localeCopy = { ...localeBase };
  if (override.localeCopy) {
    for (const locale of LOCALES) {
      if (override.localeCopy[locale]) {
        localeCopy[locale] = {
          ...localeCopy[locale],
          ...override.localeCopy[locale],
        };
      }
    }
  }

  const content = {
    en: buildLocalizedContent("en", ingredients, localeCopy.en),
    de: buildLocalizedContent("de", ingredients, localeCopy.de),
    ar: buildLocalizedContent("ar", ingredients, localeCopy.ar),
    tr: buildLocalizedContent("tr", ingredients, localeCopy.tr),
  };

  return {
    ...base,
    title: override.title ?? base.title,
    prepMinutes: override.prepMinutes ?? base.prepMinutes,
    servings: override.servings ?? base.servings,
    difficulty: override.difficulty ?? base.difficulty,
    cuisineFamilyId: override.cuisineFamilyId ?? base.cuisineFamilyId,
    mealTypes: override.mealTypes ?? base.mealTypes,
    mealSlotRole: override.mealSlotRole ?? base.mealSlotRole,
    mealIntents: override.mealIntents ?? base.mealIntents,
    budgetTier: override.budgetTier ?? base.budgetTier,
    proteinCategory: override.proteinCategory ?? base.proteinCategory,
    suitability: override.suitability ?? base.suitability,
    specialness: override.specialness ?? base.specialness,
    familiarity: override.familiarity ?? base.familiarity,
    ingredientTokens: override.ingredientTokens ?? base.ingredientTokens,
    pantryIngredients: override.pantryIngredients ?? base.pantryIngredients,
    allergens: override.allergens ?? base.allergens,
    mayContain: override.mayContain ?? base.mayContain,
    allergenDeclared: override.allergenDeclared ?? base.allergenDeclared,
    dietaryTags: override.dietaryTags ?? base.dietaryTags,
    content,
  };
}

export function draftRecordToDish(draft: DraftRecipeRecord): DishCatalogEntry {
  const imageUrl =
    draft.imageUrl ??
    `${NEEDS_PHOTO_PLACEHOLDER_PATH}?recipe=${encodeURIComponent(draft.id)}`;

  return {
    id: draft.id,
    cuisineFamilyId: draft.cuisineFamilyId,
    title: draft.title,
    imageUrl,
    prepMinutes: draft.prepMinutes,
    servings: draft.servings,
    difficulty: draft.difficulty,
    mealTypes: draft.mealTypes,
    suitability: draft.suitability,
    specialness: draft.specialness,
    familiarity: draft.familiarity,
    ingredientTokens: draft.ingredientTokens,
    pantryIngredients: draft.pantryIngredients,
    allergens: draft.allergens,
    mayContain: draft.mayContain,
    allergenDeclared: draft.allergenDeclared,
    mealSlotRole: draft.mealSlotRole,
    dietaryTags: draft.dietaryTags,
    mealIntents: draft.mealIntents,
    budgetTier: draft.budgetTier,
    proteinCategory: draft.proteinCategory,
    moods: draft.moods,
    content: {
      en: buildLocalizedContent("en", draft.ingredients, draft.localeCopy.en),
      de: buildLocalizedContent("de", draft.ingredients, draft.localeCopy.de),
      ar: buildLocalizedContent("ar", draft.ingredients, draft.localeCopy.ar),
      tr: buildLocalizedContent("tr", draft.ingredients, draft.localeCopy.tr),
    },
  };
}

export function listStudioRecipes(
  overrides: RecipeOverrideStore,
  drafts: DraftRecipeStore,
): DishCatalogEntry[] {
  const canonical = listAllDishes().map((dish) =>
    applyOverrideToCanonical(dish, overrides[dish.id]),
  );
  const draftDishes = Object.values(drafts).map(draftRecordToDish);
  return [...canonical, ...draftDishes];
}

export function getStudioRecipeById(
  recipeId: string,
  overrides: RecipeOverrideStore,
  drafts: DraftRecipeStore,
): DishCatalogEntry | undefined {
  if (drafts[recipeId]) return draftRecordToDish(drafts[recipeId]);
  const canonical = getDishById(recipeId);
  if (!canonical) return undefined;
  return applyOverrideToCanonical(canonical, overrides[recipeId]);
}

export function toStudioRecipeView(
  dish: DishCatalogEntry,
  options: {
    studioSource: "canonical" | "draft";
    recipeQa: RecipeQaStore;
    photoReview: Record<string, PhotoReviewStatus>;
  },
): StudioRecipeView {
  const isDraft = options.studioSource === "draft";
  return {
    ...dish,
    studioSource: options.studioSource,
    isDraft,
    recipeQaStatus: getRecipeQaEntry(options.recipeQa, dish.id, {
      isDraft,
      isCanonical: !isDraft,
    }).status,
    photoQaStatus: getPhotoReviewStatus(options.photoReview, dish.id),
  };
}

export function listStudioRecipeViews(
  overrides: RecipeOverrideStore,
  drafts: DraftRecipeStore,
  recipeQa: RecipeQaStore,
  photoReview: Record<string, PhotoReviewStatus>,
): StudioRecipeView[] {
  const canonical = listAllDishes().map((dish) =>
    toStudioRecipeView(
      applyOverrideToCanonical(dish, overrides[dish.id]),
      { studioSource: "canonical", recipeQa, photoReview },
    ),
  );
  const draftViews = Object.values(drafts).map((draft) =>
    toStudioRecipeView(draftRecordToDish(draft), {
      studioSource: "draft",
      recipeQa,
      photoReview,
    }),
  );
  return [...canonical, ...draftViews];
}

/** Consumer catalog ids — drafts and studio-only ids must never appear here. */
export function listConsumerCatalogIds(): string[] {
  return DISH_CATALOG.map((d) => d.id);
}

export function dishToContentOverride(
  dish: DishCatalogEntry,
): RecipeContentOverride {
  return {
    title: dish.title,
    prepMinutes: dish.prepMinutes,
    servings: dish.servings,
    difficulty: dish.difficulty,
    cuisineFamilyId: dish.cuisineFamilyId,
    mealTypes: [...dish.mealTypes],
    mealSlotRole: dish.mealSlotRole,
    mealIntents: [...dish.mealIntents],
    budgetTier: dish.budgetTier,
    proteinCategory: dish.proteinCategory,
    suitability: [...dish.suitability],
    specialness: dish.specialness,
    familiarity: dish.familiarity,
    ingredientTokens: [...dish.ingredientTokens],
    pantryIngredients: [...dish.pantryIngredients],
    allergens: [...dish.allergens],
    mayContain: [...dish.mayContain],
    allergenDeclared: dish.allergenDeclared,
    dietaryTags: [...dish.dietaryTags],
    ingredients: canonicalIngredientsToEditable(dish),
    localeCopy: localeCopyFromDish(dish),
    updatedAt: new Date().toISOString(),
  };
}

export function dishToDraftRecord(dish: DishCatalogEntry): DraftRecipeRecord {
  const now = new Date().toISOString();
  const copy = localeCopyFromDish(dish);
  return {
    id: dish.id,
    title: dish.title,
    cuisineFamilyId: dish.cuisineFamilyId,
    cuisineFolder: dish.cuisineFamilyId === "central_european" ? "central-european" : dish.cuisineFamilyId,
    prepMinutes: dish.prepMinutes,
    servings: dish.servings,
    difficulty: dish.difficulty,
    mealTypes: [...dish.mealTypes],
    mealSlotRole: dish.mealSlotRole,
    suitability: [...dish.suitability],
    specialness: dish.specialness,
    familiarity: dish.familiarity,
    ingredientTokens: [...dish.ingredientTokens],
    pantryIngredients: [...dish.pantryIngredients],
    allergens: [...dish.allergens],
    mayContain: [...dish.mayContain],
    allergenDeclared: dish.allergenDeclared,
    dietaryTags: [...dish.dietaryTags],
    mealIntents: [...dish.mealIntents],
    budgetTier: dish.budgetTier,
    proteinCategory: dish.proteinCategory,
    moods: [...dish.moods],
    ingredients: canonicalIngredientsToEditable(dish),
    localeCopy: copy,
    companionIds: [],
    imageUrl: dish.imageUrl,
    createdAt: now,
    updatedAt: now,
  };
}

export type { SeedIngredient };
