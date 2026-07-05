import type {
  FamilyInventoryMemory,
  FutureMealSelectionEvent,
  MealIngredientDeduction,
  WeeklyInventoryReport,
} from "@smart-shop/core";

/**
 * Future ecosystem bridge between Recipe AI and SmartShop hidden inventory.
 * Not wired in v1 UI. Enables meal ingredient deductions after Recipe AI connects.
 */
export type RecipeInventoryBridge = {
  /** Apply ingredient deductions when a family selects a meal. */
  applyMealSelection(event: FutureMealSelectionEvent): Promise<MealIngredientDeduction[]>;

  /** Read current hidden inventory memory for a family. */
  getFamilyInventoryMemory(familyId: string): Promise<FamilyInventoryMemory>;

  /** Generate a weekly inventory report when the feature is enabled later. */
  generateWeeklyReport(
    familyId: string,
    weekStart: string,
    weekEnd: string,
  ): Promise<WeeklyInventoryReport>;
};

export type RecipeInventoryBridgeStatus = {
  connected: boolean;
  mealDeductionsEnabled: boolean;
  weeklyReportsEnabled: boolean;
};

export const DEFAULT_RECIPE_INVENTORY_BRIDGE_STATUS: RecipeInventoryBridgeStatus = {
  connected: false,
  mealDeductionsEnabled: false,
  weeklyReportsEnabled: false,
};
