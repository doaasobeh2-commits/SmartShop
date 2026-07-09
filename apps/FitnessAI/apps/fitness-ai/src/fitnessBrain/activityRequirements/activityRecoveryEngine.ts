/**
 * Activity recovery engine — next-day guidance from activity load.
 * Thresholds from knowledge/activityRequirementValues.
 */

import type { ActivityDefinition } from "../lifestyle/activityLibrary";
import type { ActivityIntensity } from "../activity/types";
import { ACTIVITY_REQUIREMENT_VALUES } from "../knowledge";
import type {
  ActivityRequirementInput,
  EnergyDemandLevel,
  NextDayRecommendation,
  RecoveryNeedLevel,
} from "./activityRequirementTypes";

export type ActivityRecoveryAssessment = {
  recoveryNeed: RecoveryNeedLevel;
  nextDayRecommendation: NextDayRecommendation;
  ruleIds: string[];
  reasonParts: string[];
};

const V = ACTIVITY_REQUIREMENT_VALUES;

function intensityWeight(intensity: ActivityIntensity): number {
  return V.intensityWeight[intensity];
}

function mapRecoveryPriority(priority: ActivityDefinition["recoveryPriority"]): RecoveryNeedLevel {
  if (priority === "high") return "high";
  if (priority === "moderate") return "moderate";
  return "low";
}

function bumpRecovery(level: RecoveryNeedLevel): RecoveryNeedLevel {
  if (level === "low") return "moderate";
  return "high";
}

export function computeRecoveryAssessment(
  activity: ActivityDefinition,
  input: ActivityRequirementInput,
  energyDemand: EnergyDemandLevel,
): ActivityRecoveryAssessment {
  const ruleIds: string[] = [];
  const reasonParts: string[] = [];
  const { durationMinutes, intensity, consecutiveTrainingDays = 0, recoveryScore = 70 } = input;
  const isHard = intensity === "hard";
  const isLong = durationMinutes >= V.durationLongMin;
  const isVeryLong = durationMinutes >= V.durationVeryLongMin;

  let recoveryNeed = mapRecoveryPriority(activity.recoveryPriority);

  if (isLong || isHard) {
    recoveryNeed = bumpRecovery(recoveryNeed);
    ruleIds.push("recovery-high-load");
  }
  if (energyDemand === "high" || energyDemand === "very_high") {
    recoveryNeed = bumpRecovery(recoveryNeed);
  }
  if (consecutiveTrainingDays >= V.consecutiveTrainingDaysCaution) {
    recoveryNeed = bumpRecovery(recoveryNeed);
    ruleIds.push("activity-consecutive-training-load");
    reasonParts.push(`${consecutiveTrainingDays} Trainingstage in Folge`);
  }

  let nextDayRecommendation: NextDayRecommendation = "train_normally";

  const lowReadiness =
    recoveryScore < V.recoveryScoreLowMax || recoveryNeed === "high";
  const moderateReadiness =
    recoveryScore < V.recoveryScoreModerateMax || recoveryNeed === "moderate";

  if (
    activity.category === "strength" ||
    activity.category === "combat" ||
    activity.category === "outdoor"
  ) {
    if (lowReadiness || (isHard && isLong)) {
      nextDayRecommendation = "avoid_same_muscle_group";
      ruleIds.push("muscle-group-recovery");
      reasonParts.push("Hohe Muskelbelastung");
    } else if (moderateReadiness) {
      nextDayRecommendation = "light_activity";
    }
  } else if (
    (activity.id === "running" || activity.id === "cycling" || activity.category === "sport") &&
    isVeryLong &&
    isHard
  ) {
    nextDayRecommendation = "avoid_same_muscle_group";
    ruleIds.push("next-day-light-after-hard-cardio", "muscle-group-recovery");
    reasonParts.push("Lange harte Ausdauereinheit");
  } else if (lowReadiness) {
    nextDayRecommendation = "rest_recommended";
    ruleIds.push("recovery-high-load", "activity-consecutive-training-load");
    reasonParts.push("Erhöhter Erholungsbedarf");
  } else if (moderateReadiness || (isLong && isHard)) {
    nextDayRecommendation = "light_activity";
    ruleIds.push("next-day-light-after-hard-cardio");
    reasonParts.push("Moderate Erholung sinnvoll");
  }

  if (
    activity.category === "mind_body" &&
    intensity === "light" &&
    durationMinutes <= V.durationLongMin
  ) {
    nextDayRecommendation = "train_normally";
    recoveryNeed = "low";
  }

  const lowerBodySet = new Set<string>(V.lowerBodyMuscleGroups);
  if (
    nextDayRecommendation === "avoid_same_muscle_group" &&
    activity.primaryMuscles.some((m) => lowerBodySet.has(m)) &&
    !reasonParts.some((p) => p.includes("Unterkörper"))
  ) {
    reasonParts.push("Unterkörper beansprucht");
  }

  return { recoveryNeed, nextDayRecommendation, ruleIds, reasonParts };
}

export function estimateEnergyDemand(
  activity: ActivityDefinition,
  input: ActivityRequirementInput,
): EnergyDemandLevel {
  const met =
    input.estimatedMET ?? (activity.metMin + activity.metMax) / 2;
  const loadScore = met * input.durationMinutes * intensityWeight(input.intensity);

  let level: EnergyDemandLevel = "low";
  if (loadScore >= V.energyLoadVeryHighMin) level = "very_high";
  else if (loadScore >= V.energyLoadHighMin) level = "high";
  else if (loadScore >= V.energyLoadModerateMin) level = "moderate";

  if (
    (activity.category === "strength" || activity.category === "combat") &&
    input.intensity === "hard" &&
    input.durationMinutes >= V.durationStrengthHardMin
  ) {
    if (level === "moderate") level = "high";
    else if (level === "low") level = "moderate";
  }

  return level;
}
