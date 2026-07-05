import type { InventoryConfidenceScore } from "./InventoryConfidenceLevel";

export type InventoryUnit = "piece" | "g" | "kg" | "ml" | "l" | "pack" | "other";

/**
 * A single product line in a family's private hidden inventory database.
 * Not exposed in v1 UI.
 */
export type HiddenInventoryItem = {
  id: string;
  familyId: string;
  productName: string;
  brand?: string;
  category?: string;
  unit: InventoryUnit;
  remainingQuantity: number;
  purchasedQuantity?: number;
  lastPurchasedAt?: string;
  expiresAt?: string;
  confidence: InventoryConfidenceScore;
  /** Barcode or external product ref for future product-database linkage. */
  externalProductRef?: string;
  updatedAt: string;
};
