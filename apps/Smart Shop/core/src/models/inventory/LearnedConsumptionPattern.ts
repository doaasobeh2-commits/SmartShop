import type { InventoryConfidenceScore } from "./InventoryConfidenceLevel";

export type ConsumptionPeriod = "daily" | "weekly" | "monthly";

/**
 * AI-learned consumption estimate for a family product over time.
 */
export type LearnedConsumptionPattern = {
  id: string;
  familyId: string;
  inventoryItemId: string;
  productName: string;
  averageQuantityPerPeriod: number;
  period: ConsumptionPeriod;
  sampleCount: number;
  confidence: InventoryConfidenceScore;
  lastObservedAt: string;
  learnedAt: string;
};
