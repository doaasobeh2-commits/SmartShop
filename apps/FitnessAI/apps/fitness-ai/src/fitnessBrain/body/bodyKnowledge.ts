/**
 * Body knowledge — scientific thresholds for body-state interpretation.
 * Hydration bands align with knowledge/nutritionRules; recovery bands with recoveryRules.
 */

import { NUTRITION_VALUES } from "../knowledge/nutritionRules";
import { RECOVERY_VALUES } from "../knowledge/recoveryRules";
import type { KnowledgeRule } from "../knowledge/evidenceLevels";

export const BODY_KNOWLEDGE_RULES: KnowledgeRule[] = [
  {
    id: "body-energy-deficit-band",
    description: "Calorie intake below target suggests an energy deficit context.",
    evidenceLevel: "heuristic",
    sourceCategory: "sports_nutrition_guidelines",
    recommendation: "Treat intake below 85% of target as deficit context for fueling guidance.",
    sourceIds: ["nice-weight-loss-deficit", "product-decision-heuristics"],
  },
  {
    id: "body-energy-surplus-band",
    description: "Calorie intake above target suggests surplus context.",
    evidenceLevel: "heuristic",
    sourceCategory: "sports_nutrition_guidelines",
    recommendation: "Treat intake above 110% of target as surplus context.",
    sourceIds: ["issn-muscle-gain-surplus", "product-decision-heuristics"],
  },
  {
    id: "body-hydration-low-band",
    description: "Low hydration progress reduces readiness for hard sessions.",
    evidenceLevel: "moderate",
    sourceCategory: "public_health_guidelines",
    recommendation: "Treat hydration below 50% of daily goal as low status.",
    sourceIds: ["efsa-water-2010", "acsm-hydration-exercise"],
  },
  {
    id: "body-hydration-moderate-band",
    description: "Partial hydration progress — still room to improve before adequate.",
    evidenceLevel: "heuristic",
    sourceCategory: "behavioral_science",
    recommendation: "Treat 50–70% of daily hydration goal as moderate status.",
    sourceIds: ["efsa-water-2010", "product-decision-heuristics"],
  },
  {
    id: "body-training-load-from-activity",
    description: "Recent activity duration and intensity inform training load.",
    evidenceLevel: "heuristic",
    sourceCategory: "behavioral_science",
    recommendation: "Elevate training load when today includes 45+ min or hard intensity.",
    sourceIds: ["compendium-met-2011", "product-decision-heuristics"],
  },
  {
    id: "body-age-band",
    description: "Age bands adjust conservative defaults — not medical stratification.",
    evidenceLevel: "limited",
    sourceCategory: "public_health_guidelines",
    recommendation: "Use broad age bands for general fitness guidance only.",
    sourceIds: ["mifflin-st-jeor-1990"],
  },
];

export const BODY_VALUES = {
  energyDeficitPct: 0.85,
  energySurplusPct: 1.1,
  hydrationLowPct: NUTRITION_VALUES.hydrationLowPct,
  hydrationModeratePct: 0.55,
  hydrationAdequatePct: 0.7,
  activityMinutesHighLoad: 45,
  activityMinutesModerateLoad: 20,
  ageYoungMax: 25,
  ageMatureMin: 45,
  stressHighThreshold: 4,
  stressModerateThreshold: 2,
  recoveryLowMax: RECOVERY_VALUES.lowRecoveryMax,
  recoveryGoodMin: RECOVERY_VALUES.goodRecoveryMin,
  stressLevelNumeric: {
    low: 1,
    moderate: 3,
    high: 5,
  },
} as const;
