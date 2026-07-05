import type { HiddenInventoryItem } from "./HiddenInventoryItem";
import type { InventoryConfidenceScore } from "./InventoryConfidenceLevel";

/**
 * Point-in-time inventory state for weekly reports and learning.
 */
export type InventorySnapshot = {
  id: string;
  familyId: string;
  capturedAt: string;
  items: HiddenInventoryItem[];
  confidence: InventoryConfidenceScore;
  note?: string;
};

export type InventoryHistoryEntry = {
  id: string;
  familyId: string;
  inventoryItemId: string;
  recordedAt: string;
  remainingQuantity: number;
  source: "purchase" | "consumption" | "correction" | "prediction" | "meal_deduction";
  snapshotId?: string;
};

export type EstimatedQuantity = {
  inventoryItemId: string;
  productName: string;
  estimatedRemaining: number;
  unit: string;
  confidence: InventoryConfidenceScore;
  estimatedAt: string;
};

export type ConsumptionPrediction = {
  inventoryItemId: string;
  productName: string;
  predictedQuantity: number;
  period: "daily" | "weekly" | "monthly";
  confidence: InventoryConfidenceScore;
  predictedAt: string;
};

export type ShoppingPrediction = {
  familyId: string;
  suggestedProducts: string[];
  suggestedBuyBy?: string;
  confidence: InventoryConfidenceScore;
  predictedAt: string;
  reason: string;
};

export type InventoryPredictionEngine = {
  estimateQuantities(familyId: string): Promise<EstimatedQuantity[]>;
  predictConsumption(familyId: string): Promise<ConsumptionPrediction[]>;
  predictShoppingNeeds(familyId: string): Promise<ShoppingPrediction>;
};
