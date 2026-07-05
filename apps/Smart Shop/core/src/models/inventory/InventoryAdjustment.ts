/**
 * Hidden inventory input created when a SmartShop purchase is saved.
 * Purchases become inventory signals without surfacing inventory UI in v1.
 */
export type InventoryAdjustmentSource =
  | "shopping_basket"
  | "shopping_history"
  | "manual_correction"
  | "meal_deduction"
  | "ai_learning";

export type InventoryAdjustment = {
  id: string;
  familyId: string;
  inventoryItemId: string;
  source: InventoryAdjustmentSource;
  quantityDelta: number;
  /** Positive adds stock; negative consumes stock. */
  recordedAt: string;
  shoppingHistoryEntryId?: string;
  basketItemId?: string;
  note?: string;
};
