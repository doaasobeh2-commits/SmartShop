/**
 * Activity Requirement Engine — physiological meaning of logged activities.
 * Uses Activity Library metadata + session context. Hidden from user UI.
 */

import type { ActivityLogEntry } from "../activity/types";
import { getActivityById } from "../lifestyle/activityLibrary";
import type { FitnessGoal, NormalizedUserProfile, UserDataInput } from "../types";
import { computeFuelingAssessment } from "./activityFuelingEngine";
import {
  computeRecoveryAssessment,
  estimateEnergyDemand,
} from "./activityRecoveryEngine";
import type {
  ActivityRequirement,
  ActivityRequirementContext,
  ActivityRequirementInput,
  ActivityRequirementSummary,
  RequirementConfidence,
} from "./activityRequirementTypes";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function offsetDateIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function uniqueRules(ids: string[]): string[] {
  return [...new Set(ids)];
}

function buildReason(parts: string[], activityName: string, durationMinutes: number): string {
  const joined = parts.filter(Boolean).join(" · ");
  return joined
    ? `${activityName} (${durationMinutes} Min.) — ${joined}`
    : `${activityName} (${durationMinutes} Min.)`;
}

function resolveConfidence(
  hasLibrary: boolean,
  hasMet: boolean,
): RequirementConfidence {
  if (hasLibrary && hasMet) return "high";
  if (hasLibrary) return "medium";
  return "low";
}

/** Computes full activity requirement from library + session input. */
export function computeActivityRequirement(
  input: ActivityRequirementInput,
): ActivityRequirement | null {
  const activity = getActivityById(input.activityId);
  if (!activity) return null;

  const energyDemand = estimateEnergyDemand(activity, input);
  const fueling = computeFuelingAssessment(activity, input, energyDemand);
  const recovery = computeRecoveryAssessment(activity, input, energyDemand);

  const ruleIds = uniqueRules([
    "energy-demand-met-duration",
    "general-fitness-guidance-only",
    ...fueling.ruleIds,
    ...recovery.ruleIds,
  ]);

  const reasonParts = [...fueling.reasonParts, ...recovery.reasonParts];

  return {
    activityId: input.activityId,
    energyDemand,
    fuelingNeed: fueling.fuelingNeed,
    proteinPriority: fueling.proteinPriority,
    hydrationPriority: fueling.hydrationPriority,
    recoveryNeed: recovery.recoveryNeed,
    muscleGroupLoad: [...activity.primaryMuscles],
    nextDayRecommendation: recovery.nextDayRecommendation,
    reason: buildReason(reasonParts, activity.name, input.durationMinutes),
    confidence: resolveConfidence(true, input.estimatedMET !== undefined),
    supportingRuleIds: ruleIds,
  };
}

export function computeActivityRequirementFromLog(
  log: ActivityLogEntry,
  ctx: {
    goal?: FitnessGoal;
    consecutiveTrainingDays?: number;
    recoveryScore?: number;
  } = {},
): ActivityRequirement | null {
  return computeActivityRequirement({
    activityId: log.activityId,
    durationMinutes: log.durationMinutes,
    intensity: log.intensity,
    estimatedMET: log.estimatedMET,
    goal: ctx.goal,
    consecutiveTrainingDays: ctx.consecutiveTrainingDays,
    recoveryScore: ctx.recoveryScore,
  });
}

export function buildActivityRequirementContext(
  activityLogs: ActivityLogEntry[],
  userProfile: NormalizedUserProfile,
  userData: UserDataInput = {},
  recoveryScore?: number,
): ActivityRequirementContext {
  const today = todayIso();
  const yesterday = offsetDateIso(-1);

  const ctxBase = {
    goal: userProfile.goal,
    consecutiveTrainingDays: userData.consecutiveTrainingDays ?? 0,
    recoveryScore,
  };

  const todayAll = activityLogs
    .filter((l) => l.date === today)
    .map((l) => computeActivityRequirementFromLog(l, ctxBase))
    .filter((r): r is ActivityRequirement => r !== null);

  const yesterdayLogs = activityLogs.filter((l) => l.date === yesterday);
  const yesterdayLast = yesterdayLogs[yesterdayLogs.length - 1];
  const yesterdayPrimary = yesterdayLast
    ? computeActivityRequirementFromLog(yesterdayLast, ctxBase)
    : null;

  return {
    todayPrimary: todayAll.length > 0 ? todayAll[todayAll.length - 1] : null,
    todayAll,
    yesterdayNextDay: yesterdayPrimary?.nextDayRecommendation ?? null,
    yesterdayPrimary,
  };
}

export function toActivityRequirementSummary(
  req: ActivityRequirement | null,
): ActivityRequirementSummary | undefined {
  if (!req) return undefined;
  return {
    energyDemand: req.energyDemand,
    recoveryNeed: req.recoveryNeed,
    nextDayRecommendation: req.nextDayRecommendation,
    hydrationPriority: req.hydrationPriority,
    proteinPriority: req.proteinPriority,
  };
}
