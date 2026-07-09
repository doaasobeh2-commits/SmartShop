/**
 * Nutrition knowledge rules — targets and daily decision thresholds.
 * General wellness planning only — not clinical nutrition therapy.
 * @see scientificSources — issn-protein-2017, efsa-water-2010, iom-amdr-fat-2005, usda-dga-fibre
 */

import type { FitnessGoal } from "../types";
import type { KnowledgeRule } from "./evidenceLevels";

export const NUTRITION_RULES: KnowledgeRule[] = [
  {
    id: "protein-fat-loss",
    description: "Higher protein supports lean mass retention during a calorie deficit.",
    evidenceLevel: "moderate",
    sourceCategory: "sports_nutrition_guidelines",
    recommendation: "Target about 1.8 g protein per kg body weight for fat-loss goals.",
    sourceIds: ["issn-protein-2017"],
  },
  {
    id: "protein-muscle-gain",
    description: "Adequate protein supports muscle protein synthesis with resistance training.",
    evidenceLevel: "moderate",
    sourceCategory: "sports_nutrition_guidelines",
    recommendation: "Target about 2.0 g protein per kg body weight for muscle-gain goals.",
    sourceIds: ["issn-protein-2017"],
  },
  {
    id: "protein-maintenance",
    description: "Moderate protein supports general health and activity.",
    evidenceLevel: "moderate",
    sourceCategory: "sports_nutrition_guidelines",
    recommendation: "Target about 1.6 g protein per kg body weight for maintenance goals.",
    sourceIds: ["issn-protein-2017"],
  },
  {
    id: "hydration-body-weight",
    description: "Fluid needs scale with body size and activity.",
    evidenceLevel: "moderate",
    sourceCategory: "public_health_guidelines",
    recommendation: "Use roughly 35 ml per kg body weight as a daily fluid baseline, minimum 2 L.",
    sourceIds: ["efsa-water-2010"],
  },
  {
    id: "calorie-deficit-safe-range",
    description: "Moderate deficits are commonly used for sustainable fat loss.",
    evidenceLevel: "moderate",
    sourceCategory: "sports_nutrition_guidelines",
    recommendation: "Apply about a 500 kcal/day deficit below estimated TDEE for fat loss.",
    sourceIds: ["nice-weight-loss-deficit"],
  },
  {
    id: "calorie-surplus-safe-range",
    description: "Small surpluses support gradual muscle gain without excessive fat gain.",
    evidenceLevel: "limited",
    sourceCategory: "sports_nutrition_guidelines",
    recommendation: "Apply about a 300 kcal/day surplus above estimated TDEE for muscle gain.",
    sourceIds: ["issn-muscle-gain-surplus"],
  },
  {
    id: "calorie-floor",
    description: "Very low calorie targets are avoided in general fitness planning.",
    evidenceLevel: "moderate",
    sourceCategory: "public_health_guidelines",
    recommendation: "Do not set daily calorie targets below 1200 kcal in general guidance.",
    sourceIds: ["who-min-energy-intake"],
  },
  {
    id: "fibre-per-kcal",
    description: "Fibre density supports digestive health and meal satiety.",
    evidenceLevel: "moderate",
    sourceCategory: "public_health_guidelines",
    recommendation: "Target about 14 g dietary fibre per 1000 kcal consumed.",
    sourceIds: ["usda-dga-fibre"],
  },
  {
    id: "meal-balance-macros",
    description: "Balanced meals combine protein, carbohydrates, fats, and fibre.",
    evidenceLevel: "moderate",
    sourceCategory: "public_health_guidelines",
    recommendation: "Allocate roughly 28% of calories to fat; fill remaining calories with protein and carbs.",
    sourceIds: ["iom-amdr-fat-2005", "issn-protein-2017"],
  },
  {
    id: "hydration-critical-threshold",
    description: "Very low daily fluid progress warrants a hydration focus.",
    evidenceLevel: "heuristic",
    sourceCategory: "behavioral_science",
    recommendation: "Prompt hydration focus when intake is below 30% of goal after mid-morning.",
    sourceIds: ["efsa-water-2010", "product-decision-heuristics"],
  },
  {
    id: "protein-low-threshold",
    description: "Low afternoon protein progress suggests prioritising protein at remaining meals.",
    evidenceLevel: "heuristic",
    sourceCategory: "behavioral_science",
    recommendation: "Prompt protein focus when progress is below 40% of daily target after 14:00.",
    sourceIds: ["issn-protein-2017", "product-decision-heuristics"],
  },
  {
    id: "calorie-off-track-threshold",
    description: "Large gaps between eaten and target calories suggest rebalancing meals.",
    evidenceLevel: "heuristic",
    sourceCategory: "behavioral_science",
    recommendation: "Flag when intake exceeds target by 500+ kcal or remains 800+ kcal below target in the evening.",
    sourceIds: ["nice-weight-loss-deficit", "product-decision-heuristics"],
  },
];

/** Numeric values referenced by Nutrition and Daily Decision engines. */
export const NUTRITION_VALUES = {
  /** @see issn-protein-2017 — 1.4–2.0 g/kg range; goal-specific targets within band. */
  proteinGramsPerKg: {
    fat_loss: 1.8,
    maintenance: 1.6,
    muscle_gain: 2.0,
  } satisfies Record<FitnessGoal, number>,
  /** @see iom-amdr-fat-2005 — 28% within 20–35% AMDR for fat. */
  fatKcalPercent: 0.28,
  /** @see efsa-water-2010 — planning heuristic aligned with adequate intake principles. */
  waterMlPerKg: 35,
  waterMinLiters: 2,
  /** @see usda-dga-fibre — 14 g per 1000 kcal. */
  fiberGPer1000Kcal: 14,
  /** @see nice-weight-loss-deficit */
  calorieDeficitKcal: 500,
  /** @see issn-muscle-gain-surplus */
  calorieSurplusKcal: 300,
  /** @see who-min-energy-intake */
  minDailyKcal: 1200,
  hydrationCriticalPct: 0.3,
  hydrationLowPct: 0.5,
  hydrationCriticalAfterHour: 10,
  hydrationLowAfterHour: 12,
  proteinLowProgressPct: 0.4,
  proteinLowAfterHour: 14,
  proteinFocusRemainingG: 25,
  proteinFocusAfterHour: 16,
  calorieOverTargetKcal: 500,
  calorieUnderTargetKcal: 800,
  calorieCheckAfterHour: 18,
  calorieBalanceRemainingKcal: 400,
  calorieBalanceAfterHour: 14,
} as const;

/**
 * Daily decision priorities and tuning — used by dailyDecisionEngine only.
 * Higher priority wins; sortScore breaks ties (priority × 10 + body boosts).
 * @see product-decision-heuristics
 */
export const DECISION_VALUES = {
  priorities: {
    /** Evidence collection — Collect phase before Analyze/Recommend. */
    collect_nutrition_evidence: 95,
    collect_hydration_evidence: 94,
    collect_primary_sport_evidence: 93,
    collect_experience_evidence: 92,
    collect_sleep_evidence: 91,
    overtraining_risk: 98,
    recovery_rest: 96,
    post_activity_hydration: 93,
    hydration_critical: 92,
    post_activity_protein: 91,
    protein_low: 90,
    hydration_focus: 88,
    missed_workout: 87,
    post_activity_fuel: 86,
    protein_focus: 85,
    calorie_off_track: 84,
    complete_workout: 80,
    calorie_balance: 75,
    movement_day: 70,
    steady_progress: 50,
  },
  weekdayHydrationPatternBump: 0.05,
  postActivityProteinProgressBump: 0.15,
  postActivityFuelMaxHour: 20,
  bodyBoosts: {
    hydrationLowForHydrationAction: 15,
    recoveryLowForRestAction: 20,
    trainingLoadHighWorkoutPenalty: 25,
    energyDeficitCalorieAwarenessBoost: 10,
    stressHighRestBoost: 12,
  },
} as const;

export function getDecisionPriority(actionId: keyof typeof DECISION_VALUES.priorities): number {
  return DECISION_VALUES.priorities[actionId];
}

export function getDecisionSortScore(actionId: keyof typeof DECISION_VALUES.priorities): number {
  return getDecisionPriority(actionId) * 10;
}

export function getProteinGramsPerKg(goal: FitnessGoal): number {
  return NUTRITION_VALUES.proteinGramsPerKg[goal];
}

/** @see efsa-water-2010 */
export function getWaterLiters(weightKg: number): number {
  const liters = (weightKg * NUTRITION_VALUES.waterMlPerKg) / 1000;
  return Math.max(Math.round(liters * 10) / 10, NUTRITION_VALUES.waterMinLiters);
}

/** @see usda-dga-fibre */
export function getFiberGrams(dailyKcal: number): number {
  return Math.round((dailyKcal / 1000) * NUTRITION_VALUES.fiberGPer1000Kcal);
}

/** @see nice-weight-loss-deficit, issn-muscle-gain-surplus */
export function getGoalCalorieAdjustment(goal: FitnessGoal): number {
  switch (goal) {
    case "fat_loss":
      return -NUTRITION_VALUES.calorieDeficitKcal;
    case "muscle_gain":
      return NUTRITION_VALUES.calorieSurplusKcal;
    default:
      return 0;
  }
}
