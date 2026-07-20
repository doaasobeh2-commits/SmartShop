import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type {
  CuisineFamilyId,
  DayCuisineSource,
  DayPlanIntent,
  FlowScreen,
  MealFeedbackRating,
  MealRecommendation,
  TonightDecisionContext,
  TonightMealIntent,
  TonightOccasion,
  WeekDayPlan,
} from "@recipe-ai/core/types";

import type { AppLocale } from "../i18n/types";

import { normalizeAppLocale } from "../i18n/types";

import { normalizeCuisineFamilyId } from "../data/cuisineOnboarding";

import type { DayRole, DishCatalogEntry } from "../data/catalog/types";
import { getDishById, listAllDishes } from "../data/catalog/dishes";
import { matchDishesByIngredients } from "../data/catalog/matchIngredients";
import {
  assessPlannedMealVsPantry,
  composeMealForMain,
  findTodayPlanDay,
  markFutureCandidatesScheduled,
  pantryReasonCodes,
  replaceTodayPlanMain,
  saveFuturePlanCandidate,
  futureCandidatesScheduledInPlan,
} from "../data/catalog/decision";
import {
  MAX_PREFERRED_CUISINES,
  resolveHouseholdCuisineProfile,
  syncFavoriteCuisinesMirror,
} from "../data/catalog/decision/householdCuisine";
import {
  addLocalDays,
  formatLocalIsoDate,
  resolvePlanningStartDate,
  weekdayIndexFromDate,
  DEFAULT_PLANNING_CUTOFF_HOUR_LOCAL,
} from "../data/catalog/decision/planningCalendar";
import {
  buildDefaultWeekPlanDetailed,
  buildMealRecommendation,
  reselectWeekDay,
  resolvePlanStartKey,
  resolveTonightDecision,
} from "../data/catalog/resolveMeal";

const DEFAULT_DAY_INTENTS: DayPlanIntent[] = Array.from(
  { length: 7 },
  () => "auto" as const,
);

const DEFAULT_DAY_CUISINE_SOURCES: DayCuisineSource[] = Array.from(
  { length: 7 },
  () => "auto" as const,
);

function normalizeWeekPlan(plan: WeekDayPlan[]): WeekDayPlan[] {
  return plan.map((d) => ({
    ...d,
    dayIntent: d.dayIntent ?? "auto",
    dayCuisineSource: d.dayCuisineSource ?? "auto",
    meal: d.meal ?? {
      mainRecipeId: d.recipeId,
      companionRecipeIds: [],
      balanceReason: "main_only",
    },
  }));
}

function rollingIntentDays(now = new Date()): {
  dates: string[];
  weekdayIndexes: number[];
} {
  const start = resolvePlanningStartDate(
    now,
    DEFAULT_PLANNING_CUTOFF_HOUR_LOCAL,
  );
  const dates: string[] = [];
  const weekdayIndexes: number[] = [];
  for (let i = 0; i < 7; i++) {
    const d = addLocalDays(start, i);
    dates.push(formatLocalIsoDate(d));
    weekdayIndexes.push(weekdayIndexFromDate(d));
  }
  return { dates, weekdayIndexes };
}

import {
  loadPreferences,
  resolveInitialFlowScreen,
  resolvePostAuthOnboardingScreen,
  savePreferences,
} from "./appStateLogic";
import {
  freezeCookSessionMeal,
  isCookSessionActive,
  mayMutateTonightMeal,
} from "./cookSession";
import {
  appendFlowStep,
  canGoBackInFlow,
  cuisinePreferencesToOptInStack,
  exitWeeklyPlanWizardToTonight,
  goBackInFlow,
} from "./weeklyPlanNavigation";
import {
  flowAfterBackFromPantryPreview,
  flowAfterOpenPantryMatch,
} from "./pantryNavigation";

const DEFAULT_TONIGHT_CONTEXT: TonightDecisionContext = {
  occasion: "household",

  guestPreferredCuisineIds: [],
};

function cuisineIds(values: string[]): CuisineFamilyId[] {
  const canonical = new Set<string>([
    "arab",
    "turkish",
    "central_european",
    "italian",
    "chinese",
    "indian",
    "mexican",
  ]);
  return values.filter((value): value is CuisineFamilyId =>
    canonical.has(value),
  );
}

function householdProfileFromPrefs(prefs: ReturnType<typeof loadPreferences>) {
  return resolveHouseholdCuisineProfile(prefs);
}

function weeklyMemoryFromPrefs(prefs: ReturnType<typeof loadPreferences>) {
  const profile = householdProfileFromPrefs(prefs);
  return {
    feedbackEvents: prefs.mealFeedbackEvents,
    cookEvents: prefs.mealCookEvents,
    dietType: prefs.dietType,
    householdProfile: profile,
  };
}

function weeklyHostIds(prefs: ReturnType<typeof loadPreferences>) {
  return householdProfileFromPrefs(prefs).hostCuisineIds;
}

function isRollingPlanShape(plan: WeekDayPlan[]): boolean {
  return plan.every(
    (d) =>
      typeof d.date === "string" &&
      typeof d.dayOffset === "number" &&
      d.meal?.mainRecipeId === d.recipeId,
  );
}

function resolveWeekState(
  prefs: ReturnType<typeof loadPreferences>,
  locale: AppLocale,
  forceRegenerate = false,
): {
  plan: WeekDayPlan[];
  roles: DayRole[];
  planStart: string;
  planningCutoffHourLocal: number;
  scheduledFutureCandidateIds: string[];
} {
  const planStart = resolvePlanStartKey();
  const persisted = prefs.persistedWeekPlan;
  if (
    !forceRegenerate &&
    persisted?.planStart === planStart &&
    persisted.plan.length > 0 &&
    isRollingPlanShape(persisted.plan)
  ) {
    return {
      plan: normalizeWeekPlan(persisted.plan),
      roles: persisted.roles as DayRole[],
      planStart,
      planningCutoffHourLocal: persisted.planningCutoffHourLocal ?? 17,
      scheduledFutureCandidateIds: [],
    };
  }
  const built = buildDefaultWeekPlanDetailed(
    locale,
    weeklyHostIds(prefs),
    prefs.allergies,
    weeklyMemoryFromPrefs(prefs),
    { futurePlanCandidates: prefs.futurePlanCandidates },
  );
  return {
    plan: built.plan,
    roles: built.roles,
    planStart: built.planStart,
    planningCutoffHourLocal: built.planningCutoffHourLocal,
    scheduledFutureCandidateIds: built.scheduledFutureCandidateIds ?? [],
  };
}

function shellDinnerRecipeId(): string {
  const dinner = listAllDishes().find(
    (d) => d.mealSlotRole === "dinner_complete",
  );
  if (!dinner) throw new Error("Catalog has no dinner-complete dishes");
  return dinner.id;
}

type AppStateContextValue = {
  currentScreen: FlowScreen;

  preferences: ReturnType<typeof loadPreferences>;

  meal: MealRecommendation;

  weekPlan: WeekDayPlan[];

  cookStepIndex: number;

  tonightContext: TonightDecisionContext;

  tonightCandidateIds: string[];

  tonightCandidateMeals: MealRecommendation[];

  tonightCandidateIndex: number;

  navigate: (screen: FlowScreen) => void;

  goBack: () => void;

  canGoBack: boolean;

  replace: (screen: FlowScreen) => void;

  returnToTonight: () => void;

  enterPostAuthOnboarding: () => void;

  setLanguage: (language: AppLocale) => void;

  completeHouseholdMembers: () => void;

  toggleAllergy: (allergy: string) => void;

  completeAllergies: () => void;

  toggleFavoriteCuisine: (cuisineId: string) => void;

  setPrimaryCuisine: (cuisineId: string) => void;

  togglePreferredCuisine: (cuisineId: string) => void;

  completeCuisinePreferences: () => void;

  handleWeeklyOptIn: (enabled: boolean) => void;

  draftDayIntents: DayPlanIntent[];

  draftDayCuisineSources: DayCuisineSource[];

  intentDayDates: string[];

  intentWeekdayIndexes: number[];

  setDraftDayIntent: (dayOffset: number, intent: DayPlanIntent) => void;

  setDraftDayCuisineSource: (
    dayOffset: number,
    source: DayCuisineSource,
  ) => void;

  confirmWeeklyIntents: () => void;

  setWeekDayIntent: (dayOffset: number, intent: DayPlanIntent) => void;

  saveWeekPlan: () => void;

  /** Recipe Detail opened from pantry (actions differ from Tonight preview). */
  recipePreviewOrigin: "tonight" | "pantry";

  /** Pantry recipe-detail actions */
  pantryCanReplaceToday: boolean;
  pantryPlannedTitle?: string;
  pantryReplaceConfirming: boolean;
  pantryFutureSaved: boolean;
  pantryPlannedConflict: {
    mayNotHaveEnough: boolean;
    plannedTitle: string;
    alternativeIds: string[];
  } | null;
  requestReplaceTodayPlan: () => void;
  confirmReplaceTodayPlan: () => void;
  cancelReplaceTodayPlan: () => void;
  savePantryForFuturePlan: () => void;

  startCook: () => void;

  nextCookStep: () => void;

  prevCookStep: () => void;

  exitCookMode: () => void;

  submitFeedback: (rating: MealFeedbackRating) => void;

  openWeeklyPlan: () => void;

  updateWeekDay: (dayOffset: number, recipeId: string) => void;

  removeWeekDayCompanion: (dayOffset: number, companionId: string) => void;

  selectTonightCandidate: (recipeId: string) => void;

  swapTonightCandidate: () => void;

  setTonightOccasion: (occasion: TonightOccasion) => void;

  setTonightIntent: (intent: TonightMealIntent) => void;

  setGuestPrimaryCuisine: (cuisineId: CuisineFamilyId) => void;

  toggleGuestPreferredCuisine: (cuisineId: CuisineFamilyId) => void;

  pantryMatchIds: string[];

  pantryQuery: string;

  pantryNoStrongMatch: boolean;

  pantryMissingById: Record<string, number>;

  pantryCoverageById: Record<string, number>;

  findPantryMatches: (query: string) => void;

  setPantryQuery: (query: string) => void;

  /** Open selected pantry result in Recipe Detail — not Tonight. */
  openPantryMatch: (recipeId: string) => void;

  /** @deprecated Prefer openPantryMatch */
  choosePantryMatch: (recipeId: string) => void;

  clearPantryMatches: () => void;

  exitPantryToTonight: () => void;

  backFromRecipePreview: () => void;

  openRecipePreview: () => void;

  shouldAskFeedback: boolean;

  tonightFromWeeklyPlan: boolean;

  tonightSafetyBlocked: boolean;
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

function buildTonightMeal(
  recipeId: string,

  locale: AppLocale,

  context: TonightDecisionContext,
): MealRecommendation {
  const meal = buildMealRecommendation(recipeId, locale, context);

  if (!meal) {
    throw new Error(`Unknown recipe: ${recipeId}`);
  }

  return meal;
}

function companionIdsForCandidate(
  dish: DishCatalogEntry,
  input: {
    hostCuisineIds: CuisineFamilyId[];
    allergies: string[];
    dietType?: string;
  },
): string[] {
  return composeMealForMain(dish, input, []).companionRecipeIds;
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState(loadPreferences);

  const [flowStack, setFlowStack] = useState<FlowScreen[]>(() => [
    resolveInitialFlowScreen(loadPreferences()),
  ]);

  const [tonightContext, setTonightContext] = useState<TonightDecisionContext>(
    DEFAULT_TONIGHT_CONTEXT,
  );

  const [tonightCandidateIds, setTonightCandidateIds] = useState<string[]>([]);

  const [tonightCandidateIndex, setTonightCandidateIndex] = useState(0);

  const [tonightFromWeeklyPlan, setTonightFromWeeklyPlan] = useState(false);

  const [tonightSafetyBlocked, setTonightSafetyBlocked] = useState(false);

  const [pantryMatchIds, setPantryMatchIds] = useState<string[]>([]);

  const [pantryQuery, setPantryQuery] = useState("");

  const [pantryNoStrongMatch, setPantryNoStrongMatch] = useState(false);

  const [pantryMissingById, setPantryMissingById] = useState<
    Record<string, number>
  >({});

  const [pantryCoverageById, setPantryCoverageById] = useState<
    Record<string, number>
  >({});

  /** Where Recipe Detail was opened from — controls Back destination. */
  const [recipePreviewOrigin, setRecipePreviewOrigin] = useState<
    "tonight" | "pantry"
  >("tonight");

  const [weekDayRoles, setWeekDayRoles] = useState<DayRole[]>(() => {
    const prefs = loadPreferences();
    return resolveWeekState(prefs, normalizeAppLocale(prefs.language)).roles;
  });

  const [weekPlan, setWeekPlan] = useState<WeekDayPlan[]>(() => {
    const prefs = loadPreferences();
    const resolved = resolveWeekState(
      prefs,
      normalizeAppLocale(prefs.language),
    );
    return resolved.plan;
  });

  const [draftDayIntents, setDraftDayIntents] =
    useState<DayPlanIntent[]>(DEFAULT_DAY_INTENTS);

  const [draftDayCuisineSources, setDraftDayCuisineSources] =
    useState<DayCuisineSource[]>(DEFAULT_DAY_CUISINE_SOURCES);

  const intentDayMeta = useMemo(() => rollingIntentDays(), []);

  const [pantryReplaceConfirming, setPantryReplaceConfirming] = useState(false);
  const [pantryFutureSaved, setPantryFutureSaved] = useState(false);
  const [pantryPlannedConflict, setPantryPlannedConflict] = useState<{
    mayNotHaveEnough: boolean;
    plannedTitle: string;
    alternativeIds: string[];
  } | null>(null);
  /** COOK_NOW / ADD_EXTRA vs planned — cook-start ≠ plan mutation */
  const cookSessionRoleRef = useRef<"planned" | "extra">("planned");

  const [meal, setMeal] = useState<MealRecommendation>(() => {
    const prefs = loadPreferences();
    const locale = normalizeAppLocale(prefs.language);
    const resolved = resolveWeekState(prefs, locale);

    const decision = resolveTonightDecision({
      context: DEFAULT_TONIGHT_CONTEXT,
      weeklyPlan: resolved.plan,
      weekDayRoles: resolved.roles,
      weeklyPlanningEnabled: prefs.weeklyPlanningEnabled,
      hostCuisineIds: weeklyHostIds(prefs),
      allergies: prefs.allergies,
      dietType: prefs.dietType,
      locale,
      feedbackEvents: prefs.mealFeedbackEvents,
      cookEvents: prefs.mealCookEvents,
    });

    // Never invent a decision winner — shell id is display-only when empty.
    const recipeId = decision.candidateIds[0] ?? shellDinnerRecipeId();

    return (
      buildMealRecommendation(recipeId, locale, DEFAULT_TONIGHT_CONTEXT, {
        fromWeeklyPlan: decision.source === "weekly-plan",
        reasonCodes: decision.candidateIds[0] ? decision.reasonCodes : [],
        companionRecipeIds: decision.companionRecipeIds,
      }) ?? buildTonightMeal(recipeId, locale, DEFAULT_TONIGHT_CONTEXT)
    );
  });

  /** Frozen recipe snapshot for Cook / Feedback — immune to live re-decision. */
  const [frozenCookMeal, setFrozenCookMeal] =
    useState<MealRecommendation | null>(null);
  const cookCompletionRecordedRef = useRef(false);

  const [cookStepIndex, setCookStepIndex] = useState(0);

  const locale = normalizeAppLocale(preferences.language);

  const cookSessionActive = isCookSessionActive(frozenCookMeal);

  const refreshTonightCandidates = useCallback(
    (index = 0, opts?: { ignorePantryLock?: boolean }) => {
      // Live re-decision must not mutate the active Cook/Feedback recipe.
      if (!mayMutateTonightMeal(cookSessionActive)) return;
      // Pantry-selected recipe stays sticky through Preview → Cook.
      if (recipePreviewOrigin === "pantry" && !opts?.ignorePantryLock) return;

      const decision = resolveTonightDecision({
        context: tonightContext,
        weeklyPlan: weekPlan,
        weekDayRoles,
        weeklyPlanningEnabled: preferences.weeklyPlanningEnabled,
        hostCuisineIds: weeklyHostIds(preferences),
        allergies: preferences.allergies,
        dietType: preferences.dietType,
        locale,
        feedbackEvents: preferences.mealFeedbackEvents,
        cookEvents: preferences.mealCookEvents,
      });

      const ids = decision.candidateIds;

      setTonightCandidateIds(ids);

      setTonightFromWeeklyPlan(decision.source === "weekly-plan");

      setTonightSafetyBlocked(decision.safetyBlocked);

      const safeIndex = ids.length > 0 ? index % ids.length : 0;

      setTonightCandidateIndex(safeIndex);

      if (ids[safeIndex]) {
        const isPrimaryPlan =
          decision.source === "weekly-plan" &&
          ids[safeIndex] === decision.plannedRecipeId &&
          safeIndex === 0;
        const candidateDish = getDishById(ids[safeIndex]!);
        const candidateCompanions =
          isPrimaryPlan && safeIndex === 0
            ? decision.companionRecipeIds
            : candidateDish
              ? companionIdsForCandidate(candidateDish, {
                  hostCuisineIds: weeklyHostIds(preferences),
                  allergies: preferences.allergies,
                  dietType: preferences.dietType,
                })
              : undefined;
        const next = buildMealRecommendation(
          ids[safeIndex]!,
          locale,
          tonightContext,
          {
            fromWeeklyPlan: isPrimaryPlan,
            reasonCodes:
              safeIndex === 0
                ? decision.reasonCodes
                : decision.reasonCodes.filter((c) => c !== "FROM_WEEKLY_PLAN"),
            companionRecipeIds: candidateCompanions,
          },
        );
        if (next) setMeal(next);
      }
    },

    [
      cookSessionActive,
      locale,
      preferences.allergies,
      preferences.dietType,
      preferences.primaryCuisine,
      preferences.preferredCuisines,
      preferences.mealCookEvents,
      preferences.mealFeedbackEvents,
      preferences.weeklyPlanningEnabled,
      recipePreviewOrigin,
      tonightContext,
      weekDayRoles,
      weekPlan,
    ],
  );

  const tonightCandidateMeals = useMemo(() => {
    if (tonightFromWeeklyPlan) return [meal];
    return tonightCandidateIds
      .map((recipeId) => {
        const dish = getDishById(recipeId);
        if (!dish) return null;
        return buildMealRecommendation(recipeId, locale, tonightContext, {
          companionRecipeIds: companionIdsForCandidate(dish, {
            hostCuisineIds: weeklyHostIds(preferences),
            allergies: preferences.allergies,
            dietType: preferences.dietType,
          }),
        });
      })
      .filter((candidate): candidate is MealRecommendation =>
        Boolean(candidate),
      );
  }, [
    locale,
    meal,
    preferences.allergies,
    preferences.dietType,
    preferences.primaryCuisine,
    preferences.preferredCuisines,
    tonightCandidateIds,
    tonightContext,
    tonightFromWeeklyPlan,
  ]);

  useEffect(() => {
    savePreferences(preferences);
  }, [preferences]);

  // When the planning anchor moves (e.g. past evening cutoff), rebuild once.
  const currentPlanStart = weekPlan[0]?.date;
  useEffect(() => {
    if (cookSessionActive) return;
    const anchor = resolvePlanStartKey();
    if (!currentPlanStart || currentPlanStart === anchor) return;
    const resolved = resolveWeekState(preferences, locale, true);
    setWeekPlan(resolved.plan);
    setWeekDayRoles(resolved.roles);
    if (resolved.scheduledFutureCandidateIds.length > 0) {
      setPreferences((prev) => ({
        ...prev,
        futurePlanCandidates: markFutureCandidatesScheduled(
          prev.futurePlanCandidates,
          resolved.scheduledFutureCandidateIds,
          resolved.planStart,
        ),
      }));
    }
    // Intentional: only re-check when the in-memory planStart drifts from the live anchor.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- preferences read on drift only
  }, [cookSessionActive, locale, currentPlanStart]);

  // Keep durable rolling plan in sync for the active planStart anchor.
  useEffect(() => {
    if (weekPlan.length === 0) return;
    const planStart = weekPlan[0]?.date ?? resolvePlanStartKey();
    setPreferences((prev) => {
      const same =
        prev.persistedWeekPlan?.planStart === planStart &&
        JSON.stringify(prev.persistedWeekPlan.plan) ===
          JSON.stringify(weekPlan) &&
        JSON.stringify(prev.persistedWeekPlan.roles) ===
          JSON.stringify(weekDayRoles);
      if (same) return prev;
      return {
        ...prev,
        persistedWeekPlan: {
          planStart,
          planningCutoffHourLocal:
            prev.persistedWeekPlan?.planningCutoffHourLocal ?? 17,
          plan: weekPlan,
          roles: weekDayRoles,
        },
      };
    });
  }, [weekPlan, weekDayRoles]);

  useEffect(() => {
    if (cookSessionActive) return;
    refreshTonightCandidates(0);
  }, [
    locale,
    preferences.primaryCuisine,
    preferences.preferredCuisines,
    preferences.dietType,
    tonightContext.occasion,
    tonightContext.intent,
    tonightContext.guestPrimaryCuisineId,
    cookSessionActive,
    refreshTonightCandidates,
  ]);

  const currentScreen = flowStack[flowStack.length - 1];

  const canGoBack = canGoBackInFlow(flowStack);

  const navigate = useCallback((screen: FlowScreen) => {
    setFlowStack((stack) => [...stack, screen]);
  }, []);

  const goBack = useCallback(() => {
    setFlowStack((stack) => goBackInFlow(stack));
  }, []);

  const replace = useCallback((screen: FlowScreen) => {
    setFlowStack((stack) => [...stack.slice(0, -1), screen]);
  }, []);

  const returnToTonight = useCallback(() => {
    setCookStepIndex(0);
    setFrozenCookMeal(null);
    cookCompletionRecordedRef.current = false;
    setRecipePreviewOrigin("tonight");
    setPantryMatchIds([]);
    setPantryNoStrongMatch(false);
    setPantryMissingById({});
    setPantryCoverageById({});
    setPantryQuery("");
    setFlowStack(exitWeeklyPlanWizardToTonight());
  }, []);

  const enterPostAuthOnboarding = useCallback(() => {
    setFlowStack([resolvePostAuthOnboardingScreen(preferences)]);
  }, [preferences]);

  const setLanguage = useCallback((language: AppLocale) => {
    setPreferences((prev) => ({
      ...prev,

      language,

      languageSelected: true,
    }));

    setFlowStack(["welcome"]);
  }, []);

  const completeHouseholdMembers = useCallback(() => {
    setPreferences((prev) => ({ ...prev, householdMembersComplete: true }));

    setFlowStack(["food-preferences"]);
  }, []);

  const toggleAllergy = useCallback((allergy: string) => {
    setPreferences((prev) => ({
      ...prev,

      allergies: prev.allergies.includes(allergy)
        ? prev.allergies.filter((a) => a !== allergy)
        : [...prev.allergies, allergy],
    }));
  }, []);

  const completeAllergies = useCallback(() => {
    setPreferences((prev) => ({ ...prev, allergiesComplete: true }));

    setFlowStack(["cuisine-preferences"]);
  }, []);

  const setPrimaryCuisine = useCallback((cuisineId: string) => {
    const id = normalizeCuisineFamilyId(cuisineId) as CuisineFamilyId;
    setPreferences((prev) => {
      const preferred = prev.preferredCuisines.filter((c) => c !== id);
      return {
        ...prev,
        primaryCuisine: id,
        preferredCuisines: preferred,
        favoriteCuisines: syncFavoriteCuisinesMirror(id, preferred),
      };
    });
  }, []);

  const togglePreferredCuisine = useCallback((cuisineId: string) => {
    const id = normalizeCuisineFamilyId(cuisineId) as CuisineFamilyId;
    setPreferences((prev) => {
      if (id === prev.primaryCuisine) return prev;
      const has = prev.preferredCuisines.includes(id);
      const preferred = has
        ? prev.preferredCuisines.filter((c) => c !== id)
        : prev.preferredCuisines.length >= MAX_PREFERRED_CUISINES
          ? prev.preferredCuisines
          : [...prev.preferredCuisines, id];
      return {
        ...prev,
        preferredCuisines: preferred,
        favoriteCuisines: prev.primaryCuisine
          ? syncFavoriteCuisinesMirror(prev.primaryCuisine, preferred)
          : prev.favoriteCuisines,
      };
    });
  }, []);

  /** @deprecated Legacy multi-select — prefer setPrimaryCuisine / togglePreferredCuisine */
  const toggleFavoriteCuisine = useCallback((cuisineId: string) => {
    const id = normalizeCuisineFamilyId(cuisineId);
    setPreferences((prev) => ({
      ...prev,
      favoriteCuisines: prev.favoriteCuisines.includes(id)
        ? prev.favoriteCuisines.filter((c) => c !== id)
        : [...prev.favoriteCuisines, id],
    }));
  }, []);

  const completeCuisinePreferences = useCallback(() => {
    if (!preferences.primaryCuisine) return;
    const built = buildDefaultWeekPlanDetailed(
      locale,
      weeklyHostIds(preferences),
      preferences.allergies,
      weeklyMemoryFromPrefs(preferences),
      { futurePlanCandidates: preferences.futurePlanCandidates },
    );
    setWeekPlan(built.plan);
    setWeekDayRoles(built.roles);
    setPreferences((prev) => ({
      ...prev,
      cuisinePreferencesComplete: true,
      persistedWeekPlan: {
        planStart: built.planStart,
        planningCutoffHourLocal: built.planningCutoffHourLocal,
        plan: built.plan,
        roles: built.roles,
      },
    }));

    setFlowStack(cuisinePreferencesToOptInStack());
  }, [
    locale,
    preferences.allergies,
    preferences.dietType,
    preferences.primaryCuisine,
    preferences.preferredCuisines,
    preferences.futurePlanCandidates,
    preferences.mealCookEvents,
    preferences.mealFeedbackEvents,
  ]);

  const handleWeeklyOptIn = useCallback((enabled: boolean) => {
    setPreferences((prev) => ({
      ...prev,

      weeklyPlanningEnabled: enabled,

      weeklyPlanOptInAsked: true,

      onboardingComplete: true,
    }));

    if (enabled) {
      setDraftDayIntents([...DEFAULT_DAY_INTENTS]);
      setDraftDayCuisineSources([...DEFAULT_DAY_CUISINE_SOURCES]);
      setFlowStack((stack) => appendFlowStep(stack, "weekly-plan-intents"));
      return;
    }
    setFlowStack(exitWeeklyPlanWizardToTonight());
  }, []);

  const setDraftDayIntent = useCallback(
    (dayOffset: number, intent: DayPlanIntent) => {
      setDraftDayIntents((prev) =>
        prev.map((value, i) => (i === dayOffset ? intent : value)),
      );
    },
    [],
  );

  const setDraftDayCuisineSource = useCallback(
    (dayOffset: number, source: DayCuisineSource) => {
      setDraftDayCuisineSources((prev) =>
        prev.map((value, i) => (i === dayOffset ? source : value)),
      );
    },
    [],
  );

  const confirmWeeklyIntents = useCallback(() => {
    const built = buildDefaultWeekPlanDetailed(
      locale,
      weeklyHostIds(preferences),
      preferences.allergies,
      weeklyMemoryFromPrefs(preferences),
      {
        dayIntents: draftDayIntents,
        dayCuisineSources: draftDayCuisineSources,
        futurePlanCandidates: preferences.futurePlanCandidates,
      },
    );
    setWeekPlan(built.plan);
    setWeekDayRoles(built.roles);
    setPreferences((prev) => ({
      ...prev,
      weeklyPlanningEnabled: true,
      persistedWeekPlan: {
        planStart: built.planStart,
        planningCutoffHourLocal: built.planningCutoffHourLocal,
        plan: built.plan,
        roles: built.roles,
      },
    }));
    setFlowStack((stack) => appendFlowStep(stack, "weekly-plan"));
  }, [
    draftDayCuisineSources,
    draftDayIntents,
    locale,
    preferences,
  ]);

  const setWeekDayIntent = useCallback(
    (dayOffset: number, intent: DayPlanIntent) => {
      setWeekPlan((plan) =>
        reselectWeekDay(plan, weekDayRoles, dayOffset, intent, {
          locale,
          hostCuisineIds: weeklyHostIds(preferences),
          allergies: preferences.allergies,
          dietType: preferences.dietType,
          feedbackEvents: preferences.mealFeedbackEvents,
          cookEvents: preferences.mealCookEvents,
          householdProfile: householdProfileFromPrefs(preferences),
        }),
      );
    },
    [
      locale,
      preferences,
      weekDayRoles,
    ],
  );

  const saveWeekPlan = useCallback(() => {
    setPreferences((prev) => {
      const planStart = weekPlan[0]?.date ?? resolvePlanStartKey();
      const scheduledIds = futureCandidatesScheduledInPlan(
        weekPlan,
        prev.futurePlanCandidates,
      );
      if (scheduledIds.length === 0) return prev;
      return {
        ...prev,
        futurePlanCandidates: markFutureCandidatesScheduled(
          prev.futurePlanCandidates,
          scheduledIds,
          planStart,
        ),
      };
    });
    returnToTonight();
  }, [returnToTonight, weekPlan]);

  const pantryCanReplaceToday = useMemo(() => {
    if (!preferences.weeklyPlanningEnabled) return false;
    if (recipePreviewOrigin !== "pantry") return false;
    const today = findTodayPlanDay(weekPlan);
    return Boolean(today && today.recipeId !== meal.recipeId);
  }, [
    meal.recipeId,
    preferences.weeklyPlanningEnabled,
    recipePreviewOrigin,
    weekPlan,
  ]);

  const pantryPlannedTitle = useMemo(() => {
    const today = findTodayPlanDay(weekPlan);
    if (!today) return undefined;
    return getDishById(today.recipeId)?.title;
  }, [weekPlan]);

  const requestReplaceTodayPlan = useCallback(() => {
    if (!pantryCanReplaceToday) return;
    setPantryReplaceConfirming(true);
  }, [pantryCanReplaceToday]);

  const cancelReplaceTodayPlan = useCallback(() => {
    setPantryReplaceConfirming(false);
  }, []);

  const confirmReplaceTodayPlan = useCallback(() => {
    const result = replaceTodayPlanMain(
      weekPlan,
      meal.recipeId,
      {
        hostCuisineIds: weeklyHostIds(preferences),
        allergies: preferences.allergies,
        dietType: preferences.dietType,
      },
    );
    if (!result) {
      setPantryReplaceConfirming(false);
      return;
    }
    setWeekPlan(result.plan);
    setPantryReplaceConfirming(false);
    setPantryPlannedConflict(null);
    // Tonight must immediately show the new planned composition.
    setRecipePreviewOrigin("tonight");
    setTonightFromWeeklyPlan(true);
    const companions = result.plan.find(
      (d) => d.dayOffset === result.replacedDayOffset,
    )?.meal.companionRecipeIds;
    const next = buildMealRecommendation(
      meal.recipeId,
      locale,
      { occasion: "household", guestPreferredCuisineIds: [] },
      {
        fromWeeklyPlan: true,
        companionRecipeIds: companions,
      },
    );
    if (next) setMeal(next);
    setTonightCandidateIds([meal.recipeId]);
    setTonightCandidateIndex(0);
    setFlowStack(["tonight"]);
  }, [
    locale,
    meal.recipeId,
    preferences.allergies,
    preferences.dietType,
    preferences.primaryCuisine,
    preferences.preferredCuisines,
    weekPlan,
  ]);

  const savePantryForFuturePlan = useCallback(() => {
    const recipeId = meal.recipeId;
    setPreferences((prev) => ({
      ...prev,
      futurePlanCandidates: saveFuturePlanCandidate(
        prev.futurePlanCandidates,
        recipeId,
      ),
    }));
    setPantryFutureSaved(true);
  }, [meal.recipeId]);

  const startCook = useCallback(() => {
    // COOK_NOW / ADD_EXTRA — freeze recipe; do not mutate weekly plan.
    const today = findTodayPlanDay(weekPlan);
    const isExtra =
      recipePreviewOrigin === "pantry" &&
      Boolean(today) &&
      today!.recipeId !== meal.recipeId;
    cookSessionRoleRef.current = isExtra ? "extra" : "planned";
    setCookStepIndex(0);
    cookCompletionRecordedRef.current = false;
    setFrozenCookMeal(freezeCookSessionMeal(meal));
    setFlowStack((stack) => [...stack, "cook-mode"]);
  }, [meal, recipePreviewOrigin, weekPlan]);

  const activeMeal = frozenCookMeal ?? meal;

  const shouldAskFeedback = !preferences.feedbackGivenRecipeIds.includes(
    activeMeal.recipeId,
  );

  const recordCookCompletion = useCallback((recipeId: string) => {
    // Once per cook session (ref) — repeated taps must not stack events.
    // Extra cooks never write a completion for a different planned dinner.
    if (cookCompletionRecordedRef.current) return;
    cookCompletionRecordedRef.current = true;
    const sessionRole = cookSessionRoleRef.current;
    setPreferences((prev) => ({
      ...prev,
      mealCookEvents: [
        ...(prev.mealCookEvents ?? []),
        {
          recipeId,
          at: Date.now(),
          kind: "completed" as const,
          sessionRole,
        },
      ].slice(-40),
    }));
  }, []);

  const nextCookStep = useCallback(() => {
    const steps = activeMeal.steps;
    if (cookStepIndex >= steps.length - 1) {
      // Completion is recorded once when the cook session finishes.
      recordCookCompletion(activeMeal.recipeId);
      if (shouldAskFeedback) {
        setFlowStack((stack) => [...stack, "feedback"]);
      } else {
        returnToTonight();
      }

      return;
    }

    setCookStepIndex((index) => index + 1);
  }, [
    activeMeal.recipeId,
    activeMeal.steps,
    cookStepIndex,
    recordCookCompletion,
    returnToTonight,
    shouldAskFeedback,
  ]);

  const prevCookStep = useCallback(() => {
    setCookStepIndex((i) => Math.max(0, i - 1));
  }, []);

  const exitCookMode = useCallback(() => {
    setCookStepIndex(0);
    setFrozenCookMeal(null);
    cookCompletionRecordedRef.current = false;

    setFlowStack((stack) => {
      const trimmed = stack.filter(
        (s) => s !== "cook-mode" && s !== "feedback",
      );

      return trimmed.length > 0 ? trimmed : ["tonight"];
    });
  }, []);

  const submitFeedback = useCallback(
    (rating: MealFeedbackRating) => {
      const recipeId = activeMeal.recipeId;
      setPreferences((prev) => {
        const alreadyGiven = prev.feedbackGivenRecipeIds.includes(recipeId);
        const events = prev.mealFeedbackEvents ?? [];
        const existingIdx = events.findIndex((e) => e.recipeId === recipeId);
        let nextEvents = events;
        if (existingIdx >= 0) {
          // Explicit edit replaces prior feedback — no stacking.
          nextEvents = events.map((e, i) =>
            i === existingIdx ? { recipeId, rating, at: Date.now() } : e,
          );
        } else {
          nextEvents = [...events, { recipeId, rating, at: Date.now() }].slice(
            -60,
          );
        }
        return {
          ...prev,
          feedbackGivenRecipeIds: alreadyGiven
            ? prev.feedbackGivenRecipeIds
            : [...prev.feedbackGivenRecipeIds, recipeId],
          mealFeedbackEvents: nextEvents,
        };
      });

      returnToTonight();
    },

    [activeMeal.recipeId, returnToTonight],
  );

  const openWeeklyPlan = useCallback(() => {
    setFlowStack((stack) =>
      preferences.weeklyPlanningEnabled ? [...stack, "weekly-plan"] : stack,
    );
  }, [preferences.weeklyPlanningEnabled]);

  const updateWeekDay = useCallback(
    (dayOffset: number, recipeId: string) => {
      const dish = listAllDishes().find((d) => d.id === recipeId);
      setWeekPlan((plan) => {
        if (!dish) return plan;
        const usedCompanions = plan
          .filter((d) => d.dayOffset !== dayOffset)
          .flatMap((d) => d.meal?.companionRecipeIds ?? []);
        const meal = composeMealForMain(
          dish,
          {
            hostCuisineIds: weeklyHostIds(preferences),
            allergies: preferences.allergies,
            dietType: preferences.dietType,
          },
          usedCompanions,
        );
        const previous = plan.find((d) => d.dayOffset === dayOffset);
        return plan.map((d) =>
          d.dayOffset === dayOffset
            ? {
                ...d,
                recipeId: meal.mainRecipeId,
                meal,
                // Former main becomes the calm alternate when user picks it.
                alternateRecipeId:
                  previous && previous.recipeId !== meal.mainRecipeId
                    ? previous.recipeId
                    : d.alternateRecipeId,
              }
            : d,
        );
      });
    },
    [preferences.allergies, preferences.dietType, preferences.primaryCuisine, preferences.preferredCuisines],
  );

  const removeWeekDayCompanion = useCallback(
    (dayOffset: number, companionId: string) => {
      setWeekPlan((plan) =>
        plan.map((day) =>
          day.dayOffset === dayOffset
            ? {
                ...day,
                meal: {
                  ...day.meal,
                  companionRecipeIds: day.meal.companionRecipeIds.filter(
                    (id) => id !== companionId,
                  ),
                  balanceReason: "main_only",
                },
              }
            : day,
        ),
      );
    },
    [],
  );

  const selectTonightCandidate = useCallback(
    (recipeId: string) => {
      const dish = getDishById(recipeId);
      if (!dish) return;
      const next = buildMealRecommendation(recipeId, locale, tonightContext, {
        companionRecipeIds: companionIdsForCandidate(dish, {
          hostCuisineIds: weeklyHostIds(preferences),
          allergies: preferences.allergies,
          dietType: preferences.dietType,
        }),
      });
      if (!next) return;
      const idx = tonightCandidateIds.indexOf(recipeId);
      setTonightCandidateIndex(idx >= 0 ? idx : 0);
      setTonightFromWeeklyPlan(false);
      setMeal(next);
      setRecipePreviewOrigin("tonight");
      setFlowStack((stack) => {
        const withoutPreview = stack.filter((s) => s !== "recipe-preview");
        return [...withoutPreview, "recipe-preview"];
      });
    },
    [
      locale,
      preferences.allergies,
      preferences.dietType,
      preferences.primaryCuisine,
      preferences.preferredCuisines,
      tonightCandidateIds,
      tonightContext,
    ],
  );

  const swapTonightCandidate = useCallback(() => {
    if (cookSessionActive) return;
    // Planned Us meal is fixed — never rotate via generic "try another".
    if (tonightFromWeeklyPlan) return;
    if (tonightCandidateIds.length <= 1) return;

    const nextIndex = (tonightCandidateIndex + 1) % tonightCandidateIds.length;

    setTonightCandidateIndex(nextIndex);
    setTonightFromWeeklyPlan(false);

    const recipeId = tonightCandidateIds[nextIndex];

    if (recipeId) {
      const dish = getDishById(recipeId);
      const next = buildMealRecommendation(recipeId, locale, tonightContext, {
        fromWeeklyPlan: false,
        companionRecipeIds: dish
          ? companionIdsForCandidate(dish, {
              hostCuisineIds: weeklyHostIds(preferences),
              allergies: preferences.allergies,
              dietType: preferences.dietType,
            })
          : undefined,
      });
      if (next) setMeal(next);
    }
  }, [
    cookSessionActive,
    locale,
    preferences.allergies,
    preferences.dietType,
    preferences.primaryCuisine,
    preferences.preferredCuisines,
    tonightCandidateIds,
    tonightCandidateIndex,
    tonightContext,
    tonightFromWeeklyPlan,
  ]);

  const setTonightOccasion = useCallback((occasion: TonightOccasion) => {
    setTonightContext({
      occasion,
      intent: undefined,
      guestPrimaryCuisineId: undefined,
      guestPreferredCuisineIds: [],
    });
  }, []);

  const findPantryMatches = useCallback(
    (query: string) => {
      setPantryQuery(query);
      const hostIds = weeklyHostIds(preferences);
      const result = matchDishesByIngredients(
        query,
        preferences.allergies,
        locale,
        3,
        hostIds,
        preferences.dietType,
      );
      setPantryMatchIds(result.recipeIds);
      setPantryNoStrongMatch(result.noStrongMatch);
      setPantryMissingById(result.missingTotalById);
      setPantryCoverageById(result.coverageById);

      if (
        preferences.weeklyPlanningEnabled &&
        weekPlan.length > 0 &&
        query.trim()
      ) {
        const conflict = assessPlannedMealVsPantry({
          plan: weekPlan,
          query,
          allergies: preferences.allergies,
          dietType: preferences.dietType,
          hostCuisineIds: hostIds,
          locale,
        });
        if (conflict?.mayNotHaveEnough) {
          setPantryPlannedConflict({
            mayNotHaveEnough: true,
            plannedTitle:
              getDishById(conflict.plannedRecipeId)?.title ??
              conflict.plannedRecipeId,
            alternativeIds: conflict.alternatives,
          });
        } else {
          setPantryPlannedConflict(null);
        }
      } else {
        setPantryPlannedConflict(null);
      }
    },
    [
      locale,
      preferences.allergies,
      preferences.dietType,
      preferences.primaryCuisine,
      preferences.preferredCuisines,
      preferences.weeklyPlanningEnabled,
      weekPlan,
    ],
  );

  /**
   * Pantry result → Recipe Detail for that exact recipe.
   * Does not return to Tonight or re-run Tonight decisioning.
   */
  const openPantryMatch = useCallback(
    (recipeId: string) => {
      const coverage = pantryCoverageById[recipeId];
      const next = buildMealRecommendation(
        recipeId,
        locale,
        {
          occasion: "household",
          guestPreferredCuisineIds: [],
        },
        {
          reasonCodes: pantryReasonCodes(coverage),
        },
      );
      if (!next) return;
      setMeal(next);
      setTonightCandidateIds([recipeId]);
      setTonightCandidateIndex(0);
      setTonightFromWeeklyPlan(false);
      setRecipePreviewOrigin("pantry");
      setPantryReplaceConfirming(false);
      setPantryFutureSaved(
        (preferences.futurePlanCandidates ?? []).some(
          (c) => c.recipeId === recipeId && !c.scheduledPlanStart,
        ),
      );
      // Preserve pantry query/results for Back from Recipe Detail.
      setFlowStack((stack) => flowAfterOpenPantryMatch(stack));
    },
    [locale, pantryCoverageById, preferences.futurePlanCandidates],
  );

  const choosePantryMatch = openPantryMatch;

  const openRecipePreview = useCallback(() => {
    setRecipePreviewOrigin("tonight");
    setFlowStack((stack) => {
      const withoutPreview = stack.filter((s) => s !== "recipe-preview");
      return [...withoutPreview, "recipe-preview"];
    });
  }, []);

  const backFromRecipePreview = useCallback(() => {
    if (recipePreviewOrigin === "pantry") {
      setFlowStack((stack) => flowAfterBackFromPantryPreview(stack));
      return;
    }
    setFlowStack((stack) => {
      const trimmed = stack.filter((s) => s !== "recipe-preview");
      return trimmed.length > 0 ? trimmed : ["tonight"];
    });
  }, [recipePreviewOrigin]);

  const clearPantryMatches = useCallback(() => {
    setPantryMatchIds([]);
    setPantryNoStrongMatch(false);
    setPantryMissingById({});
    setPantryCoverageById({});
    setPantryQuery("");
    setPantryPlannedConflict(null);
    setPantryReplaceConfirming(false);
    setPantryFutureSaved(false);
  }, []);

  /** Leave pantry mode and restore Tonight decision meal. */
  const exitPantryToTonight = useCallback(() => {
    setRecipePreviewOrigin("tonight");
    clearPantryMatches();
    setFlowStack(["tonight"]);
    // Restore Tonight from decision engine (not the pantry selection).
    refreshTonightCandidates(0, { ignorePantryLock: true });
  }, [clearPantryMatches, refreshTonightCandidates]);

  const setTonightIntent = useCallback((intent: TonightMealIntent) => {
    setTonightContext((prev) => ({ ...prev, intent }));
  }, []);

  const setGuestPrimaryCuisine = useCallback((cuisineId: CuisineFamilyId) => {
    setTonightContext((prev) => ({
      ...prev,
      guestPrimaryCuisineId: cuisineId,
      guestPreferredCuisineIds: prev.guestPreferredCuisineIds.filter(
        (id) => id !== cuisineId,
      ),
    }));
  }, []);

  const toggleGuestPreferredCuisine = useCallback(
    (cuisineId: CuisineFamilyId) => {
      setTonightContext((prev) => {
        const selected = prev.guestPreferredCuisineIds;
        if (selected.includes(cuisineId)) {
          return {
            ...prev,
            guestPreferredCuisineIds: selected.filter((id) => id !== cuisineId),
          };
        }
        if (selected.length >= 2 || cuisineId === prev.guestPrimaryCuisineId) {
          return prev;
        }
        return {
          ...prev,
          guestPreferredCuisineIds: [...selected, cuisineId],
        };
      });
    },
    [],
  );

  const value = useMemo<AppStateContextValue>(
    () => ({
      currentScreen,

      preferences,

      meal: activeMeal,

      weekPlan,

      cookStepIndex,

      tonightContext,

      tonightCandidateIds,

      tonightCandidateMeals,

      tonightCandidateIndex,

      navigate,

      goBack,

      canGoBack,

      replace,

      returnToTonight,

      enterPostAuthOnboarding,

      setLanguage,

      completeHouseholdMembers,

      toggleAllergy,

      completeAllergies,

      toggleFavoriteCuisine,

      setPrimaryCuisine,

      togglePreferredCuisine,

      completeCuisinePreferences,

      handleWeeklyOptIn,

      draftDayIntents,

      draftDayCuisineSources,

      intentDayDates: intentDayMeta.dates,

      intentWeekdayIndexes: intentDayMeta.weekdayIndexes,

      setDraftDayIntent,

      setDraftDayCuisineSource,

      confirmWeeklyIntents,

      setWeekDayIntent,

      saveWeekPlan,

      recipePreviewOrigin,

      pantryCanReplaceToday,

      pantryPlannedTitle,
      pantryReplaceConfirming,

      pantryFutureSaved,

      pantryPlannedConflict,

      requestReplaceTodayPlan,

      confirmReplaceTodayPlan,

      cancelReplaceTodayPlan,

      savePantryForFuturePlan,

      startCook,

      nextCookStep,

      prevCookStep,

      exitCookMode,

      submitFeedback,

      openWeeklyPlan,

      updateWeekDay,

      removeWeekDayCompanion,

      selectTonightCandidate,

      swapTonightCandidate,

      setTonightOccasion,

      setTonightIntent,

      setGuestPrimaryCuisine,

      toggleGuestPreferredCuisine,

      pantryMatchIds,

      pantryQuery,

      pantryNoStrongMatch,

      pantryMissingById,

      pantryCoverageById,

      findPantryMatches,

      setPantryQuery,

      openPantryMatch,

      choosePantryMatch,

      clearPantryMatches,

      exitPantryToTonight,

      backFromRecipePreview,

      openRecipePreview,

      shouldAskFeedback,

      tonightFromWeeklyPlan,

      tonightSafetyBlocked,
    }),

    [
      activeMeal,

      backFromRecipePreview,

      canGoBack,

      choosePantryMatch,

      clearPantryMatches,

      completeAllergies,

      completeCuisinePreferences,

      completeHouseholdMembers,

      cookStepIndex,

      currentScreen,

      enterPostAuthOnboarding,

      exitCookMode,

      exitPantryToTonight,

      findPantryMatches,

      goBack,

      cancelReplaceTodayPlan,

      confirmReplaceTodayPlan,

      confirmWeeklyIntents,

      draftDayIntents,

      handleWeeklyOptIn,

      intentDayMeta,

      navigate,

      pantryCanReplaceToday,

      pantryFutureSaved,

      pantryPlannedConflict,

      pantryPlannedTitle,

      pantryReplaceConfirming,

      recipePreviewOrigin,

      requestReplaceTodayPlan,

      savePantryForFuturePlan,

      nextCookStep,

      openPantryMatch,

      openRecipePreview,

      openWeeklyPlan,

      pantryCoverageById,

      pantryMatchIds,

      pantryMissingById,

      pantryNoStrongMatch,

      pantryQuery,

      preferences,

      prevCookStep,

      replace,

      returnToTonight,

      saveWeekPlan,

      setDraftDayIntent,

      setLanguage,

      setPantryQuery,

      setWeekDayIntent,

      setTonightIntent,

      setGuestPrimaryCuisine,

      setTonightOccasion,

      toggleGuestPreferredCuisine,

      shouldAskFeedback,

      startCook,

      submitFeedback,

      swapTonightCandidate,

      toggleAllergy,

      toggleFavoriteCuisine,

      tonightCandidateIds,

      tonightCandidateMeals,

      tonightCandidateIndex,

      tonightContext,

      tonightFromWeeklyPlan,

      tonightSafetyBlocked,

      updateWeekDay,

      removeWeekDayCompanion,

      selectTonightCandidate,

      weekPlan,
    ],
  );

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext);

  if (!ctx) {
    throw new Error("useAppState must be used within AppStateProvider");
  }

  return ctx;
}
