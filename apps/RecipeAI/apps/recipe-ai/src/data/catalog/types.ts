import type {
  CuisineFamilyId,
  TonightMealIntent,
  TonightOccasion,
} from "@recipe-ai/core/types";
import type { AppLocale } from "../../i18n/types";

export type DishMood = "everyday" | "special" | "quick";
export type DishDifficulty = "easy" | "medium";
export type MealType = "salad" | "soup" | "main" | "side" | "rice" | "stew";
/** Dinner slot eligibility — structured, not name-based. */
export type MealSlotRole = "dinner_complete" | "side_component" | "light_meal";

/**
 * Curated meal-intent tags for Decision Engine ranking.
 * Not a giant UI settings screen — used internally (and as weekly day chips).
 */
export type MealIntentTag =
  | "budget"
  | "healthy"
  | "high_calorie"
  | "special"
  | "quick"
  | "family_friendly";

/**
 * Catalog-relative economical suitability — NOT live supermarket pricing.
 * SmartShop may later replace/augment with real local prices.
 */
export type BudgetTier = "low" | "medium" | "premium";

/** Coarse protein/structure signal for weekly rhythm — not macros. */
export type ProteinCategory =
  | "chicken"
  | "beef"
  | "lamb"
  | "fish"
  | "egg"
  | "legume"
  | "dairy"
  | "vegetable"
  | "mixed"
  | "none";

/** User-selectable weekly day intent (or let the engine choose). */
export type DayPlanIntent =
  | "auto"
  | "budget"
  | "healthy"
  | "light"
  | "high_calorie"
  | "special"
  | "quick"
  | "vegetarian";

export type SuitabilityTag =
  | "guest_friendly"
  | "everyday_host"
  | "celebration_light"
  | "shareable";
/** Dietary facts used by the hard safety gate (deterministic, catalog-derived). */
export type DietaryTag =
  | "contains_meat"
  | "contains_pork"
  | "contains_alcohol"
  | "contains_fish"
  | "contains_dairy"
  | "contains_egg"
  | "vegetarian_ok"
  | "vegan_ok";

/** Pantry matching roles — critical drives coverage; garnish is weak signal. */
export type IngredientRole = "critical" | "supporting" | "optional" | "garnish";

export type PantryIngredient = {
  canonicalId: string;
  role: IngredientRole;
  /** Match tokens (lowercase) */
  tokens: string[];
};

export type DayRole =
  | "quick"
  | "balanced"
  | "vegetable_forward"
  | "comfort"
  | "family_familiar"
  | "protein_shift"
  | "controlled_discovery";

export type CatalogAllergen =
  | "Gluten"
  | "Dairy"
  | "Eggs"
  | "Nuts"
  | "Peanuts"
  | "Fish"
  | "Shellfish"
  | "Soy"
  | "Sesame";

export type CuisineBridge = {
  hostCuisineId: CuisineFamilyId;
  guestCuisineId: CuisineFamilyId;
};

export type LocalizedDishContent = {
  reason: string;
  reasonGuests?: string;
  cuisineLabel: string;
  ingredients: Array<{
    id: string;
    name: string;
    detail: string;
    status: "have" | "need";
    freshness?: string;
  }>;
  steps: Array<{ order: number; instruction: string; timerMinutes?: number }>;
  tips: string[];
  storageTip: string;
};

export type DishCatalogEntry = {
  id: string;
  cuisineFamilyId: CuisineFamilyId;
  /** Recognizable dish name — may stay in original language in all UIs */
  title: string;
  imageUrl: string;
  prepMinutes: number;
  servings: number;
  difficulty: DishDifficulty;
  mealTypes: MealType[];
  suitability: SuitabilityTag[];
  /** 1 = everyday familiar, 3 = more distinctive */
  specialness: 1 | 2 | 3;
  /** How familiar for a host who cooks this cuisine (1 = very familiar) */
  familiarity: 1 | 2 | 3;
  /** Lowercase tokens for local pantry matching (demo) */
  ingredientTokens: string[];
  /** Structured pantry roles — preferred over flat tokens when present */
  pantryIngredients: PantryIngredient[];
  /** Curated host↔guest bridges only — never invented fusion */
  bridges?: CuisineBridge[];
  /**
   * Declared allergen contains list. Empty array means curated “none of the
   * tracked allergens” — not “unknown”. Missing declaration fails closed.
   */
  allergens: CatalogAllergen[];
  /** Cross-contamination / may-contain — also hard-blocked in V1. */
  mayContain: CatalogAllergen[];
  /** False → dish is ineligible (fail-closed unknown metadata). */
  allergenDeclared: boolean;
  /** Dinner vs component role for Tonight / Weekly Plan slots. */
  mealSlotRole: MealSlotRole;
  dietaryTags: DietaryTag[];
  /** Curated intent tags — see mealIntentMeta honesty notes. */
  mealIntents: MealIntentTag[];
  /** Catalog-relative budget band — not live price. */
  budgetTier: BudgetTier;
  proteinCategory: ProteinCategory;
  moods: DishMood[];
  content: Record<AppLocale, LocalizedDishContent>;
};

export type TonightSelectionInput = {
  locale: AppLocale;
  hostCuisineIds: CuisineFamilyId[];
  occasion: TonightOccasion;
  intent?: TonightMealIntent;
  guestPrimaryCuisineId?: CuisineFamilyId;
  guestPreferredCuisineIds?: CuisineFamilyId[];
  allergies?: string[];
  excludeRecipeIds?: string[];
};

export type TonightDecisionSource = "weekly-plan" | "resolver";

export type TonightDecisionResult = {
  candidateIds: string[];
  source: TonightDecisionSource;
  plannedRecipeId?: string;
  /** true when safety removed everything; false when coverage gap */
  safetyBlocked: boolean;
};
