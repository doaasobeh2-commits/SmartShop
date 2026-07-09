/**
 * Persistent activity logs — installation-scoped, feeds Fitness Brain.
 */

import { buildActivityLogEntry } from "./activityLogEngine";
import { computeActivityRequirementFromLog, toActivityRequirementSummary } from "../activityRequirements";
import type {
  ActivityLogEntry,
  SaveActivityLogInput,
  TodayActivitySummary,
} from "./types";
import {
  readInstallationScoped,
  writeInstallationScoped,
} from "../privacy/brainInstallationStorage";
import { syncDailyBehaviorLogFromActivities } from "../storage/behaviorSignals";

export const ACTIVITY_LOGS_STORAGE_KEY = "activity:logs";
const MAX_LOG_ENTRIES = 200;

function loadRawLogs(): ActivityLogEntry[] {
  return readInstallationScoped<ActivityLogEntry[]>(ACTIVITY_LOGS_STORAGE_KEY) ?? [];
}

function saveRawLogs(logs: ActivityLogEntry[]): void {
  writeInstallationScoped(ACTIVITY_LOGS_STORAGE_KEY, logs.slice(-MAX_LOG_ENTRIES));
}

export function getActivityLogs(): ActivityLogEntry[] {
  return loadRawLogs();
}

export function getTodayActivitySummary(date = new Date().toISOString().slice(0, 10)): TodayActivitySummary {
  const today = loadRawLogs().filter((l) => l.date === date);
  const last = today[today.length - 1];
  return {
    count: today.length,
    totalMinutes: today.reduce((s, l) => s + l.durationMinutes, 0),
    lastActivityId: last?.activityId,
    lastIntensity: last?.intensity,
    estimatedCaloriesTotal: today.reduce((s, l) => s + l.estimatedCalories, 0),
  };
}

export function getLastActivityLog(): ActivityLogEntry | null {
  const logs = loadRawLogs();
  return logs.length > 0 ? logs[logs.length - 1] : null;
}

export function shouldOfferQuickRepeat(minSameActivityCount = 2): boolean {
  const last = getLastActivityLog();
  if (!last) return false;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  const sameCount = loadRawLogs().filter(
    (l) => l.activityId === last.activityId && l.date >= cutoffStr,
  ).length;
  return sameCount >= minSameActivityCount;
}

export function saveActivityLog(input: SaveActivityLogInput): ActivityLogEntry | null {
  const entry = buildActivityLogEntry(input);
  if (!entry) return null;

  const logs = loadRawLogs();
  logs.push(entry);
  saveRawLogs(logs);

  const requirement = computeActivityRequirementFromLog(entry);
  syncDailyBehaviorLogFromActivities(
    getTodayActivitySummary(entry.date),
    toActivityRequirementSummary(requirement),
  );
  return entry;
}

export function repeatLastActivityLog(weightKg?: number): ActivityLogEntry | null {
  const last = getLastActivityLog();
  if (!last) return null;
  return saveActivityLog({
    activityId: last.activityId,
    durationMinutes: last.durationMinutes,
    intensity: last.intensity,
    weightKg,
  });
}

export function getRecentActivityLogs(days = 60): ActivityLogEntry[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  return loadRawLogs().filter((l) => l.date >= cutoffStr);
}
