export type {
  DecisionContext,
  DecisionPolicy,
  DecisionResult,
  ScoredCandidate,
  WeekPlanBuildResult,
} from "./types";
export { resolveDecision, buildMealFromDecision } from "./resolveDecision";
export { resolvePolicy, candidateUniverse, weekdayIndex } from "./policy";
export { rankCandidates } from "./score";
export {
  buildIntelligentWeekPlan,
  composeWeekRoles,
  reselectWeekDay,
  mondayWeekStart,
  resolvePlanStartKey,
  resolvePlanningStartDate,
  formatLocalIsoDate,
  DEFAULT_PLANNING_CUTOFF_HOUR_LOCAL,
} from "./weekly";
export {
  matchPantryDishes,
  parseIngredientQuery,
  parseHeadcount,
  scorePantryDish,
  pantryReasonCodes,
  computeCompletionBurden,
  STRONG_PANTRY_COVERAGE,
} from "./pantry";
export {
  parsePantryItems,
  assessDishQuantityReadiness,
  parseRecipeQuantityHint,
  pantryItemsToTokens,
} from "./pantryQuantity";
export {
  findTodayPlanDay,
  replaceTodayPlanMain,
  otherDaysUnchanged,
  assessPlannedMealVsPantry,
  saveFuturePlanCandidate,
  markFutureCandidatesScheduled,
  activeFutureCandidates,
  futureCandidatesScheduledInPlan,
  futureCandidateBoost,
} from "./pantryPlanBridge";
export { dayIntentFit, DAY_PLAN_INTENTS } from "./dayIntent";
export {
  MAX_PREFERRED_CUISINES,
  resolveHouseholdCuisineProfile,
  syncFavoriteCuisinesMirror,
  isVegetarianMainDish,
  cuisinePreferenceScore,
  type HouseholdCuisineProfile,
} from "./householdCuisine";
export {
  applyHardSafety,
  isDishSafe,
  filterDinnerComplete,
  isDinnerComplete,
} from "./safety";
export { composeReasonText, REASON_MESSAGE_KEYS } from "./explain";
export { hasBridge } from "./policy";
export {
  composeMealForMain,
  deriveMealBalance,
  isCompatibleCompanion,
  CURATED_COMPANIONS,
  mainsWithoutCuratedCompanions,
} from "./mealComposition";
