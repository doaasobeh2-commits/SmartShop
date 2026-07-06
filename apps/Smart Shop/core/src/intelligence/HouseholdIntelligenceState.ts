import type { HouseholdKnowledge } from "../knowledge/HouseholdKnowledge";
import type { HouseholdMemory } from "../memory/HouseholdMemory";
import type { HouseholdHypothesisStore } from "./hypotheses/HouseholdHypothesis";

/**
 * Unified internal state of the Household Intelligence Engine.
 * Applications write signals; engines read projections — never raw hypotheses in UI.
 */
export type HouseholdIntelligenceState = {
  householdId: string;
  memory: HouseholdMemory;
  knowledge: HouseholdKnowledge;
  hypotheses: HouseholdHypothesisStore;
  lastUpdatedAt: string;
};

export type HouseholdIntelligenceStateReader = {
  getState(householdId: string): Promise<HouseholdIntelligenceState>;
};
