import type {
  CuisineFamilyId,
  MealCookEvent,
  MealFeedbackEvent,
  RecommendationReasonCode,
  TonightDecisionContext,
  WeekDayPlan,
} from "@recipe-ai/core/types";
import type { AppLocale } from "../../../i18n/types";
import type { DayRole, DishCatalogEntry } from "../types";

/**
 * Internal decision policies — never shown in UI.
 * Household-level allergies only in V1 (no member-level safety yet).
 */
export type DecisionPolicy =
  | "US_WITH_WEEKLY_PLAN"
  | "US_WITHOUT_PLAN"
  | "GUESTS_EASY"
  | "GUESTS_SPECIAL"
  | "GUESTS_SURPRISE"
  | "SOMEONE_SPECIAL"
  | "PANTRY_MODE";

export type DecisionMode = "tonight" | "pantry" | "weekly";

export type DecisionContext = {
  locale: AppLocale;
  tonight: TonightDecisionContext;
  hostCuisineIds: CuisineFamilyId[];
  /** Household-level only in V1 — not per-member */
  allergies: string[];
  /** Persisted household diet preference (normal|halal|vegetarian|vegan) */
  dietType?: string;
  weeklyPlanningEnabled: boolean;
  weeklyPlan: WeekDayPlan[];
  /** Parallel day roles for weekly plan (same length/order as plan) */
  weekDayRoles?: DayRole[];
  date?: Date;
  mode?: DecisionMode;
  pantryQuery?: string;
  pantryHeadcount?: number;
  excludeRecipeIds?: string[];
  feedbackEvents?: MealFeedbackEvent[];
  cookEvents?: MealCookEvent[];
};

export type ScoredCandidate = {
  dish: DishCatalogEntry;
  score: number;
  reasonCodes: RecommendationReasonCode[];
  /** Debug-only components; never UI */
  signals: Record<string, number>;
};

export type DecisionResult = {
  policy: DecisionPolicy;
  candidateIds: string[];
  primaryId?: string;
  plannedRecipeId?: string;
  /** Companion recipe ids from today's persisted meal composition */
  companionRecipeIds?: string[];
  mealBalanceReason?: string;
  dayRole?: DayRole;
  reasonCodes: RecommendationReasonCode[];
  safetyBlocked: boolean;
  source: "weekly-plan" | "resolver" | "pantry";
  /** Pantry mode extras */
  pantryMissingCritical?: number;
  pantryMissingTotal?: number;
  pantryCoverage?: number;
};

export type WeekPlanBuildResult = {
  plan: WeekDayPlan[];
  /** Future-plan candidates scheduled in this generation (consume once). */
  scheduledFutureCandidateIds?: string[];
  roles: DayRole[];
  /** ISO date of first dinner day in this rolling plan */
  planStart: string;
  planningCutoffHourLocal: number;
};
