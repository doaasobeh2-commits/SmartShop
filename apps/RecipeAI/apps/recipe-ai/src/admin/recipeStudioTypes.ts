/** Recipe Studio — shared types (admin-only, not consumer catalog). */

import type { CuisineFamilyId } from "@recipe-ai/core/types";
import type { AppLocale } from "../i18n/types";
import type {
  BudgetTier,
  CatalogAllergen,
  DietaryTag,
  DishCatalogEntry,
  DishDifficulty,
  LocalizedDishContent,
  MealIntentTag,
  MealSlotRole,
  MealType,
  PantryIngredient,
  ProteinCategory,
  SuitabilityTag,
} from "../data/catalog/types";
import type { PhotoReviewStatus } from "./recipePhotoReview";

export type RecipeQaStatus = "draft" | "needs_correction" | "approved";

export type StudioRecipeSource = "canonical" | "draft";

/** Natural yield model — informational for launch; no consumer auto-scaling. */
export type NaturalYieldModel = {
  baseServingsMin?: number;
  baseServingsMax?: number;
  servingLabel?: string;
  scalingNote?: string;
};

/** Minimal meal-role model — normal identity/use of a dish (not preference). */
export type DefaultMealRole = "main" | "side";

export type DraftCreationInput = {
  dishName: string;
  cuisineFamilyId: CuisineFamilyId;
  regionSubcuisine?: string;
  adminNote?: string;
};

export type CropPreference = "center" | "top" | "bottom";

export type StudioEditableIngredient = {
  id: string;
  en: string;
  de: string;
  ar: string;
  tr: string;
  detailEn: string;
  detailDe: string;
  detailAr: string;
  detailTr: string;
  status?: "have" | "need";
};

export type StudioLocaleCopy = {
  reason: string;
  reasonGuests?: string;
  cuisineLabel: string;
  tips: string[];
  storageTip: string;
  steps: string[];
};

export type RecipeQaEntry = {
  status: RecipeQaStatus;
  notes?: string;
};

export type RecipeQaStore = Record<string, RecipeQaEntry>;

export type VerifiedNutritionPlaceholder = {
  verified: false;
  calories?: never;
  protein?: never;
  carbs?: never;
  fat?: never;
  fiber?: never;
  salt?: never;
};

export type StudioPhotoMetadata = {
  imagePrompt?: string;
  platingNotes?: string;
  culturalAuthenticityNotes?: string;
  replacementReason?: string;
  focalPointX?: number;
  focalPointY?: number;
  cropPreference?: CropPreference;
  imageQualityGuidance?: string;
};

export type RevisionRequestRecord = {
  instruction: string;
  areas: string[];
  requestedAt: string;
};

export type StudioRecipeMetadata = StudioPhotoMetadata & {
  nutrition: VerifiedNutritionPlaceholder;
  culturalReviewNote?: string;
  naturalYield?: NaturalYieldModel;
  regionSubcuisine?: string;
  creationNote?: string;
  lastAiPromptJson?: string;
  /** Admin "Request changes" feedback history (audit trail). */
  revisionRequests?: RevisionRequestRecord[];
};

export type StudioMetadataStore = Record<string, StudioRecipeMetadata>;

/** Partial admin edits layered on canonical catalog entries. */
export type RecipeContentOverride = {
  title?: string;
  prepMinutes?: number;
  servings?: number;
  difficulty?: DishDifficulty;
  cuisineFamilyId?: CuisineFamilyId;
  mealTypes?: MealType[];
  mealSlotRole?: MealSlotRole;
  mealIntents?: MealIntentTag[];
  budgetTier?: BudgetTier;
  proteinCategory?: ProteinCategory;
  suitability?: SuitabilityTag[];
  specialness?: 1 | 2 | 3;
  familiarity?: 1 | 2 | 3;
  ingredientTokens?: string[];
  pantryIngredients?: PantryIngredient[];
  allergens?: CatalogAllergen[];
  mayContain?: CatalogAllergen[];
  allergenDeclared?: boolean;
  dietaryTags?: DietaryTag[];
  ingredients?: StudioEditableIngredient[];
  localeCopy?: Partial<Record<AppLocale, Partial<StudioLocaleCopy>>>;
  companionIds?: string[];
  naturalYield?: NaturalYieldModel;
  defaultRole?: DefaultMealRole;
  canServeAsMain?: boolean;
  updatedAt?: string;
};

export type RecipeOverrideStore = Record<string, RecipeContentOverride>;

/** Full draft recipe — never merged into DISH_CATALOG automatically. */
export type DraftRecipeRecord = {
  id: string;
  title: string;
  cuisineFamilyId: CuisineFamilyId;
  cuisineFolder: string;
  prepMinutes: number;
  servings: number;
  difficulty: DishDifficulty;
  mealTypes: MealType[];
  mealSlotRole: MealSlotRole;
  suitability: SuitabilityTag[];
  specialness: 1 | 2 | 3;
  familiarity: 1 | 2 | 3;
  ingredientTokens: string[];
  pantryIngredients: PantryIngredient[];
  allergens: CatalogAllergen[];
  mayContain: CatalogAllergen[];
  allergenDeclared: boolean;
  dietaryTags: DietaryTag[];
  mealIntents: MealIntentTag[];
  budgetTier: BudgetTier;
  proteinCategory: ProteinCategory;
  moods: DishCatalogEntry["moods"];
  ingredients: StudioEditableIngredient[];
  localeCopy: Record<AppLocale, StudioLocaleCopy>;
  companionIds: string[];
  naturalYield?: NaturalYieldModel;
  defaultRole?: DefaultMealRole;
  canServeAsMain?: boolean;
  regionSubcuisine?: string;
  creationNote?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export type DraftRecipeStore = Record<string, DraftRecipeRecord>;

export type StudioRecipeView = DishCatalogEntry & {
  studioSource: StudioRecipeSource;
  isDraft: boolean;
  recipeQaStatus: RecipeQaStatus;
  photoQaStatus: PhotoReviewStatus;
};

export const STUDIO_STORAGE_VERSION = 3;

export type RecipeStudioPersistedState = {
  version: typeof STUDIO_STORAGE_VERSION;
  recipeQa: RecipeQaStore;
  overrides: RecipeOverrideStore;
  drafts: DraftRecipeStore;
  metadata: StudioMetadataStore;
};

export const RECIPE_STUDIO_STORAGE_KEY = "shareyum-recipe-studio-v2";

export const DEFAULT_NUTRITION_PLACEHOLDER: VerifiedNutritionPlaceholder = {
  verified: false,
};

export function emptyStudioMetadata(): StudioRecipeMetadata {
  return { nutrition: DEFAULT_NUTRITION_PLACEHOLDER };
}

export function defaultLocaleCopy(): StudioLocaleCopy {
  return {
    reason: "",
    cuisineLabel: "",
    tips: [],
    storageTip: "",
    steps: [],
  };
}

export function createDraftFromCreationInput(
  id: string,
  input: DraftCreationInput,
): DraftRecipeRecord {
  const draft = emptyDraftRecord(id);
  draft.title = input.dishName.trim();
  draft.cuisineFamilyId = input.cuisineFamilyId;
  draft.cuisineFolder =
    input.cuisineFamilyId === "central_european"
      ? "central-european"
      : input.cuisineFamilyId;
  draft.regionSubcuisine = input.regionSubcuisine;
  draft.creationNote = input.adminNote;
  draft.localeCopy.en.cuisineLabel = input.regionSubcuisine ?? input.cuisineFamilyId;
  draft.localeCopy.en.reason = input.adminNote ?? "";
  return draft;
}

export function emptyDraftRecord(id: string): DraftRecipeRecord {
  const now = new Date().toISOString();
  const blank = defaultLocaleCopy();
  return {
    id,
    title: "Untitled draft",
    cuisineFamilyId: "arab",
    cuisineFolder: "arab",
    prepMinutes: 30,
    servings: 4,
    difficulty: "easy",
    mealTypes: ["main"],
    mealSlotRole: "dinner_complete",
    suitability: ["everyday_host"],
    specialness: 2,
    familiarity: 2,
    ingredientTokens: [],
    pantryIngredients: [],
    allergens: [],
    mayContain: [],
    allergenDeclared: true,
    dietaryTags: ["vegetarian_ok", "vegan_ok"],
    mealIntents: ["family_friendly"],
    budgetTier: "medium",
    proteinCategory: "mixed",
    moods: ["everyday"],
    ingredients: [],
    localeCopy: {
      en: { ...blank },
      de: { ...blank },
      ar: { ...blank },
      tr: { ...blank },
    },
    companionIds: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function buildLocalizedContent(
  locale: AppLocale,
  ingredients: StudioEditableIngredient[],
  copy: StudioLocaleCopy,
): LocalizedDishContent {
  return {
    reason: copy.reason,
    reasonGuests: copy.reasonGuests,
    cuisineLabel: copy.cuisineLabel,
    ingredients: ingredients.map((ing) => ({
      id: ing.id,
      name:
        locale === "en"
          ? ing.en
          : locale === "de"
            ? ing.de
            : locale === "ar"
              ? ing.ar
              : ing.tr,
      detail:
        locale === "en"
          ? ing.detailEn
          : locale === "de"
            ? ing.detailDe
            : locale === "ar"
              ? ing.detailAr
              : ing.detailTr,
      status: ing.status ?? "need",
    })),
    steps: copy.steps.map((instruction, index) => ({
      order: index + 1,
      instruction,
    })),
    tips: copy.tips,
    storageTip: copy.storageTip,
  };
}
