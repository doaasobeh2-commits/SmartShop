/**
 * Recovery Engine — readiness from persisted behavior signals.
 * Scoring from knowledge/recoveryRules — not medical diagnosis.
 */

import type { ActivityRequirement } from "./activityRequirements/activityRequirementTypes";
import {
  computeRecoveryScore,
  getEngineDisclaimer,
  hasRecoverySignals,
  isOvertrainingRisk,
  RECOVERY_SUMMARIES,
  RECOVERY_VALUES,
  resolveRecoveryLevel,
} from "./knowledge";
import type { RecoveryAssessment, RecoveryLevel, UserDataInput } from "./types";

function mapLevelToLegacyStatus(level: RecoveryLevel): RecoveryAssessment["status"] {
  switch (level) {
    case "low_recovery":
    case "overtraining_risk":
      return "rest_suggested";
    case "normal_recovery":
      return "caution";
    case "good_recovery":
      return "ready";
    default:
      return "neutral";
  }
}

function activityRecoveryPenalty(req: ActivityRequirement | null | undefined): number {
  if (!req) return 0;
  let penalty = 0;
  if (req.recoveryNeed === "high") penalty += RECOVERY_VALUES.activityRecoveryNeedHighPenalty;
  else if (req.recoveryNeed === "moderate") penalty += RECOVERY_VALUES.activityRecoveryNeedModeratePenalty;
  if (req.energyDemand === "very_high") penalty += RECOVERY_VALUES.activityVeryHighEnergyPenalty;
  return penalty;
}

export function assessRecovery(
  userData: UserDataInput = {},
  options: { todayActivityRequirement?: ActivityRequirement | null } = {},
): RecoveryAssessment {
  const activityMinutes = userData.activityMinutesToday ?? 0;
  const lastIntensity = userData.lastActivityIntensity;
  const todayReq = options.todayActivityRequirement;
  const v = RECOVERY_VALUES;

  const signalInput = {
    consecutiveTrainingDays: userData.consecutiveTrainingDays ?? 0,
    trainedYesterday: userData.trainedYesterday ?? false,
    adherence: userData.dailyAdherence ?? userData.adherenceScore ?? 0,
    sleepHours: userData.sleepHours,
    exercisesCompletedToday: userData.exercisesCompletedToday ?? 0,
  };

  const hasSignals =
    hasRecoverySignals(signalInput) || activityMinutes > 0 || todayReq !== null;

  if (!hasSignals) {
    return {
      level: "neutral",
      status: "neutral",
      score: v.neutralScore,
      summary: "Not enough data for a recovery assessment yet.",
      disclaimer: getEngineDisclaimer("recovery"),
    };
  }

  let score = computeRecoveryScore(signalInput);

  if (activityMinutes >= v.activityHardMinutesLong && lastIntensity === "hard") {
    score -= v.activityHardMinutes60Penalty;
  } else if (activityMinutes >= v.activityHardMinutesModerate && lastIntensity === "hard") {
    score -= v.activityHardMinutes45Penalty;
  }

  score -= activityRecoveryPenalty(todayReq);
  score = Math.min(Math.max(score, v.scoreMin), v.scoreMax);

  const overtrainingRisk = isOvertrainingRisk(signalInput);
  const level = resolveRecoveryLevel(score, overtrainingRisk) as RecoveryLevel;

  let summary = RECOVERY_SUMMARIES[level];
  if (
    userData.sleepHours === undefined &&
    (userData.consecutiveTrainingDays ?? 0) > 0 &&
    level !== "neutral"
  ) {
    summary = `${summary} Sleep was not recorded — unknown sleep is not treated as poor sleep.`;
  }

  return {
    level,
    status: mapLevelToLegacyStatus(level),
    score,
    summary,
    disclaimer: getEngineDisclaimer("recovery"),
  };
}
