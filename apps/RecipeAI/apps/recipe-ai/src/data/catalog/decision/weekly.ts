import type {
  CuisineFamilyId,
  DayCuisineSource,
  DayPlanIntent,
  FuturePlanCandidate,
  MealComposition,
  WeekDayPlan,
} from "@recipe-ai/core/types";
import { listAllDishes } from "../dishes";
import type { DayRole, DishCatalogEntry } from "../types";
import { dayIntentFit } from "./dayIntent";
import {
  cuisinePreferenceScore,
  isVegetarianMainDish,
  type HouseholdCuisineProfile,
} from "./householdCuisine";
import { composeMealForMain } from "./mealComposition";
import { feedbackScore, recentCookPenalty } from "./memory";
import { futureCandidateBoost } from "./pantryPlanBridge";
import {
  DEFAULT_PLANNING_CUTOFF_HOUR_LOCAL,
  addLocalDays,
  formatLocalIsoDate,
  resolvePlanningStartDate,
  weekdayIndexFromDate,
} from "./planningCalendar";
import { applyHardSafety, filterDinnerComplete } from "./safety";
import { proteinToken } from "./score";
import type { DecisionContext, WeekPlanBuildResult } from "./types";

export {
  DEFAULT_PLANNING_CUTOFF_HOUR_LOCAL,
  mondayWeekStart,
  resolvePlanStartKey,
  resolvePlanningStartDate,
  formatLocalIsoDate,
} from "./planningCalendar";

const DEFAULT_WEEK_ROLES: DayRole[] = [
  "family_familiar",
  "quick",
  "balanced",
  "vegetable_forward",
  "comfort",
  "controlled_discovery",
  "protein_shift",
];

function hashSeed(parts: string[]): number {
  return parts
    .join("|")
    .split("")
    .reduce((a, c) => a + c.charCodeAt(0), 0);
}

export function composeWeekRoles(
  hostCuisineIds: CuisineFamilyId[],
  allergies: string[],
): DayRole[] {
  const seed = hashSeed([...hostCuisineIds, ...allergies].sort());
  const roles = [...DEFAULT_WEEK_ROLES];
  if (seed % 2 === 1) {
    const disc = roles.indexOf("controlled_discovery");
    const quick = roles.indexOf("quick");
    if (disc >= 0 && quick >= 0) {
      roles[disc] = "quick";
      roles[quick] = "controlled_discovery";
    }
  }
  return roles;
}

function roleEligible(
  dish: DishCatalogEntry,
  role: DayRole,
  picked: DishCatalogEntry[],
): boolean {
  if (dish.mealSlotRole !== "dinner_complete") return false;

  switch (role) {
    case "quick":
      return dish.prepMinutes <= 30 || dish.moods.includes("quick");
    case "vegetable_forward":
      return (
        dish.dietaryTags.includes("vegetarian_ok") ||
        (!dish.dietaryTags.includes("contains_meat") &&
          dish.mealTypes.includes("main"))
      );
    case "comfort":
      return (
        dish.mealTypes.includes("soup") ||
        dish.mealTypes.includes("stew") ||
        dish.specialness >= 2
      );
    case "family_familiar":
      return dish.familiarity <= 2 && dish.difficulty === "easy";
    case "protein_shift": {
      const protein = proteinToken(dish);
      if (!protein) return false;
      const prior = new Set(
        picked.map((p) => proteinToken(p)).filter(Boolean) as string[],
      );
      if (prior.size === 0) return true;
      return !prior.has(protein);
    }
    case "controlled_discovery":
      return dish.difficulty === "easy";
    case "balanced":
    default:
      return (
        dish.mealTypes.includes("main") ||
        dish.mealTypes.includes("soup") ||
        dish.mealTypes.includes("stew")
      );
  }
}

function dishScoreForDay(
  dish: DishCatalogEntry,
  role: DayRole,
  dayIntent: DayPlanIntent,
  dayCuisineSource: DayCuisineSource,
  ctx: Pick<
    DecisionContext,
    "hostCuisineIds" | "feedbackEvents" | "cookEvents"
  > & { householdProfile?: HouseholdCuisineProfile },
  picked: DishCatalogEntry[],
  futureCandidates?: FuturePlanCandidate[],
): number {
  let score = 0;
  const profile: HouseholdCuisineProfile = ctx.householdProfile ?? {
    hostCuisineIds: ctx.hostCuisineIds,
    preferredCuisines: [],
    hasExplicitPrimary: false,
  };

  score += cuisinePreferenceScore(
    dish,
    dayCuisineSource,
    profile,
    picked,
    role,
  );

  const eligible = roleEligible(dish, role, picked);
  if (eligible) score += 12;
  else score -= 8;

  // Explicit day intent participates BEFORE final selection (strong signal).
  score += dayIntentFit(dish, dayIntent);

  if (role === "protein_shift") {
    const protein = proteinToken(dish);
    const prior = picked
      .map((p) => proteinToken(p))
      .filter(Boolean) as string[];
    if (protein && prior.length > 0 && !prior.includes(protein)) score += 10;
    if (protein && prior.includes(protein)) score -= 12;
  }

  score += feedbackScore(dish.id, ctx.feedbackEvents);
  score -= recentCookPenalty(dish.id, ctx.cookEvents);

  // Soft pantry "save for later" — after memory; never revives rejected dishes.
  score += futureCandidateBoost(
    dish.id,
    futureCandidates,
    ctx.feedbackEvents,
  );

  const sameDish = picked.filter((p) => p.id === dish.id).length;
  score -= sameDish * 30;

  const type = dish.mealTypes[0] ?? "main";
  const typeCount = picked.filter((p) => p.mealTypes[0] === type).length;
  score -= typeCount * 4;

  const cuisineCount = picked.filter(
    (p) => p.cuisineFamilyId === dish.cuisineFamilyId,
  ).length;
  score -= cuisineCount * 3;

  const last = picked[picked.length - 1];
  if (last) {
    if (last.cuisineFamilyId === dish.cuisineFamilyId) score -= 5;
    if (last.mealTypes[0] === dish.mealTypes[0]) score -= 3;
    const lastProtein = proteinToken(last);
    const nextProtein = proteinToken(dish);
    if (lastProtein && nextProtein && lastProtein === nextProtein) score -= 6;
  }

  score -= dish.prepMinutes / 40;
  return score;
}

function rankDayCandidates(
  safe: DishCatalogEntry[],
  role: DayRole,
  dayIntent: DayPlanIntent,
  dayCuisineSource: DayCuisineSource,
  ctx: Pick<
    DecisionContext,
    "hostCuisineIds" | "feedbackEvents" | "cookEvents"
  > & { householdProfile?: HouseholdCuisineProfile },
  picked: DishCatalogEntry[],
  excludeIds: Set<string>,
  futureCandidates?: FuturePlanCandidate[],
): DishCatalogEntry[] {
  let pool = safe;
  if (dayIntent === "vegetarian") {
    const vegetarian = safe.filter(isVegetarianMainDish);
    if (vegetarian.length > 0) pool = vegetarian;
  }

  return [...pool]
    .filter((d) => !excludeIds.has(d.id))
    .map((dish) => ({
      dish,
      score: dishScoreForDay(
        dish,
        role,
        dayIntent,
        dayCuisineSource,
        ctx,
        picked,
        futureCandidates,
      ),
    }))
    .sort(
      (a, b) =>
        b.score - a.score || a.dish.id.localeCompare(b.dish.id),
    )
    .map((r) => r.dish);
}

export type WeekPlanBuildOptions = {
  now?: Date;
  planningCutoffHourLocal?: number;
  /** Parallel to the 7 days — default all `auto` */
  dayIntents?: DayPlanIntent[];
  /** Parallel to the 7 days — default all `auto` (ShareYum chooses balance) */
  dayCuisineSources?: DayCuisineSource[];
  /** Soft local preferences from pantry "save for later" */
  futurePlanCandidates?: FuturePlanCandidate[];
};

/**
 * Rolling 7-day plan from the user's planning anchor.
 * Week Composition → Day Role → Day Intent → Main → Optional Meal Composition.
 */
export function buildIntelligentWeekPlan(
  ctx: Pick<
    DecisionContext,
    | "locale"
    | "hostCuisineIds"
    | "allergies"
    | "dietType"
    | "feedbackEvents"
    | "cookEvents"
  > & { householdProfile?: HouseholdCuisineProfile },
  options: WeekPlanBuildOptions = {},
): WeekPlanBuildResult {
  const cutoff =
    options.planningCutoffHourLocal ?? DEFAULT_PLANNING_CUTOFF_HOUR_LOCAL;
  const planStart = resolvePlanningStartDate(options.now ?? new Date(), cutoff);
  const planStartKey = formatLocalIsoDate(planStart);
  const roles = composeWeekRoles(ctx.hostCuisineIds, ctx.allergies);
  const dayIntents: DayPlanIntent[] = Array.from({ length: 7 }, (_, i) =>
    options.dayIntents?.[i] ?? "auto",
  );
  const dayCuisineSources: DayCuisineSource[] = Array.from(
    { length: 7 },
    (_, i) => options.dayCuisineSources?.[i] ?? "auto",
  );
  const safe = filterDinnerComplete(
    applyHardSafety(listAllDishes(), {
      allergies: ctx.allergies,
      dietType: ctx.dietType,
      excludeRecipeIds: [],
    }),
  );

  const futureCandidates = options.futurePlanCandidates;
  const activeFutureIds = new Set(
    (futureCandidates ?? [])
      .filter((c) => !c.scheduledPlanStart)
      .map((c) => c.recipeId),
  );
  const scheduledFutureCandidateIds: string[] = [];

  const picked: DishCatalogEntry[] = [];
  const alternates: Array<string | undefined> = [];

  for (let i = 0; i < 7; i++) {
    const role = roles[i] ?? "balanced";
    const intent = dayIntents[i] ?? "auto";
    const cuisineSource = dayCuisineSources[i] ?? "auto";
    const ranked = rankDayCandidates(
      safe,
      role,
      intent,
      cuisineSource,
      ctx,
      picked,
      new Set(picked.map((p) => p.id)),
      futureCandidates,
    );
    const best = ranked[0] ?? safe[0];
    if (best) {
      picked.push(best);
      alternates.push(ranked[1]?.id);
      if (activeFutureIds.has(best.id)) {
        scheduledFutureCandidateIds.push(best.id);
        activeFutureIds.delete(best.id);
      }
    }
  }

  const usedCompanions: string[] = [];
  const plan: WeekDayPlan[] = picked.slice(0, 7).map((dish, dayOffset) => {
    const date = addLocalDays(planStart, dayOffset);
    const meal: MealComposition = composeMealForMain(dish, ctx, usedCompanions);
    usedCompanions.push(...meal.companionRecipeIds);
    return {
      dayOffset,
      date: formatLocalIsoDate(date),
      weekdayIndex: weekdayIndexFromDate(date),
      recipeId: meal.mainRecipeId,
      meal,
      dayIntent: dayIntents[dayOffset] ?? "auto",
      dayCuisineSource: dayCuisineSources[dayOffset] ?? "auto",
      alternateRecipeId: alternates[dayOffset],
    };
  });

  return {
    plan,
    roles: roles.slice(0, plan.length),
    planStart: planStartKey,
    planningCutoffHourLocal: cutoff,
    scheduledFutureCandidateIds,
  };
}

/**
 * Change one day's intent and reselect only that day (keep other days).
 */
export function reselectWeekDay(
  plan: WeekDayPlan[],
  roles: DayRole[],
  dayOffset: number,
  dayIntent: DayPlanIntent,
  ctx: Pick<
    DecisionContext,
    | "locale"
    | "hostCuisineIds"
    | "allergies"
    | "dietType"
    | "feedbackEvents"
    | "cookEvents"
  > & { householdProfile?: HouseholdCuisineProfile },
  dayCuisineSource?: DayCuisineSource,
): WeekDayPlan[] {
  const safe = filterDinnerComplete(
    applyHardSafety(listAllDishes(), {
      allergies: ctx.allergies,
      dietType: ctx.dietType,
      excludeRecipeIds: [],
    }),
  );
  const others = plan
    .filter((d) => d.dayOffset !== dayOffset)
    .map((d) => listAllDishes().find((x) => x.id === d.recipeId))
    .filter((d): d is DishCatalogEntry => Boolean(d));

  const role = roles[dayOffset] ?? "balanced";
  const cuisineSource =
    dayCuisineSource ?? plan.find((d) => d.dayOffset === dayOffset)?.dayCuisineSource ?? "auto";
  const exclude = new Set(
    plan.filter((d) => d.dayOffset !== dayOffset).map((d) => d.recipeId),
  );
  const ranked = rankDayCandidates(
    safe,
    role,
    dayIntent,
    cuisineSource,
    ctx,
    others,
    exclude,
  );
  const best = ranked[0];
  if (!best) return plan;

  const usedCompanions = plan
    .filter((d) => d.dayOffset !== dayOffset)
    .flatMap((d) => d.meal.companionRecipeIds);
  const meal = composeMealForMain(best, ctx, usedCompanions);

  return plan.map((d) =>
    d.dayOffset === dayOffset
      ? {
          ...d,
          recipeId: meal.mainRecipeId,
          meal,
          dayIntent,
          dayCuisineSource: cuisineSource,
          alternateRecipeId: ranked[1]?.id,
        }
      : d,
  );
}
