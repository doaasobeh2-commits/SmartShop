/**
 * Fitness Brain pre-launch philosophy — rule-based, evidence-first decision making.
 * Not an engine; canonical principles referenced by rules, explainability, and safety.
 */

import type { KnowledgeRule } from "./evidenceLevels";

/** Collect → Analyze → Recommend — never skip to recommendation without evidence. */
export const BRAIN_PHILOSOPHY_RULES: KnowledgeRule[] = [
  {
    id: "evidence-before-decision",
    description: "Recommendations require sufficient logged evidence — the Brain does not guess.",
    evidenceLevel: "strong",
    sourceCategory: "safety_guidance",
    recommendation:
      "Verify required signals exist before nutrition, hydration, or recovery judgments. If evidence is missing, explain what to log first.",
    sourceIds: ["fitness-safety-boundary"],
  },
  {
    id: "unknown-not-zero",
    description: "Missing data is unknown — never interpreted as zero, low, or poor.",
    evidenceLevel: "strong",
    sourceCategory: "safety_guidance",
    recommendation:
      "Unknown hydration ≠ 0%. Unknown protein ≠ low protein. Unknown sleep ≠ poor sleep. Only known values enter formulas.",
    sourceIds: ["fitness-safety-boundary"],
  },
  {
    id: "analysis-before-suggestion",
    description: "Scientific analysis of logged intake precedes optional lifestyle suggestions.",
    evidenceLevel: "strong",
    sourceCategory: "safety_guidance",
    recommendation:
      "Present calculated targets and logged values first; optional adjustments only after analysis is complete.",
    sourceIds: ["fitness-safety-boundary"],
  },
  {
    id: "brain-decision-maker-not-ai",
    description: "Fitness Brain is the rule-based decision engine; AI may explain but never replace it.",
    evidenceLevel: "strong",
    sourceCategory: "safety_guidance",
    recommendation:
      "Metabolism, nutrition, recovery, activity, and daily recommendations come from scientific rules — not generative AI.",
    sourceIds: ["fitness-safety-boundary"],
  },
  {
    id: "scientific-transparency",
    description: "Important calculations must be traceable to formulas and published sources.",
    evidenceLevel: "strong",
    sourceCategory: "public_health_guidelines",
    recommendation:
      "Link recommendations to knowledge rules and scientificSources entries (Mifflin–St Jeor, ISSN, EFSA, Compendium, USDA FDC).",
    sourceIds: ["mifflin-st-jeor-1990", "issn-protein-2017", "efsa-water-2010"],
  },
];

export const BRAIN_WORKFLOW = ["collect", "analyze", "recommend"] as const;
