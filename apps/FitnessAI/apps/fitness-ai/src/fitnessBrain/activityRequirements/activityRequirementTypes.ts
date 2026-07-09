/**
 * Activity requirement types — hidden Brain layer for physiological context.
 * General fitness guidance only — not medical advice.
 */

import type { ActivityIntensity } from "../activity/types";
import type { EvidenceLevel } from "../knowledge/evidenceLevels";
import type { FitnessGoal } from "../types";

export type EnergyDemandLevel = "low" | "moderate" | "high" | "very_high";

export type FuelingNeed = "none" | "light_snack" | "carb_focused" | "balanced_meal";

export type PriorityLevel = "low" | "medium" | "high";

export type RecoveryNeedLevel = "low" | "moderate" | "high";

export type NextDayRecommendation =
  | "train_normally"
  | "light_activity"
  | "rest_recommended"
  | "avoid_same_muscle_group";

export type RequirementConfidence = "high" | "medium" | "low";

export type ActivityRequirement = {
  activityId: string;
  energyDemand: EnergyDemandLevel;
  fuelingNeed: FuelingNeed;
  proteinPriority: PriorityLevel;
  hydrationPriority: PriorityLevel;
  recoveryNeed: RecoveryNeedLevel;
  muscleGroupLoad: string[];
  nextDayRecommendation: NextDayRecommendation;
  reason: string;
  confidence: RequirementConfidence;
  supportingRuleIds: string[];
};

export type ActivityRequirementRule = {
  id: string;
  description: string;
  evidenceLevel: EvidenceLevel;
  sourceCategory:
    | "sports_nutrition_guidelines"
    | "resistance_training_guidelines"
    | "public_health_guidelines"
    | "behavioral_science"
    | "safety_guidance";
  recommendation: string;
  /** IDs from knowledge/scientificSources.ts */
  sourceIds: string[];
};

export type ActivityRequirementInput = {
  activityId: string;
  durationMinutes: number;
  intensity: ActivityIntensity;
  estimatedMET?: number;
  goal?: FitnessGoal;
  consecutiveTrainingDays?: number;
  recoveryScore?: number;
};

export type ActivityRequirementContext = {
  /** Latest requirement from today's logged activities. */
  todayPrimary: ActivityRequirement | null;
  /** All requirements computed for today. */
  todayAll: ActivityRequirement[];
  /** Next-day guidance derived from yesterday's last activity. */
  yesterdayNextDay: NextDayRecommendation | null;
  /** Full requirement from yesterday's last logged activity. */
  yesterdayPrimary: ActivityRequirement | null;
};

export type ActivityRequirementSummary = {
  energyDemand?: EnergyDemandLevel;
  recoveryNeed?: RecoveryNeedLevel;
  nextDayRecommendation?: NextDayRecommendation;
  hydrationPriority?: PriorityLevel;
  proteinPriority?: PriorityLevel;
};
