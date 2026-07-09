/**
 * Scientific Knowledge Base — shared types.
 * Structured evidence, formulas, and rules. NOT AI-generated.
 */

export type ScienceDomain =
  | "nutrition"
  | "calories"
  | "protein"
  | "carbohydrates"
  | "fats"
  | "fibre"
  | "hydration"
  | "exercise"
  | "recovery"
  | "sleep"
  | "activity"
  | "bodyComposition"
  | "energyExpenditure"
  | "healthGuidance";

export type EvidenceEntry = {
  id: string;
  domain: ScienceDomain;
  title: string;
  summary: string;
  citation: string;
  year?: number;
  /** When this evidence applies in Fitness Brain. */
  applicability: string;
};

export type FormulaDefinition = {
  id: string;
  domain: ScienceDomain;
  name: string;
  /** Human-readable formula for explanations. */
  expression: string;
  description: string;
  evidenceIds: string[];
};

export type GuidelineRule = {
  id: string;
  domain: ScienceDomain;
  name: string;
  rule: string;
  rationale: string;
  evidenceIds: string[];
};

export type DecisionTreeNode = {
  id: string;
  condition: string;
  outcome: string;
  /** Links to recommendation ruleId or engine output. */
  ref?: string;
  children?: DecisionTreeNode[];
};
