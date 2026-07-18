import type { RecipeAllergenDeclaration } from "../contracts/allergenCodes";
import type { RecipeDietaryFacts } from "../contracts/dietaryFacts";
import type {
  CuisineFamilyId,
  CuisineSubregionId,
  IsoCountryCode,
  MealStyleId,
  ShareYumLocale,
} from "../taxonomy/ids";

export const CATALOG_RECIPE_STATUSES = ["draft", "published", "deprecated"] as const;
export type CatalogRecipeStatus = (typeof CATALOG_RECIPE_STATUSES)[number];

export const MEAL_TYPES = [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
  "dessert",
  "drink",
] as const;
export type MealType = (typeof MEAL_TYPES)[number];

export const PROTEIN_FAMILIES = [
  "chicken",
  "beef",
  "lamb",
  "fish",
  "seafood",
  "pork",
  "legumes",
  "eggs",
  "dairy",
  "mixed",
  "none",
] as const;
export type ProteinFamily = (typeof PROTEIN_FAMILIES)[number];

export const DIFFICULTY_LEVELS = ["easy", "medium", "advanced"] as const;
export type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[number];

export const COST_BANDS = ["low", "medium", "high"] as const;
export type CostBand = (typeof COST_BANDS)[number];

export const SPICE_LEVELS = ["none", "mild", "medium", "hot"] as const;
export type SpiceLevel = (typeof SPICE_LEVELS)[number];

/** Canonical recipe record — server-side catalog authority (future DB row shape). */
export type CatalogRecipeRecord = {
  id: string;
  slug: string;
  version: number;
  status: CatalogRecipeStatus;
  cuisineFamilyId: CuisineFamilyId;
  cuisineSubregionId?: CuisineSubregionId;
  originCountries: readonly IsoCountryCode[];
  mealStyleIds: readonly MealStyleId[];
  mealType: MealType;
  proteinFamily: ProteinFamily;
  difficulty: DifficultyLevel;
  prepMinutes: number;
  cookMinutes: number;
  activeMinutes: number;
  defaultServings: number;
  costBand: CostBand;
  spiceLevel: SpiceLevel;
  allergenDeclaration: RecipeAllergenDeclaration;
  dietaryFacts: RecipeDietaryFacts;
  flavorProfileId: string;
  techniqueIds: readonly string[];
  kidFriendlyScore: number;
  explorationScore: number;
  heroImageKey?: string;
  mealSlotImageKey?: string;
  /** Future marketplace listings may reference this canonical dish. */
  canonicalDishId?: string;
  nutritionRefId?: string;
  caloriesPerServing?: number;
  proteinGramsPerServing?: number;
  createdAt: string;
  updatedAt: string;
};

/** One canonical recipe identity — localized presentation without duplication. */
export type CatalogRecipeLocalization = {
  recipeId: string;
  locale: ShareYumLocale;
  title: string;
  description: string;
  steps: readonly { order: number; instruction: string }[];
  tips?: readonly string[];
  storageTip?: string;
};

export type CatalogIngredientRef = {
  ingredientId: string;
  quantity: number;
  unit: string;
  optional: boolean;
  prepNote?: string;
};

export type CatalogRecipeIngredientRow = {
  recipeId: string;
  sortOrder: number;
  ingredient: CatalogIngredientRef;
};

export type HouseholdSuitabilityFlags = {
  toddlerFriendly: boolean;
  teenFriendly: boolean;
  guestFriendly: boolean;
};

export type CatalogRecipeSuitability = {
  recipeId: string;
  flags: HouseholdSuitabilityFlags;
};

/** Fail-closed allergen policy for safety-sensitive recommendations. */
export type AllergenSafetyPolicy = {
  rejectOnContains: true;
  rejectOnMayContain: true;
};

export const DEFAULT_ALLERGEN_SAFETY_POLICY: AllergenSafetyPolicy = {
  rejectOnContains: true,
  rejectOnMayContain: true,
};
