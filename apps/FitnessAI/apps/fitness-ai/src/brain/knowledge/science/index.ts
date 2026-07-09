/**
 * Scientific Knowledge Base — canonical layer beneath Fitness Brain engines.
 * Expand here before adding UI. Evidence-first, deterministic, reproducible.
 */

export type {
  ScienceDomain,
  EvidenceEntry,
  FormulaDefinition,
  GuidelineRule,
  DecisionTreeNode,
} from "./types";

export {
  EVIDENCE_CATALOG,
  EVIDENCE_BY_ID,
  FORMULA_REGISTRY,
  GUIDELINE_REGISTRY,
  SCIENCE_DOMAINS,
  SCIENCE_REFERENCES,
} from "./evidence/catalog";
export type { ScienceReferenceKey } from "./evidence/catalog";

export * from "./formulas";
export { ACTIVITY_GUIDELINES, getActivityEvidenceCitation } from "./guidelines/activityLevels";
export { RECOMMENDATION_DECISION_TREES } from "./trees/recommendationTrees";
