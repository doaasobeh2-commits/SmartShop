/**
 * Calendar-aware rolling weekly plan anchors.
 * Internal only — UI shows weekday labels from each day's date.
 */

/** After this local hour, “today” is no longer eligible as the plan’s first day. */
export const DEFAULT_PLANNING_CUTOFF_HOUR_LOCAL = 17;

export function formatLocalIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseLocalIsoDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y!, (m ?? 1) - 1, d ?? 1);
}

export function addLocalDays(date: Date, days: number): Date {
  const next = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + days,
  );
  return next;
}

/** 0 = Monday … 6 = Sunday */
export function weekdayIndexFromDate(date: Date): number {
  return (date.getDay() + 6) % 7;
}

/**
 * First dinner day of the rolling 7-day plan.
 * Before cutoff → today; at/after cutoff → tomorrow.
 */
export function resolvePlanningStartDate(
  now: Date = new Date(),
  cutoffHourLocal: number = DEFAULT_PLANNING_CUTOFF_HOUR_LOCAL,
): Date {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (now.getHours() >= cutoffHourLocal) {
    start.setDate(start.getDate() + 1);
  }
  return start;
}

export function resolvePlanStartKey(
  now: Date = new Date(),
  cutoffHourLocal: number = DEFAULT_PLANNING_CUTOFF_HOUR_LOCAL,
): string {
  return formatLocalIsoDate(resolvePlanningStartDate(now, cutoffHourLocal));
}

/** @deprecated Use resolvePlanStartKey — kept for migration of older tests/call sites */
export function mondayWeekStart(date: Date = new Date()): string {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return formatLocalIsoDate(d);
}
