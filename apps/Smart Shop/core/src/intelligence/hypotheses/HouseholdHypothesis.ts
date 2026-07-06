/**
 * Confidence-based household beliefs inferred from behavior.
 * These are hypotheses — never facts, never shown directly to users.
 */
export type HypothesisDomain =
  | "cuisine_affinity"
  | "dietary_tendency"
  | "cooking_frequency"
  | "store_affinity"
  | "budget_behavior"
  | "seasonal_pattern"
  | "cultural_context"
  | "ingredient_affinity";

export type HypothesisStatus = "active" | "weakened" | "retired";

export type HouseholdHypothesis = {
  id: string;
  householdId: string;
  domain: HypothesisDomain;
  /** Stable machine label, e.g. "turkish_cuisine", "italian_cuisine". */
  label: string;
  /** 0–1 confidence; never presented to users as certainty. */
  confidence: number;
  evidenceCount: number;
  supportingSignalIds: string[];
  contradictingSignalIds: string[];
  lastReinforcedAt: string;
  lastWeakenedAt?: string;
  createdAt: string;
  status: HypothesisStatus;
};

export const HYPOTHESIS_SCHEMA_VERSION = 1;

export type HouseholdHypothesisStore = {
  householdId: string;
  schemaVersion: number;
  hypotheses: HouseholdHypothesis[];
  lastInferredAt?: string;
};

export type HypothesisPersistence = {
  get(householdId: string): Promise<HouseholdHypothesisStore>;
  save(store: HouseholdHypothesisStore): Promise<void>;
};

export function emptyHypothesisStore(householdId: string): HouseholdHypothesisStore {
  return {
    householdId,
    schemaVersion: HYPOTHESIS_SCHEMA_VERSION,
    hypotheses: [],
  };
}
