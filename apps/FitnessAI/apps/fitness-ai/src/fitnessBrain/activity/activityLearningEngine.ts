/**
 * Learns activity habits from logs — no predictions, pattern foundation only.
 */

import type { ActivityIntensity, ActivityLearningSnapshot, ActivityLogEntry } from "./types";

function modeNumber(values: number[]): number {
  if (values.length === 0) return 0;
  const freq = new Map<number, number>();
  for (const v of values) {
    freq.set(v, (freq.get(v) ?? 0) + 1);
  }
  let best = values[0];
  let bestCount = 0;
  for (const [val, count] of freq) {
    if (count > bestCount) {
      best = val;
      bestCount = count;
    }
  }
  return best;
}

function modeTime(times: string[]): string | null {
  if (times.length === 0) return null;
  const hourBuckets = times.map((t) => t.slice(0, 2));
  const freq = new Map<string, number>();
  for (const h of hourBuckets) {
    freq.set(h, (freq.get(h) ?? 0) + 1);
  }
  let bestHour = hourBuckets[0];
  let bestCount = 0;
  for (const [h, c] of freq) {
    if (c > bestCount) {
      bestHour = h;
      bestCount = c;
    }
  }
  return `${bestHour}:00`;
}

function modeIntensity(values: ActivityIntensity[]): ActivityIntensity | null {
  if (values.length === 0) return null;
  const freq: Record<ActivityIntensity, number> = { light: 0, moderate: 0, hard: 0 };
  for (const v of values) freq[v] += 1;
  return (Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null) as ActivityIntensity | null;
}

export function computeActivityLearning(logs: ActivityLogEntry[]): ActivityLearningSnapshot {
  if (logs.length === 0) {
    return {
      favouriteActivities: [],
      typicalDurationByActivity: {},
      mostCommonDurationOverall: 30,
      typicalWorkoutTime: null,
      averageWeeklyFrequency: 0,
      preferredIntensity: null,
      mostActiveWeekdays: [],
    };
  }

  const byActivity = new Map<string, number>();
  const durationByActivity = new Map<string, number[]>();
  const weekdayCounts = new Array(7).fill(0);

  for (const log of logs) {
    byActivity.set(log.activityId, (byActivity.get(log.activityId) ?? 0) + 1);
    const dList = durationByActivity.get(log.activityId) ?? [];
    dList.push(log.durationMinutes);
    durationByActivity.set(log.activityId, dList);

    const day = new Date(`${log.date}T12:00:00`).getDay();
    weekdayCounts[day] += 1;
  }

  const favouriteActivities = [...byActivity.entries()]
    .map(([activityId, count]) => ({ activityId, count }))
    .sort((a, b) => b.count - a.count);

  const typicalDurationByActivity: Record<string, number> = {};
  for (const [id, durations] of durationByActivity) {
    typicalDurationByActivity[id] = Math.round(
      durations.reduce((s, d) => s + d, 0) / durations.length,
    );
  }

  const mostCommonDurationOverall = modeNumber(logs.map((l) => l.durationMinutes));

  const weeks = new Set(logs.map((l) => l.date.slice(0, 7)));
  const averageWeeklyFrequency =
    weeks.size > 0 ? Math.round((logs.length / weeks.size) * 10) / 10 : logs.length;

  const rankedWeekdays = weekdayCounts
    .map((count, day) => ({ day, count }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count);

  const topDays = rankedWeekdays
    .filter((x) => x.count >= Math.max(2, rankedWeekdays[0]?.count * 0.5))
    .map((x) => x.day);

  return {
    favouriteActivities,
    typicalDurationByActivity,
    mostCommonDurationOverall,
    typicalWorkoutTime: modeTime(logs.map((l) => l.time)),
    averageWeeklyFrequency,
    preferredIntensity: modeIntensity(logs.map((l) => l.intensity)),
    mostActiveWeekdays: topDays,
  };
}
