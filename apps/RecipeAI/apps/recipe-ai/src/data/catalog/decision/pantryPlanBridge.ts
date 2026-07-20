/**
 * Pantry ↔ Today / Weekly Plan bridge.
 * Decisions are explicit: never auto-mutate a saved rolling plan.
 */
import type {
  CuisineFamilyId,
  DayPlanIntent,
  FuturePlanCandidate,
  MealFeedbackEvent,
  WeekDayPlan,
} from "@recipe-ai/core/types";
import { getDishById, listAllDishes } from "../dishes";
import type { DishCatalogEntry } from "../types";
import { dayIntentFit } from "./dayIntent";
import { composeMealForMain } from "./mealComposition";
import { wasRecentlyRejected } from "./memory";
import {
  formatLocalIsoDate,
  DEFAULT_PLANNING_CUTOFF_HOUR_LOCAL,
} from "./planningCalendar";
import {
  matchPantryDishes,
  parseHeadcount,
  scorePantryDish,
} from "./pantry";
import {
  assessDishQuantityReadiness,
  parsePantryItems,
  pantryItemsToTokens,
  type DishQuantityAssessment,
} from "./pantryQuantity";
import { applyHardSafety, isDinnerComplete } from "./safety";
import type { DecisionContext } from "./types";

export function todayPlanDateKey(
  now: Date = new Date(),
): string {
  return formatLocalIsoDate(now);
}

export function findTodayPlanDay(
  plan: WeekDayPlan[],
  now: Date = new Date(),
): WeekDayPlan | undefined {
  const key = todayPlanDateKey(now);
  return plan.find((d) => d.date === key);
}

export type ReplaceTodayPlanResult = {
  plan: WeekDayPlan[];
  replacedDayOffset: number;
  previousMainId: string;
  previousCompanionIds: string[];
  dayIntent: DayPlanIntent;
};

/**
 * REPLACE_TODAY_PLAN — today only; preserves dayIntent; recomposes MealComposition.
 */
export function replaceTodayPlanMain(
  plan: WeekDayPlan[],
  newMainRecipeId: string,
  ctx: Pick<
    DecisionContext,
    "allergies" | "dietType" | "hostCuisineIds"
  >,
  now: Date = new Date(),
): ReplaceTodayPlanResult | null {
  const today = findTodayPlanDay(plan, now);
  if (!today) return null;

  const dish = getDishById(newMainRecipeId);
  if (!dish || !isDinnerComplete(dish)) return null;

  const safe = applyHardSafety([dish], ctx);
  if (safe.length === 0) return null;

  const usedCompanions = plan
    .filter((d) => d.dayOffset !== today.dayOffset)
    .flatMap((d) => d.meal.companionRecipeIds);
  const meal = composeMealForMain(dish, ctx, usedCompanions);

  const previousMainId = today.recipeId;
  const previousCompanionIds = [...today.meal.companionRecipeIds];
  const dayIntent = today.dayIntent ?? "auto";

  const next = plan.map((d) =>
    d.dayOffset === today.dayOffset
      ? {
          ...d,
          recipeId: meal.mainRecipeId,
          meal,
          dayIntent,
          alternateRecipeId:
            previousMainId !== meal.mainRecipeId
              ? previousMainId
              : d.alternateRecipeId,
        }
      : d,
  );

  return {
    plan: next,
    replacedDayOffset: today.dayOffset,
    previousMainId,
    previousCompanionIds,
    dayIntent,
  };
}

/** Other days must remain logically unchanged after a today-only replace. */
export function otherDaysUnchanged(
  before: WeekDayPlan[],
  after: WeekDayPlan[],
  todayOffset: number,
): boolean {
  if (before.length !== after.length) return false;
  for (let i = 0; i < before.length; i++) {
    const a = before[i]!;
    const b = after[i]!;
    if (a.dayOffset === todayOffset) continue;
    if (JSON.stringify(a) !== JSON.stringify(b)) return false;
  }
  return true;
}

export type PlannedMealPantryConflict = {
  plannedRecipeId: string;
  /** Only true when evidence is strong enough to speak calmly */
  mayNotHaveEnough: boolean;
  quantity: DishQuantityAssessment | null;
  missingCriticalPresence: boolean;
  alternatives: string[];
  dayIntent: DayPlanIntent;
};

/**
 * Assess today's planned meal against pantry reality.
 * Never auto-replaces — only informs calm UI.
 */
export function assessPlannedMealVsPantry(input: {
  plan: WeekDayPlan[];
  query: string;
  allergies: string[];
  dietType?: string;
  hostCuisineIds: CuisineFamilyId[];
  locale?: DecisionContext["locale"];
  now?: Date;
  limit?: number;
}): PlannedMealPantryConflict | null {
  const now = input.now ?? new Date();
  const today = findTodayPlanDay(input.plan, now);
  if (!today) return null;

  const planned = getDishById(today.recipeId);
  if (!planned || !isDinnerComplete(planned)) return null;

  const pantryItems = parsePantryItems(input.query);
  const tokens = pantryItemsToTokens(pantryItems);
  const headcount = parseHeadcount(input.query);
  if (tokens.length === 0) return null;

  const presence = scorePantryDish(planned, tokens, headcount);
  const missingCriticalPresence = presence == null;
  const quantity = assessDishQuantityReadiness(planned, pantryItems, headcount);

  const mayNotHaveEnough =
    missingCriticalPresence || quantity.hasReliableInsufficiency;

  const dayIntent = today.dayIntent ?? "auto";
  let alternatives: string[] = [];

  if (mayNotHaveEnough) {
    const matched = matchPantryDishes(
      {
        locale: input.locale ?? "en",
        tonight: { occasion: "household", guestPreferredCuisineIds: [] },
        hostCuisineIds: input.hostCuisineIds,
        allergies: input.allergies,
        dietType: input.dietType,
        weeklyPlanningEnabled: false,
        weeklyPlan: [],
        mode: "pantry",
        pantryQuery: input.query,
        pantryHeadcount: headcount,
      },
      6,
    );

    alternatives = matched.recipeIds
      .filter((id) => id !== planned.id)
      .map((id) => getDishById(id))
      .filter((d): d is DishCatalogEntry => d != null && isDinnerComplete(d))
      .filter((d) => applyHardSafety([d], input).length > 0)
      .map((d) => ({
        dish: d,
        score:
          (scorePantryDish(d, tokens, headcount)?.score ?? 0) +
          dayIntentFit(d, dayIntent),
      }))
      .sort((a, b) => b.score - a.score || a.dish.id.localeCompare(b.dish.id))
      .slice(0, input.limit ?? 2)
      .map((r) => r.dish.id);
  }

  return {
    plannedRecipeId: planned.id,
    mayNotHaveEnough,
    quantity,
    missingCriticalPresence,
    alternatives,
    dayIntent,
  };
}

export function saveFuturePlanCandidate(
  existing: FuturePlanCandidate[] | undefined,
  recipeId: string,
  now = Date.now(),
): FuturePlanCandidate[] {
  const list = [...(existing ?? [])].filter((c) => c.recipeId !== recipeId);
  list.unshift({ recipeId, savedAt: now });
  return list.slice(0, 12);
}

/** Active candidates not yet scheduled into a generated week. */
export function activeFutureCandidates(
  candidates: FuturePlanCandidate[] | undefined,
): FuturePlanCandidate[] {
  return (candidates ?? []).filter((c) => !c.scheduledPlanStart);
}

export function markFutureCandidatesScheduled(
  candidates: FuturePlanCandidate[] | undefined,
  scheduledIds: string[],
  planStart: string,
): FuturePlanCandidate[] {
  if (!candidates?.length || scheduledIds.length === 0) {
    return candidates ?? [];
  }
  const set = new Set(scheduledIds);
  return candidates.map((c) =>
    set.has(c.recipeId) && !c.scheduledPlanStart
      ? { ...c, scheduledPlanStart: planStart }
      : c,
  );
}

export function futureCandidatesScheduledInPlan(
  plan: WeekDayPlan[],
  candidates: FuturePlanCandidate[] | undefined,
): string[] {
  const active = new Set(
    activeFutureCandidates(candidates).map((c) => c.recipeId),
  );
  const seen = new Set<string>();
  const scheduled: string[] = [];
  for (const day of plan) {
    if (active.has(day.recipeId) && !seen.has(day.recipeId)) {
      scheduled.push(day.recipeId);
      seen.add(day.recipeId);
    }
  }
  return scheduled;
}

export function futureCandidateBoost(
  recipeId: string,
  candidates: FuturePlanCandidate[] | undefined,
  feedbackEvents?: MealFeedbackEvent[],
): number {
  if (wasRecentlyRejected(recipeId, feedbackEvents)) return 0;
  const active = activeFutureCandidates(candidates);
  return active.some((c) => c.recipeId === recipeId) ? 22 : 0;
}

export { DEFAULT_PLANNING_CUTOFF_HOUR_LOCAL };
