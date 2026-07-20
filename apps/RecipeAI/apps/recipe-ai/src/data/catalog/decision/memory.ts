import type { MealCookEvent, MealFeedbackEvent } from "@recipe-ai/core/types";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Keep only the latest feedback event per recipe (no stacking). */
function latestFeedbackByRecipe(
  events: MealFeedbackEvent[] | undefined,
): MealFeedbackEvent[] {
  if (!events?.length) return [];
  const map = new Map<string, MealFeedbackEvent>();
  for (const event of events) {
    const prev = map.get(event.recipeId);
    if (!prev || event.at >= prev.at) map.set(event.recipeId, event);
  }
  return [...map.values()];
}

/** Completed cook events only — cook-start must never appear here. */
function completedCookEvents(
  events: MealCookEvent[] | undefined,
): MealCookEvent[] {
  if (!events?.length) return [];
  const completed = events.filter(
    (e) => e.kind === "completed" || e.kind === undefined,
  );
  // One completion signal per recipe (latest) — prevent tap-stacking penalties.
  const map = new Map<string, MealCookEvent>();
  for (const event of completed) {
    const prev = map.get(event.recipeId);
    if (!prev || event.at >= prev.at) map.set(event.recipeId, event);
  }
  return [...map.values()];
}

export function feedbackScore(
  recipeId: string,
  events: MealFeedbackEvent[] | undefined,
  now = Date.now(),
): number {
  const latest = latestFeedbackByRecipe(events).find(
    (e) => e.recipeId === recipeId,
  );
  if (!latest) return 0;
  const ageDays = (now - latest.at) / DAY_MS;
  const decay = Math.exp(-ageDays / 45);
  if (latest.rating === "loved") return 12 * decay;
  if (latest.rating === "good") return 5 * decay;
  if (latest.rating === "not-for-us") return -18 * decay;
  return 0;
}

/** Recently cooked dishes get a repetition penalty (not a ban). */
export function recentCookPenalty(
  recipeId: string,
  events: MealCookEvent[] | undefined,
  now = Date.now(),
): number {
  const latest = completedCookEvents(events).find(
    (e) => e.recipeId === recipeId,
  );
  if (!latest) return 0;
  const ageDays = (now - latest.at) / DAY_MS;
  if (ageDays <= 2) return 25;
  if (ageDays <= 5) return 14;
  if (ageDays <= 10) return 6;
  return 0;
}

export function wasRecentlyRejected(
  recipeId: string,
  events: MealFeedbackEvent[] | undefined,
  now = Date.now(),
): boolean {
  const latest = latestFeedbackByRecipe(events).find(
    (e) => e.recipeId === recipeId,
  );
  if (!latest) return false;
  return latest.rating === "not-for-us" && now - latest.at < 21 * DAY_MS;
}
