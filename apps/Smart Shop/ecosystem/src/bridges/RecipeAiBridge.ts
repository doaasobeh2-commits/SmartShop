/**
 * Future bridge to Recipe AI.
 * Not implemented in v1.
 */
export type RecipeAiBridge = {
  suggestMeals(familyId: string): Promise<unknown>;
  getIngredientsForRecipe(recipeId: string): Promise<unknown>;
  syncWithInventory(familyId: string): Promise<unknown>;
};

export type RecipeAiBridgeStatus = {
  connected: boolean;
};

export const DEFAULT_RECIPE_AI_BRIDGE_STATUS: RecipeAiBridgeStatus = {
  connected: false,
};
