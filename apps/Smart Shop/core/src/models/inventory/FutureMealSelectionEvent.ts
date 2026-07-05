import type { MealIngredientDeduction } from "./MealIngredientDeduction";

/**
 * Future event when a family selects a meal from Recipe AI.
 * Example: family chooses French meal #4 and ingredients are deducted.
 */
export type FutureMealSelectionEvent = {
  id: string;
  familyId: string;
  recipeId: string;
  recipeName: string;
  mealNumber?: number;
  cuisineLabel?: string;
  selectedAt: string;
  ingredientDeductions: MealIngredientDeduction[];
};
