import type { HouseholdHypothesisStore } from "../hypotheses/HouseholdHypothesis";
import { getActiveHypothesesByDomain } from "../inference/InferencePipeline";

/**
 * Read-only projections for basket, recipe, and offer engines.
 * Translates internal hypotheses into engine-friendly hints — never user-facing labels.
 */
export type DerivedCuisineHint = {
  label: string;
  confidence: number;
};

export type DerivedPreferenceView = {
  householdId: string;
  cuisineHints: DerivedCuisineHint[];
  dietaryHints: DerivedCuisineHint[];
  generatedAt: string;
};

export function buildDerivedPreferenceView(
  store: HouseholdHypothesisStore,
): DerivedPreferenceView {
  const cuisineHints = getActiveHypothesesByDomain(store, "cuisine_affinity", 0.35).map(
    (item) => ({
      label: item.label,
      confidence: item.confidence,
    }),
  );

  const dietaryHints = getActiveHypothesesByDomain(store, "dietary_tendency", 0.35).map(
    (item) => ({
      label: item.label,
      confidence: item.confidence,
    }),
  );

  return {
    householdId: store.householdId,
    cuisineHints,
    dietaryHints,
    generatedAt: new Date().toISOString(),
  };
}
