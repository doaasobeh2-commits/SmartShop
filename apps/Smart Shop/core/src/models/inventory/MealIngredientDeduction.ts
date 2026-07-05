/**
 * Ingredient quantity subtracted from hidden inventory when a meal is selected.
 * Activated only after Recipe AI integration.
 */
export type MealIngredientDeduction = {
  id: string;
  familyId: string;
  mealSelectionEventId: string;
  inventoryItemId: string;
  ingredientName: string;
  deductedQuantity: number;
  unit: string;
  remainingQuantityAfter: number;
  deductedAt: string;
};
