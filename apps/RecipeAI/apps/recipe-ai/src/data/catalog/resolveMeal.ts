/**
 * Compatibility façade over Decision Engine V1.
 * Prefer importing from `./decision` for new code.
 *
 * V1 safety note: allergies are household-level only (local preferences).
 * Member-level / participation safety is not implemented.
 */
import type {
  CuisineFamilyId,
  DayCuisineSource,
  DayPlanIntent,
  MealRecommendation,
  TonightDecisionContext,
  WeekDayPlan,
} from "@recipe-ai/core/types";
import type { AppLocale } from "../../i18n/types";
import {
  buildIntelligentWeekPlan,
  buildMealFromDecision,
  reselectWeekDay,
  resolveDecision,
  type DecisionContext,
} from "./decision";
import type { HouseholdCuisineProfile } from "./decision/householdCuisine";
import type { DayRole, TonightSelectionInput } from "./types";

export type { DecisionContext, DecisionResult } from "./decision";

function toContext(
  input: TonightSelectionInput,
  extras?: Partial<DecisionContext>,
): DecisionContext {
  return {
    locale: input.locale,
    tonight: {
      occasion: input.occasion,
      intent: input.intent,
      guestPrimaryCuisineId: input.guestPrimaryCuisineId,
      guestPreferredCuisineIds: input.guestPreferredCuisineIds ?? [],
    },
    hostCuisineIds: input.hostCuisineIds,
    allergies: input.allergies ?? [],
    dietType: extras?.dietType,
    weeklyPlanningEnabled: extras?.weeklyPlanningEnabled ?? false,
    weeklyPlan: extras?.weeklyPlan ?? [],
    weekDayRoles: extras?.weekDayRoles,
    date: extras?.date,
    excludeRecipeIds: input.excludeRecipeIds,
    feedbackEvents: extras?.feedbackEvents,
    cookEvents: extras?.cookEvents,
    mode: extras?.mode,
    pantryQuery: extras?.pantryQuery,
  };
}

/** @deprecated Prefer resolveDecision — kept for tests/call sites */
export function selectTonightCandidates(
  input: TonightSelectionInput,
): string[] {
  const result = resolveDecision(
    toContext(input, {
      weeklyPlanningEnabled: false,
      weeklyPlan: [],
    }),
  );
  return result.candidateIds;
}

export function resolveTonightDecision(input: {
  context: TonightDecisionContext;
  weeklyPlan: WeekDayPlan[];
  weeklyPlanningEnabled: boolean;
  hostCuisineIds: CuisineFamilyId[];
  allergies: string[];
  locale: AppLocale;
  dietType?: string;
  date?: Date;
  excludeRecipeIds?: string[];
  weekDayRoles?: DayRole[];
  feedbackEvents?: DecisionContext["feedbackEvents"];
  cookEvents?: DecisionContext["cookEvents"];
}): import("./decision").DecisionResult {
  return resolveDecision({
    locale: input.locale,
    tonight: input.context,
    hostCuisineIds: input.hostCuisineIds,
    allergies: input.allergies,
    dietType: input.dietType,
    weeklyPlanningEnabled: input.weeklyPlanningEnabled,
    weeklyPlan: input.weeklyPlan,
    weekDayRoles: input.weekDayRoles,
    date: input.date,
    excludeRecipeIds: input.excludeRecipeIds,
    feedbackEvents: input.feedbackEvents,
    cookEvents: input.cookEvents,
  });
}

export function buildMealRecommendation(
  recipeId: string,
  locale: AppLocale,
  context: TonightDecisionContext,
  options?: {
    fromWeeklyPlan?: boolean;
    reasonCodes?: import("@recipe-ai/core/types").RecommendationReasonCode[];
    companionRecipeIds?: string[];
  },
): MealRecommendation | null {
  const codes = options?.reasonCodes ?? [];
  if (options?.fromWeeklyPlan && !codes.includes("FROM_WEEKLY_PLAN")) {
    codes.unshift("FROM_WEEKLY_PLAN");
  }
  return buildMealFromDecision(
    recipeId,
    locale,
    context,
    codes,
    options?.companionRecipeIds ?? [],
  );
}

export function buildDefaultWeekPlan(
  locale: AppLocale,
  hostCuisineIds: CuisineFamilyId[],
  allergies: string[] = [],
  memory?: Pick<DecisionContext, "feedbackEvents" | "cookEvents" | "dietType"> & {
    householdProfile?: HouseholdCuisineProfile;
  },
  options?: {
    now?: Date;
    planningCutoffHourLocal?: number;
    dayIntents?: DayPlanIntent[];
    dayCuisineSources?: DayCuisineSource[];
    futurePlanCandidates?: import("@recipe-ai/core/types").FuturePlanCandidate[];
  },
): WeekDayPlan[] {
  const { plan } = buildIntelligentWeekPlan(
    {
      locale,
      hostCuisineIds,
      allergies,
      dietType: memory?.dietType,
      feedbackEvents: memory?.feedbackEvents,
      cookEvents: memory?.cookEvents,
      householdProfile: memory?.householdProfile,
    },
    options,
  );
  return plan;
}

export function buildDefaultWeekPlanDetailed(
  locale: AppLocale,
  hostCuisineIds: CuisineFamilyId[],
  allergies: string[] = [],
  memory?: Pick<DecisionContext, "feedbackEvents" | "cookEvents" | "dietType"> & {
    householdProfile?: HouseholdCuisineProfile;
  },
  options?: {
    now?: Date;
    planningCutoffHourLocal?: number;
    dayIntents?: DayPlanIntent[];
    dayCuisineSources?: DayCuisineSource[];
    futurePlanCandidates?: import("@recipe-ai/core/types").FuturePlanCandidate[];
  },
) {
  return buildIntelligentWeekPlan(
    {
      locale,
      hostCuisineIds,
      allergies,
      dietType: memory?.dietType,
      feedbackEvents: memory?.feedbackEvents,
      cookEvents: memory?.cookEvents,
      householdProfile: memory?.householdProfile,
    },
    options,
  );
}

export { reselectWeekDay };

export {
  mondayWeekStart,
  resolvePlanStartKey,
  resolvePlanningStartDate,
  DEFAULT_PLANNING_CUTOFF_HOUR_LOCAL,
} from "./decision";
