/**
 * Client-safe ShareYum API DTOs for future SPA integration (A2.5+).
 * No scoring weights, rule trees, or engine metadata.
 */
export type MealFeedbackRatingDto = "loved" | "good" | "not-for-us";

export type InventoryStatusDto = "have" | "need";

export type InventoryItemDto = {
  id: string;
  name: string;
  detail: string;
  status: InventoryStatusDto;
  freshness?: string;
};

export type RecipeStepDto = {
  order: number;
  instruction: string;
  timerMinutes?: number;
};

export type MealRecommendationDto = {
  id: string;
  title: string;
  reason: string;
  prepMinutes: number;
  imageUrl?: string;
  cuisine: string;
  ingredients: InventoryItemDto[];
  steps: RecipeStepDto[];
  tips: string[];
  storageTip: string;
};

export type TonightEmptyResponseDto = {
  status: "empty";
  code: "NO_SAFE_MEAL" | "NO_MORE_TONIGHT_OPTIONS";
  message: string;
};

export type HouseholdDietaryRequirementsDto = {
  requirePorkFree: boolean;
  requireAlcoholFree: boolean;
  requireVegetarian: boolean;
  requireVegan: boolean;
  applyConservativeHalalRules: boolean;
};

/** Canonical allergen codes — client sends/receives codes only at API boundary. */
export type AllergenCodeDto =
  | "celery"
  | "cereals_gluten"
  | "crustaceans"
  | "eggs"
  | "fish"
  | "lupin"
  | "milk"
  | "molluscs"
  | "mustard"
  | "nuts"
  | "peanuts"
  | "sesame"
  | "soy"
  | "sulphites";

export type UpsertHouseholdFoodProfileRequestDto = {
  allergenCodes: AllergenCodeDto[];
  dietary: HouseholdDietaryRequirementsDto;
};
