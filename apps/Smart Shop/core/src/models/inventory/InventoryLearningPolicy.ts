import type { InventoryConfidenceLevel } from "./InventoryConfidenceLevel";

/**
 * Policy for hidden inventory learning behaviour.
 * Controls when AI may auto-adjust estimates vs require manual correction.
 */
export type InventoryLearningPolicy = {
  enabled: boolean;
  /** Minimum purchase observations before consumption learning starts. */
  minObservationsBeforeLearning: number;
  /** Confidence threshold above which manual correction is optional. */
  autoEstimateConfidenceThreshold: InventoryConfidenceLevel;
  allowManualCorrections: true;
  trackWasteSignals: boolean;
  trackExpirationSignals: boolean;
  /** Meal deductions remain disabled until Recipe AI is connected. */
  mealDeductionsEnabled: false;
  weeklyReportsEnabled: false;
};

export const DEFAULT_INVENTORY_LEARNING_POLICY: InventoryLearningPolicy = {
  enabled: true,
  minObservationsBeforeLearning: 3,
  autoEstimateConfidenceThreshold: "medium",
  allowManualCorrections: true,
  trackWasteSignals: true,
  trackExpirationSignals: true,
  mealDeductionsEnabled: false,
  weeklyReportsEnabled: false,
};
