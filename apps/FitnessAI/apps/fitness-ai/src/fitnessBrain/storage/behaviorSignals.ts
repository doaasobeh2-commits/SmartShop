/**
 * Persistent daily behavior signals for Fitness Brain.
 * General fitness tracking — not medical monitoring.
 */

import type { AppBrainInput } from "../mapUserData";
import type { TodayActivitySummary } from "../activity/types";
import {
  readInstallationScoped,
  writeInstallationScoped,
} from "../privacy/brainInstallationStorage";

const LOGS_KEY = "behavior:daily-logs";
export const BEHAVIOR_LOGS_STORAGE_KEY = LOGS_KEY;
const MAX_LOG_DAYS = 30;

export type DailyBehaviorLog = {
  date: string;
  trained: boolean;
  workoutCompleted: boolean;
  waterLiters: number;
  proteinEatenG: number;
  caloriesEaten: number;
  sleepHours?: number;
  activityCount?: number;
  activityMinutes?: number;
  lastActivityId?: string;
  lastActivityEnergyDemand?: string;
  lastActivityRecoveryNeed?: string;
  lastActivityNextDayHint?: string;
};

export type BehaviorSignals = {
  trainedYesterday: boolean;
  consecutiveTrainingDays: number;
  lastWorkoutDate: string | null;
  dailyAdherence: number;
  sleepHours?: number;
  /** Present only when water was logged today — unknown ≠ 0 L. */
  waterIntake?: number;
  /** Present only when meals were logged today. */
  proteinProgress?: number;
  calorieProgress?: number;
  missedWorkoutYesterday: boolean;
};

export type BehaviorTargets = {
  proteinGoalG: number;
  calorieTargetKcal: number;
  waterGoalLiters: number;
};

function todayDateStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function offsetDateStr(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function loadLogs(): DailyBehaviorLog[] {
  return readInstallationScoped<DailyBehaviorLog[]>(LOGS_KEY) ?? [];
}

function saveLogs(logs: DailyBehaviorLog[]): void {
  writeInstallationScoped(LOGS_KEY, logs.slice(-MAX_LOG_DAYS));
}

/** Upsert today's log from current app activity + optional activity summary. */
export function syncDailyBehaviorLog(
  input: AppBrainInput,
  activitySummary?: TodayActivitySummary,
): DailyBehaviorLog {
  const date = todayDateStr();
  const completed = input.exercises.filter((e) => e.done).length;
  const total = input.exercises.length;
  const proteinEatenG = input.meals.reduce((s, m) => s + (m.proteinG ?? 0), 0);
  const caloriesEaten = input.meals.reduce((s, m) => s + m.kcal, 0);
  const summary = activitySummary ?? { count: 0, totalMinutes: 0, estimatedCaloriesTotal: 0 };

  const entry: DailyBehaviorLog = {
    date,
    trained: completed > 0 || summary.count > 0,
    workoutCompleted: total > 0 && completed === total,
    waterLiters: input.waterLiters ?? 0,
    proteinEatenG,
    caloriesEaten,
    activityCount: summary.count,
    activityMinutes: summary.totalMinutes,
    lastActivityId: summary.lastActivityId,
  };

  const logs = loadLogs().filter((l) => l.date !== date);
  logs.push(entry);
  saveLogs(logs);
  return entry;
}

/** Called when an activity is logged — merges into today's behavior log. */
export function syncDailyBehaviorLogFromActivities(
  summary: TodayActivitySummary,
  requirementSummary?: {
    energyDemand?: string;
    recoveryNeed?: string;
    nextDayRecommendation?: string;
  },
): void {
  const date = new Date().toISOString().slice(0, 10);
  const logs = loadLogs();
  const existing = logByDate(logs, date);

  const entry: DailyBehaviorLog = {
    date,
    trained: true,
    workoutCompleted: existing?.workoutCompleted ?? false,
    waterLiters: existing?.waterLiters ?? 0,
    proteinEatenG: existing?.proteinEatenG ?? 0,
    caloriesEaten: existing?.caloriesEaten ?? 0,
    sleepHours: existing?.sleepHours,
    activityCount: summary.count,
    activityMinutes: summary.totalMinutes,
    lastActivityId: summary.lastActivityId,
    lastActivityEnergyDemand: requirementSummary?.energyDemand,
    lastActivityRecoveryNeed: requirementSummary?.recoveryNeed,
    lastActivityNextDayHint: requirementSummary?.nextDayRecommendation,
  };

  const next = logs.filter((l) => l.date !== date);
  next.push(entry);
  saveLogs(next);
}

function logByDate(logs: DailyBehaviorLog[], date: string): DailyBehaviorLog | undefined {
  return logs.find((l) => l.date === date);
}

function countConsecutiveFromToday(logs: DailyBehaviorLog[]): number {
  const byDate = new Map(logs.map((l) => [l.date, l]));
  let count = 0;
  let dayOffset = 0;
  while (dayOffset < MAX_LOG_DAYS) {
    const date = offsetDateStr(-dayOffset);
    const log = byDate.get(date);
    if (!log?.trained) break;
    count += 1;
    dayOffset += 1;
  }
  return count;
}

function findLastWorkoutDate(logs: DailyBehaviorLog[]): string | null {
  const sorted = [...logs].filter((l) => l.trained).sort((a, b) => b.date.localeCompare(a.date));
  return sorted[0]?.date ?? null;
}

function computeDailyAdherence(logs: DailyBehaviorLog[], streakDays: number): number {
  const recent = logs.slice(-7);
  if (recent.length === 0) return Math.min(streakDays * 10, 100);
  const trainedDays = recent.filter((l) => l.trained).length;
  const mealDays = recent.filter((l) => l.caloriesEaten > 0).length;
  const raw = ((trainedDays + mealDays) / (recent.length * 2)) * 100;
  return Math.round(Math.min(Math.max(raw, 0), 100));
}

export function computeBehaviorSignals(
  logs: DailyBehaviorLog[],
  todayLog: DailyBehaviorLog,
  targets: BehaviorTargets,
  streakDays: number,
  yesterdayWasTrainingDay: boolean,
): BehaviorSignals {
  const yesterday = offsetDateStr(-1);
  const yesterdayLog = logByDate(logs, yesterday);

  const trainedYesterday = yesterdayLog?.trained ?? false;
  const consecutiveTrainingDays = countConsecutiveFromToday(logs);
  const lastWorkoutDate = findLastWorkoutDate(logs);
  const dailyAdherence = computeDailyAdherence(logs, streakDays);

  const nutritionLogged = todayLog.caloriesEaten > 0 || todayLog.proteinEatenG > 0;
  const waterLogged = todayLog.waterLiters > 0;

  const proteinProgress =
    nutritionLogged && targets.proteinGoalG > 0
      ? todayLog.proteinEatenG / targets.proteinGoalG
      : undefined;
  const calorieProgress =
    nutritionLogged && targets.calorieTargetKcal > 0
      ? todayLog.caloriesEaten / targets.calorieTargetKcal
      : undefined;

  const missedWorkoutYesterday =
    yesterdayWasTrainingDay && yesterdayLog !== undefined && !yesterdayLog.trained;

  return {
    trainedYesterday,
    consecutiveTrainingDays,
    lastWorkoutDate,
    dailyAdherence,
    sleepHours: todayLog.sleepHours,
    ...(waterLogged
      ? { waterIntake: Math.min(Math.max(todayLog.waterLiters, 0), targets.waterGoalLiters * 2) }
      : {}),
    ...(proteinProgress !== undefined
      ? { proteinProgress: Math.min(Math.max(proteinProgress, 0), 1.5) }
      : {}),
    ...(calorieProgress !== undefined
      ? { calorieProgress: Math.min(Math.max(calorieProgress, 0), 1.5) }
      : {}),
    missedWorkoutYesterday,
  };
}

export function getBehaviorLogs(): DailyBehaviorLog[] {
  return loadLogs();
}

/** Seed sample history for development — optional, safe defaults in production. */
export function seedBehaviorLogs(entries: DailyBehaviorLog[]): void {
  saveLogs(entries);
}
