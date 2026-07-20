export type FlowScreen =
  | "language-selection"
  | "welcome"
  | "auth"
  | "household-members"
  | "food-preferences"
  | "cuisine-preferences"
  | "weekly-plan-opt-in"
  | "weekly-plan-intents"
  | "tonight"
  | "recipe-preview"
  | "cook-mode"
  | "weekly-plan"
  | "feedback"
  | "cook-with-what-i-have";

export type MealFeedbackRating = "loved" | "good" | "not-for-us";

/** Who the meal is for tonight — separate from FadiCore household membership. */
export type TonightOccasion = "household" | "guests" | "friend";

/** The three approved guest strategies. */
export type TonightMealIntent = "familiar" | "special" | "surprise";

export type CuisineFamilyId =
  | "arab"
  | "turkish"
  | "central_european"
  | "italian"
  | "chinese"
  | "indian"
  | "mexican";

/** Per-meal ShareYum context (session-scoped in UI; not FadiCore identity). */
export type TonightDecisionContext = {
  occasion: TonightOccasion;
  intent?: TonightMealIntent;
  /** Explicit guest context only; never inferred from name, language, or ethnicity. */
  guestPrimaryCuisineId?: CuisineFamilyId;
  guestPreferredCuisineIds: CuisineFamilyId[];
};

export type ScreenAtmosphere =
  | "kitchen-morning"
  | "kitchen-ingredients"
  | "vegetables-fresh"
  | "meal-evening"
  | "meal-preview"
  | "cookbook-dark"
  | "planning-light"
  | "dinner-complete";

export type InventoryStatus = "have" | "need";

export type InventoryItem = {
  id: string;
  name: string;
  detail: string;
  status: InventoryStatus;
  freshness?: string;
};

export type RecipeStep = {
  order: number;
  instruction: string;
  timerMinutes?: number;
};

export type RecommendationReasonCode =
  | "FROM_WEEKLY_PLAN"
  | "USES_AVAILABLE_INGREDIENTS"
  | "FAMILY_FAMILIAR"
  | "GUEST_FAMILIAR"
  | "EASY_FOR_HOST"
  | "CONTROLLED_DISCOVERY"
  | "SPECIAL_OCCASION"
  | "GOOD_PANTRY_MATCH"
  | "GUEST_SURPRISE"
  | "SOMEONE_SPECIAL";

export type MealFeedbackEvent = {
  recipeId: string;
  rating: MealFeedbackRating;
  at: number;
};

export type MealCookEvent = {
  recipeId: string;
  at: number;
  /**
   * Only `"completed"` cook sessions affect memory.
   * cook-start must never write this event. Legacy rows without `kind`
   * are treated as completed for migration only.
   */
  kind?: "completed";
  /**
   * Internal cook-session role — not shown in UI.
   * `extra` = cooked without replacing today's planned dinner.
   */
  sessionRole?: "planned" | "extra";
};

/**
 * Internal pantry → plan decision kinds (never expose enum names in UI).
 * COOK_NOW / REPLACE_TODAY_PLAN / SAVE_FOR_FUTURE_PLAN / ADD_EXTRA_MEAL_TODAY
 */
export type PantryPlanDecision =
  | "cook_now"
  | "replace_today_plan"
  | "save_for_future_plan"
  | "add_extra_meal_today";

/** Local V1 future-plan preference — ShareYum client only; not FadiCore. */
export type FuturePlanCandidate = {
  recipeId: string;
  savedAt: number;
  /** Set when the engine schedules it into a generated week — do not force again. */
  scheduledPlanStart?: string;
};

export type MealRecommendation = {
  id: string;
  /** Canonical dish id in the starter catalog */
  recipeId: string;
  cuisineFamilyId: string;
  title: string;
  reason: string;
  /** Engine explanation codes — UI maps via i18n; never expose scores */
  reasonCodes?: RecommendationReasonCode[];
  recommendationBasis?: "easy_familiar" | "curated_special" | "guest_cuisine";
  prepMinutes: number;
  imageUrl: string;
  cuisine: string;
  ingredients: InventoryItem[];
  steps: RecipeStep[];
  tips: string[];
  storageTip: string;
  servings?: number;
  /** Optional weekly-plan companions — never the Cook Mode recipe */
  companions?: Array<{
    recipeId: string;
    title: string;
    imageUrl: string;
  }>;
};

/** Planned dinner for one calendar day — main + optional companions. */
export type MealComposition = {
  mainRecipeId: string;
  companionRecipeIds: string[];
  /** Internal balance rationale — not shown as nutrition claims */
  balanceReason?: string;
};

/** User day intent for weekly planning — mirrors catalog DayPlanIntent. */
export type DayPlanIntent =
  | "auto"
  | "budget"
  | "healthy"
  | "light"
  | "high_calorie"
  | "special"
  | "quick"
  | "vegetarian";

/** Where a weekly day should look for its main dish cuisine. */
export type DayCuisineSource = "auto" | "primary" | "preferred";

export type WeekDayPlan = {
  /** Offset from rolling plan start (0 = first planned dinner) */
  dayOffset: number;
  /** Local calendar date YYYY-MM-DD for this dinner slot */
  date: string;
  /** 0 = Monday … 6 = Sunday — UI label only */
  weekdayIndex: number;
  /** Main dish id (Cook Mode primary). Same as meal.mainRecipeId */
  recipeId: string;
  meal: MealComposition;
  /** Explicit user intent for this day (default auto). */
  dayIntent: DayPlanIntent;
  /** Cuisine source for this day (default auto). */
  dayCuisineSource?: DayCuisineSource;
  /** Optional alternate main for review UI */
  alternateRecipeId?: string;
};

export type PersistedWeekPlan = {
  /**
   * ISO date (YYYY-MM-DD) of the first dinner day in this rolling plan.
   * Not a Monday-week key — regenerates when the planning anchor moves.
   */
  planStart: string;
  /** Local hour (0–23) used when this plan was generated */
  planningCutoffHourLocal: number;
  plan: WeekDayPlan[];
  roles: string[];
  /** @deprecated Legacy Monday-week key — ignored when planStart is present */
  weekStart?: string;
};

export type AppPreferences = {
  onboardingComplete: boolean;
  languageSelected: boolean;
  householdMembersComplete: boolean;
  allergiesComplete: boolean;
  cuisinePreferencesComplete: boolean;

  email?: string;
  language?: string;
  country?: string;
  city?: string;
  familySize?: string;
  dietType?: string;

  /** @deprecated Synced mirror of primary + preferred — prefer explicit fields below */
  favoriteCuisines: string[];
  /** Explicit household home cuisine — never inferred from nationality/language */
  primaryCuisine?: CuisineFamilyId;
  /** Optional secondary cuisines the household enjoys (max 3 in UI) */
  preferredCuisines: CuisineFamilyId[];
  favoriteRestaurants: string[];

  allergies: string[];
  weeklyPlanningEnabled: boolean;
  weeklyPlanOptInAsked: boolean;
  feedbackGivenRecipeIds: string[];
  /** Local V1 meal memory — ShareYum client only; not FadiCore */
  mealFeedbackEvents?: MealFeedbackEvent[];
  mealCookEvents?: MealCookEvent[];
  /** Local durable week plan for the current weekStart */
  persistedWeekPlan?: PersistedWeekPlan;
  /**
   * Pantry-discovered recipes the household wants later.
   * Soft preference for the next week generation — not FadiCore.
   */
  futurePlanCandidates?: FuturePlanCandidate[];
};

export const ALLERGY_OPTIONS = [
  "Gluten",
  "Dairy",
  "Eggs",
  "Nuts",
  "Peanuts",
  "Fish",
  "Shellfish",
  "Soy",
  "Sesame",
] as const;

export const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;
