/**
 * Evidence levels for Fitness Brain knowledge rules.
 * Describes confidence in the rule — not clinical validation of the user.
 */

export type EvidenceLevel = "strong" | "moderate" | "limited" | "heuristic";

export type SourceCategory =
  | "sports_nutrition_guidelines"
  | "resistance_training_guidelines"
  | "public_health_guidelines"
  | "behavioral_science"
  | "safety_guidance";

export type KnowledgeRule = {
  id: string;
  description: string;
  evidenceLevel: EvidenceLevel;
  sourceCategory: SourceCategory;
  recommendation: string;
  /** IDs from knowledge/scientificSources.ts — required for launch-validated rules. */
  sourceIds: string[];
};

export const EVIDENCE_LEVEL_ORDER: EvidenceLevel[] = [
  "strong",
  "moderate",
  "limited",
  "heuristic",
];
