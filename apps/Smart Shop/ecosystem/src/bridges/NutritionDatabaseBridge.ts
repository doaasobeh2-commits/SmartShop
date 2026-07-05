/**
 * Future nutrition database integration.
 */
export type NutritionDatabaseBridge = {
  lookupNutrition(productName: string): Promise<unknown>;
  evaluateMealNutrition(ingredientIds: string[]): Promise<unknown>;
};

export type NutritionDatabaseBridgeStatus = {
  connected: boolean;
};

export const DEFAULT_NUTRITION_DATABASE_BRIDGE_STATUS: NutritionDatabaseBridgeStatus = {
  connected: false,
};
