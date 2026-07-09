/**
 * @deprecated Legacy Brain entry — use `../fitnessBrain` instead.
 * Re-exports compatibility shims only; canonical logic lives in fitnessBrain/.
 */

export { fitnessBrain, foodKnowledgeEngine, buildFitnessBrainUserData } from "./fitnessBrain";
export type { BrainInput, FitnessBrain } from "./fitnessBrain";
export type {
  BrainExplanation,
  BrainRecommendation,
  DailyBrainSnapshot,
  Explainable,
  EngineId,
} from "./types";

/** @deprecated Science catalog moved to fitnessBrain/knowledge — retained for type imports only. */
export {
  EVIDENCE_CATALOG,
  EVIDENCE_BY_ID,
  FORMULA_REGISTRY,
  GUIDELINE_REGISTRY,
  SCIENCE_DOMAINS,
  SCIENCE_REFERENCES,
  ACTIVITY_GUIDELINES,
  RECOMMENDATION_DECISION_TREES,
} from "./knowledge/science";
export type { ScienceDomain, EvidenceEntry, FormulaDefinition, GuidelineRule } from "./knowledge/science";
export * from "./knowledge/science/formulas";

/** @deprecated Use fitnessBrain/trainingEngine + knowledge/exercises/catalog */
export { workoutEngine } from "./engines/workout/workoutEngine";
/** @deprecated Use fitnessBrain/dailyDecisionEngine + presentation adapters */
export { recommendationEngine } from "./engines/recommendation/recommendationEngine";
export { FUTURE_ENGINES } from "./engines/future";
