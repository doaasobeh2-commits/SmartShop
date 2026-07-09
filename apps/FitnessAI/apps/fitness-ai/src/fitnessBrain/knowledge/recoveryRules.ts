/**
 * Recovery knowledge rules — readiness signals from behavior data.
 * General wellness signals only — not medical recovery assessment.
 * @see scientificSources — aasm-sleep-duration, acsm-recovery-training
 */

import type { KnowledgeRule } from "./evidenceLevels";

export const RECOVERY_RULES: KnowledgeRule[] = [
  {
    id: "consecutive-training-caution",
    description: "Multiple hard training days in a row increase fatigue accumulation.",
    evidenceLevel: "moderate",
    sourceCategory: "resistance_training_guidelines",
    recommendation: "Reduce intensity or choose lighter movement after 3+ consecutive training days.",
    sourceIds: ["acsm-recovery-training"],
  },
  {
    id: "poor-sleep-caution",
    description: "Short sleep is associated with reduced readiness and higher perceived effort.",
    evidenceLevel: "moderate",
    sourceCategory: "public_health_guidelines",
    recommendation: "Treat sleep under 6 hours as a caution signal; prioritise rest and hydration.",
    sourceIds: ["aasm-sleep-duration"],
  },
  {
    id: "good-sleep-support",
    description: "Adequate sleep supports training consistency and recovery.",
    evidenceLevel: "moderate",
    sourceCategory: "public_health_guidelines",
    recommendation: "Treat 7+ hours of sleep as a positive recovery signal when available.",
    sourceIds: ["aasm-sleep-duration"],
  },
  {
    id: "low-adherence-interpretation",
    description: "Low recent adherence may reflect life stress, not lack of motivation alone.",
    evidenceLevel: "limited",
    sourceCategory: "behavioral_science",
    recommendation: "When adherence is under 30%, favour simpler, achievable daily actions.",
    sourceIds: ["product-decision-heuristics"],
  },
  {
    id: "high-adherence-support",
    description: "Consistent logging and training support steady progress.",
    evidenceLevel: "limited",
    sourceCategory: "behavioral_science",
    recommendation: "When adherence is 70%+, maintain current habits rather than adding complexity.",
    sourceIds: ["product-decision-heuristics"],
  },
  {
    id: "overtraining-risk-signals",
    description: "Stacked training load plus poor sleep suggests elevated fatigue risk.",
    evidenceLevel: "heuristic",
    sourceCategory: "safety_guidance",
    recommendation: "Flag possible overtraining risk at 4+ consecutive days or 3+ days with sleep under 6.5 h.",
    sourceIds: ["acsm-recovery-training", "aasm-sleep-duration"],
  },
  {
    id: "recovery-score-bands",
    description: "Recovery score bands translate signals into general readiness levels.",
    evidenceLevel: "heuristic",
    sourceCategory: "behavioral_science",
    recommendation: "Score below 45 = low recovery; 45–74 = normal; 75+ = good recovery.",
    sourceIds: ["product-decision-heuristics", "acsm-recovery-training"],
  },
];

export const RECOVERY_VALUES = {
  baselineScore: 72,
  scoreMin: 0,
  scoreMax: 100,
  neutralScore: 50,
  lowRecoveryMax: 44,
  goodRecoveryMin: 75,
  normalRecoveryMin: 45,
  /** @see aasm-sleep-duration — below recommended adult range. */
  sleepPoorHours: 6,
  sleepGoodHours: 7,
  sleepExcellentHours: 7.5,
  sleepPoorPenalty: 18,
  sleepGoodBonus: 8,
  sleepExcellentBonus: 12,
  sleepOvertrainingHours: 6.5,
  /** @see acsm-recovery-training */
  consecutiveDaysHigh: 4,
  consecutiveDaysModerate: 3,
  consecutiveDaysLow: 2,
  consecutiveHighPenalty: 28,
  consecutiveModeratePenalty: 18,
  consecutiveLowPenalty: 10,
  adherenceHighPct: 70,
  adherenceLowPct: 30,
  adherenceHighBonus: 6,
  adherenceLowPenalty: 5,
  overtrainingConsecutiveDays: 4,
  overtrainingComboDays: 3,
  activityHardMinutes60Penalty: 8,
  activityHardMinutes45Penalty: 4,
  activityRecoveryNeedHighPenalty: 10,
  activityRecoveryNeedModeratePenalty: 5,
  activityVeryHighEnergyPenalty: 4,
  activityHardMinutesLong: 60,
  activityHardMinutesModerate: 45,
} as const;

export type RecoverySignalInput = {
  consecutiveTrainingDays: number;
  trainedYesterday: boolean;
  adherence: number;
  sleepHours?: number;
  exercisesCompletedToday: number;
};

export function hasRecoverySignals(input: RecoverySignalInput): boolean {
  return (
    input.consecutiveTrainingDays > 0 ||
    input.trainedYesterday ||
    input.exercisesCompletedToday > 0 ||
    input.adherence > 0 ||
    input.sleepHours !== undefined
  );
}

export function computeRecoveryScore(input: RecoverySignalInput): number {
  const v = RECOVERY_VALUES;
  let score = v.baselineScore;

  const { sleepHours, consecutiveTrainingDays, trainedYesterday, adherence } = input;

  if (sleepHours !== undefined && sleepHours < v.sleepPoorHours) score -= v.sleepPoorPenalty;
  else if (sleepHours !== undefined && sleepHours >= v.sleepExcellentHours)
    score += v.sleepExcellentBonus;
  else if (sleepHours !== undefined && sleepHours >= v.sleepGoodHours) score += v.sleepGoodBonus;

  if (consecutiveTrainingDays >= v.consecutiveDaysHigh) score -= v.consecutiveHighPenalty;
  else if (consecutiveTrainingDays >= v.consecutiveDaysModerate)
    score -= v.consecutiveModeratePenalty;
  else if (consecutiveTrainingDays >= v.consecutiveDaysLow && trainedYesterday)
    score -= v.consecutiveLowPenalty;

  if (adherence >= v.adherenceHighPct) score += v.adherenceHighBonus;
  else if (adherence < v.adherenceLowPct) score -= v.adherenceLowPenalty;

  return Math.min(Math.max(Math.round(score), v.scoreMin), v.scoreMax);
}

export function isOvertrainingRisk(input: RecoverySignalInput): boolean {
  const v = RECOVERY_VALUES;
  return (
    input.consecutiveTrainingDays >= v.overtrainingConsecutiveDays ||
    (input.consecutiveTrainingDays >= v.overtrainingComboDays &&
      input.trainedYesterday &&
      input.sleepHours !== undefined &&
      input.sleepHours < v.sleepOvertrainingHours)
  );
}

export type RecoveryLevelId =
  | "low_recovery"
  | "normal_recovery"
  | "good_recovery"
  | "overtraining_risk"
  | "neutral";

export function resolveRecoveryLevel(score: number, overtrainingRisk: boolean): RecoveryLevelId {
  if (overtrainingRisk) return "overtraining_risk";
  if (score <= RECOVERY_VALUES.lowRecoveryMax) return "low_recovery";
  if (score >= RECOVERY_VALUES.goodRecoveryMin) return "good_recovery";
  if (score >= RECOVERY_VALUES.normalRecoveryMin) return "normal_recovery";
  return "neutral";
}

export const RECOVERY_SUMMARIES: Record<RecoveryLevelId, string> = {
  overtraining_risk:
    "Several training days in a row — lighter movement may support recovery.",
  low_recovery: "Recovery signals are low — prioritise rest and hydration today.",
  normal_recovery: "Recovery is moderate — train at comfortable intensity.",
  good_recovery: "Recovery looks good — follow today's plan if you feel ready.",
  neutral: "Recovery status is balanced — listen to your body during activity.",
};
