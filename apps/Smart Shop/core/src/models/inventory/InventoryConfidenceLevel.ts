/**
 * Confidence in AI-derived inventory estimates.
 * Increases as consumption patterns are learned over time.
 */
export type InventoryConfidenceLevel =
  | "unknown"
  | "low"
  | "medium"
  | "high"
  | "verified";

export type InventoryConfidenceScore = {
  level: InventoryConfidenceLevel;
  /** 0–1 normalized score for internal ranking only. */
  score: number;
};
