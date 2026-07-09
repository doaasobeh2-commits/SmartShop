/**
 * Life Pattern Engine — learns long-term behaviour from weeks/months of logs.
 * Foundation only: detection, not prediction.
 */

import type { DailyBehaviorLog } from "../storage/behaviorSignals";
import {
  PATTERN_MIN_DAYS_EMERGING,
  PATTERN_MIN_DAYS_ESTABLISHED,
  PATTERN_THRESHOLDS,
} from "./lifestyleDefaults";
import type { LifePattern, LifestyleProfile } from "./lifestyleProfile";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function dayOfWeek(dateStr: string): number {
  return new Date(`${dateStr}T12:00:00`).getDay();
}

function isWeekend(day: number): boolean {
  return day === 0 || day === 6;
}

function confidenceForEvidence(days: number): LifePattern["confidence"] | null {
  if (days >= PATTERN_MIN_DAYS_ESTABLISHED) return "established";
  if (days >= PATTERN_MIN_DAYS_EMERGING) return "emerging";
  return null;
}

function detectUsualTrainingDays(
  logs: DailyBehaviorLog[],
  activityLogs: import("../activity/types").ActivityLogEntry[],
): LifePattern | null {
  const trained = logs.filter((l) => l.trained);
  const byDay = new Array(7).fill(0);

  for (const log of trained) {
    byDay[dayOfWeek(log.date)] += 1;
  }
  for (const log of activityLogs) {
    byDay[dayOfWeek(log.date)] += 1;
  }

  const totalEvidence = trained.length + activityLogs.length;
  if (totalEvidence < PATTERN_MIN_DAYS_EMERGING) return null;

  const ranked = byDay
    .map((count, day) => ({ day, count }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count);

  const topDays = ranked
    .filter((x) => x.count >= Math.max(PATTERN_THRESHOLDS.trainingDayTopRankMinCount, ranked[0].count * PATTERN_THRESHOLDS.trainingDayTopRankRatio))
    .map((x) => x.day);
  if (topDays.length === 0) return null;

  const confidence = confidenceForEvidence(totalEvidence);
  if (!confidence) return null;

  return {
    id: "pattern-usual-training-days",
    type: "usual_training_days",
    description: "Recurring training days observed from logged workout history.",
    confidence,
    evidenceDays: totalEvidence,
    detectedAt: todayIso(),
    payload: { usualDays: topDays, sessionsLogged: totalEvidence },
  };
}

function detectWeekendMovement(logs: DailyBehaviorLog[]): LifePattern | null {
  if (logs.length < PATTERN_MIN_DAYS_EMERGING) return null;

  const weekday = logs.filter((l) => !isWeekend(dayOfWeek(l.date)));
  const weekend = logs.filter((l) => isWeekend(dayOfWeek(l.date)));
  if (weekday.length < PATTERN_THRESHOLDS.weekdayMinLogs || weekend.length < PATTERN_THRESHOLDS.weekendMinLogs) return null;

  const weekdayTrainRate = weekday.filter((l) => l.trained).length / weekday.length;
  const weekendTrainRate = weekend.filter((l) => l.trained).length / weekend.length;
  const weekdayWater = weekday.reduce((s, l) => s + l.waterLiters, 0) / weekday.length;
  const weekendWater = weekend.reduce((s, l) => s + l.waterLiters, 0) / weekend.length;

  const moreWeekendMovement =
    weekendTrainRate > weekdayTrainRate + PATTERN_THRESHOLDS.weekendTrainRateLift ||
    weekendWater > weekdayWater * PATTERN_THRESHOLDS.weekendWaterRatioLift;

  if (!moreWeekendMovement) return null;

  const confidence = confidenceForEvidence(logs.length);
  if (!confidence) return null;

  return {
    id: "pattern-weekend-more-movement",
    type: "weekend_more_movement",
    description: "Higher movement or hydration tendency on weekends compared to weekdays.",
    confidence,
    evidenceDays: logs.length,
    detectedAt: todayIso(),
    payload: {
      weekdayTrainRate: Math.round(weekdayTrainRate * 100),
      weekendTrainRate: Math.round(weekendTrainRate * 100),
      weekdayAvgWaterL: Math.round(weekdayWater * 10) / 10,
      weekendAvgWaterL: Math.round(weekendWater * 10) / 10,
    },
  };
}

function detectWeekdayLowHydration(logs: DailyBehaviorLog[]): LifePattern | null {
  if (logs.length < PATTERN_MIN_DAYS_EMERGING) return null;

  const weekday = logs.filter((l) => !isWeekend(dayOfWeek(l.date)));
  const weekend = logs.filter((l) => isWeekend(dayOfWeek(l.date)));
  if (weekday.length < PATTERN_THRESHOLDS.weekdayMinLogs || weekend.length < PATTERN_THRESHOLDS.weekendMinLogs) return null;

  const weekdayWater = weekday.reduce((s, l) => s + l.waterLiters, 0) / weekday.length;
  const weekendWater = weekend.reduce((s, l) => s + l.waterLiters, 0) / weekend.length;

  if (weekdayWater >= weekendWater * PATTERN_THRESHOLDS.weekdayHydrationBelowWeekendRatio) return null;

  const confidence = confidenceForEvidence(logs.length);
  if (!confidence) return null;

  return {
    id: "pattern-weekday-low-hydration",
    type: "weekday_low_hydration",
    description: "Lower average hydration on workdays compared to weekends.",
    confidence,
    evidenceDays: logs.length,
    detectedAt: todayIso(),
    payload: {
      weekdayAvgWaterL: Math.round(weekdayWater * 10) / 10,
      weekendAvgWaterL: Math.round(weekendWater * 10) / 10,
    },
  };
}

function detectLateSleepAfterShifts(
  logs: DailyBehaviorLog[],
  profile: LifestyleProfile,
): LifePattern | null {
  const shift = profile.work.schedule;
  if (shift !== "night_shift" && shift !== "rotating_shifts") return null;

  const withSleep = logs.filter((l) => l.sleepHours !== undefined);
  if (withSleep.length < PATTERN_MIN_DAYS_EMERGING) return null;

  const avgSleep = withSleep.reduce((s, l) => s + (l.sleepHours ?? 0), 0) / withSleep.length;
  if (avgSleep >= PATTERN_THRESHOLDS.shiftSleepMaxHours) return null;

  const confidence = confidenceForEvidence(withSleep.length);
  if (!confidence) return null;

  return {
    id: "pattern-late-sleep-shifts",
    type: "late_sleep_after_shifts",
    description: "Shorter logged sleep associated with shift-work schedule in profile.",
    confidence,
    evidenceDays: withSleep.length,
    detectedAt: todayIso(),
    payload: {
      averageSleepHours: Math.round(avgSleep * 10) / 10,
      workSchedule: shift,
    },
  };
}

function detectMealLoggingConsistency(logs: DailyBehaviorLog[]): LifePattern | null {
  const withMeals = logs.filter((l) => l.caloriesEaten > 0);
  if (withMeals.length < PATTERN_MIN_DAYS_EMERGING) return null;

  const rate = withMeals.length / logs.length;
  if (rate < PATTERN_THRESHOLDS.mealLoggingMinRate) return null;

  const confidence = confidenceForEvidence(withMeals.length);
  if (!confidence) return null;

  return {
    id: "pattern-consistent-meal-logging",
    type: "consistent_meal_logging",
    description: "Regular daily meal logging observed over recent history.",
    confidence,
    evidenceDays: withMeals.length,
    detectedAt: todayIso(),
    payload: { loggingRatePct: Math.round(rate * 100) },
  };
}

function detectWeekendHigherHydration(logs: DailyBehaviorLog[]): LifePattern | null {
  if (logs.length < PATTERN_MIN_DAYS_EMERGING) return null;

  const weekday = logs.filter((l) => !isWeekend(dayOfWeek(l.date)));
  const weekend = logs.filter((l) => isWeekend(dayOfWeek(l.date)));
  if (weekday.length < PATTERN_THRESHOLDS.weekdayMinLogs || weekend.length < PATTERN_THRESHOLDS.weekendMinLogs) {
    return null;
  }

  const weekdayWater = weekday.reduce((s, l) => s + l.waterLiters, 0) / weekday.length;
  const weekendWater = weekend.reduce((s, l) => s + l.waterLiters, 0) / weekend.length;

  if (weekendWater <= weekdayWater * PATTERN_THRESHOLDS.weekendWaterRatioLift) return null;

  const confidence = confidenceForEvidence(logs.length);
  if (!confidence) return null;

  return {
    id: "pattern-weekend-higher-hydration",
    type: "weekend_higher_hydration",
    description: "Higher average hydration on weekends compared to weekdays.",
    confidence,
    evidenceDays: logs.length,
    detectedAt: todayIso(),
    payload: {
      weekdayAvgWaterL: Math.round(weekdayWater * 10) / 10,
      weekendAvgWaterL: Math.round(weekendWater * 10) / 10,
    },
  };
}

function detectMorningWorkoutTendency(profile: LifestyleProfile): LifePattern | null {
  const time = profile.training.preferredTrainingTime;
  if (time !== "morning") return null;

  return {
    id: "pattern-morning-workout-preference",
    type: "morning_workout_tendency",
    description: "User prefers morning training — stored in lifestyle profile.",
    confidence: "established",
    evidenceDays: 0,
    detectedAt: todayIso(),
    payload: { preferredTrainingTime: time, source: "profile" },
  };
}

export function detectLifePatterns(
  logs: DailyBehaviorLog[],
  profile: LifestyleProfile,
  activityLogs: import("../activity/types").ActivityLogEntry[] = [],
): LifePattern[] {
  const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  const detectors = [
    detectUsualTrainingDays(sorted, activityLogs),
    detectWeekendMovement(sorted),
    detectWeekdayLowHydration(sorted),
    detectWeekendHigherHydration(sorted),
    detectLateSleepAfterShifts(sorted, profile),
    detectMealLoggingConsistency(sorted),
    detectMorningWorkoutTendency(profile),
  ];

  return detectors.filter((p): p is LifePattern => p !== null);
}
