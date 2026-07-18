import type { DifficultyLevel } from "./schema";

/** Normalized flavor dimensions for deterministic matching and future synthesis. */
export type FlavorProfile = {
  id: string;
  acidity: number;
  richness: number;
  spice: number;
  umami: number;
  sweetness: number;
};

export const COOKING_TECHNIQUE_CATEGORIES = [
  "sear",
  "braise",
  "roast",
  "boil",
  "steam",
  "grill",
  "stuff",
  "slow_cook",
  "fry",
  "bake",
  "raw_assembly",
] as const;
export type CookingTechniqueCategory = (typeof COOKING_TECHNIQUE_CATEGORIES)[number];

export type CookingTechnique = {
  id: string;
  category: CookingTechniqueCategory;
  skillLevel: DifficultyLevel;
};

export const INGREDIENT_ROLES = [
  "protein",
  "starch",
  "aromatic",
  "acid",
  "fat",
  "vegetable",
  "garnish",
  "legume",
  "dairy",
] as const;
export type IngredientRole = (typeof INGREDIENT_ROLES)[number];

/** Future pantry synthesis — architecture hook only (A2.2). */
export type PantrySynthesisRequest = {
  householdId: string;
  availableIngredientIds: readonly string[];
  timeBudgetMinutes?: number;
};

export type QuantityAdaptation = {
  ingredientId: string;
  suggestedQuantity: number;
  unit: string;
  reason: string;
};

export type ComposedMealDraft = {
  title: string;
  techniqueIds: readonly string[];
  flavorProfileId: string;
  ingredientRoles: readonly { ingredientId: string; role: IngredientRole }[];
  adaptations?: readonly QuantityAdaptation[];
};

export type PantrySynthesisResponse =
  | { status: "match"; recipeId: string; adaptations?: readonly QuantityAdaptation[] }
  | { status: "compose"; composedMeal: ComposedMealDraft }
  | { status: "empty"; code: "NO_SAFE_MATCH" | "INSUFFICIENT_INGREDIENTS" };

/** Rule-bound compatibility check hook — no LLM. */
export type IngredientCompatibilityRule = {
  id: string;
  requiredRoles: readonly IngredientRole[];
  compatibleTechniqueCategories: readonly CookingTechniqueCategory[];
  compatibleFamilyIds?: readonly string[];
};

export type SynthesisTemplate = {
  id: string;
  name: string;
  requiredRoles: readonly IngredientRole[];
  techniqueSequence: readonly string[];
  flavorProfileId: string;
};
