import { useCallback, useEffect, useState } from "react";
import type {
  AppPreferences,
  FlowScreen,
  MealFeedbackRating,
  MealRecommendation,
  WeekDayPlan,
} from "@recipe-ai/core/types";
import { defaultWeekPlan, mockRecommendation } from "../data/mockRecommendation";

const STORAGE_KEY = "recipeai.preferences.v1";

const defaultPreferences: AppPreferences = {
  onboardingComplete: false,

  email: "",

  language: "en",

  country: "",

  city: "",

  familySize: "",

  dietType: "normal",

  favoriteCuisines: [],

  favoriteRestaurants: [],

  allergies: [],

  weeklyPlanningEnabled: false,

  weeklyPlanOptInAsked: false,

  feedbackGivenRecipeIds: [],
};

function loadPreferences(): AppPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPreferences;
    return { ...defaultPreferences, ...JSON.parse(raw) };
  } catch {
    return defaultPreferences;
  }
}

function savePreferences(prefs: AppPreferences) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

function initialFlowScreen(prefs: AppPreferences): FlowScreen {
  if (prefs.onboardingComplete) return "tonight";
  return "welcome";
}

export function useAppState() {
  const [preferences, setPreferences] = useState<AppPreferences>(loadPreferences);
  const [flowStack, setFlowStack] = useState<FlowScreen[]>(() => [
    initialFlowScreen(loadPreferences()),
  ]);
  const [meal, setMeal] = useState<MealRecommendation>(mockRecommendation);
  const [weekPlan, setWeekPlan] = useState<WeekDayPlan[]>(defaultWeekPlan);
  const [cookStepIndex, setCookStepIndex] = useState(0);

  useEffect(() => {
    savePreferences(preferences);
  }, [preferences]);

  const currentScreen = flowStack[flowStack.length - 1];

  const navigate = useCallback((screen: FlowScreen) => {
    setFlowStack((stack) => [...stack, screen]);
  }, []);

  const goBack = useCallback(() => {
    setFlowStack((stack) => (stack.length > 1 ? stack.slice(0, -1) : stack));
  }, []);

  const replace = useCallback((screen: FlowScreen) => {
    setFlowStack((stack) => [...stack.slice(0, -1), screen]);
  }, []);

  const toggleAllergy = useCallback((allergy: string) => {
    setPreferences((prev) => ({
      ...prev,
      allergies: prev.allergies.includes(allergy)
        ? prev.allergies.filter((a) => a !== allergy)
        : [...prev.allergies, allergy],
    }));
  }, []);

  const completeFoodPreferences = useCallback(() => {
    navigate("weekly-plan-opt-in");
  }, [navigate]);

  const handleWeeklyOptIn = useCallback(
    (enabled: boolean) => {
      setPreferences((prev) => ({
        ...prev,
        weeklyPlanningEnabled: enabled,
        weeklyPlanOptInAsked: true,
        onboardingComplete: true,
      }));
      if (enabled) {
        navigate("weekly-plan");
      } else {
        replace("tonight");
        setFlowStack(["tonight"]);
      }
    },
    [navigate, replace],
  );

  const saveWeekPlan = useCallback(() => {
    setFlowStack(["tonight"]);
  }, []);

  const startCook = useCallback(() => {
    setCookStepIndex(0);
    navigate("cook-mode");
  }, [navigate]);

  const nextCookStep = useCallback(() => {
    if (cookStepIndex >= meal.steps.length - 1) {
      navigate("feedback");
      return;
    }
    setCookStepIndex((i) => i + 1);
  }, [cookStepIndex, meal.steps.length, navigate]);

  const prevCookStep = useCallback(() => {
    setCookStepIndex((i) => Math.max(0, i - 1));
  }, []);

  const submitFeedback = useCallback(
    (rating: MealFeedbackRating) => {
      setPreferences((prev) => ({
        ...prev,
        feedbackGivenRecipeIds: prev.feedbackGivenRecipeIds.includes(meal.id)
          ? prev.feedbackGivenRecipeIds
          : [...prev.feedbackGivenRecipeIds, meal.id],
      }));
      void rating;
      setFlowStack(["tonight"]);
    },
    [meal.id],
  );

  const openWeeklyPlan = useCallback(() => {
    if (preferences.weeklyPlanningEnabled) navigate("weekly-plan");
  }, [navigate, preferences.weeklyPlanningEnabled]);

  const updateWeekDay = useCallback((day: string, mealTitle: string) => {
    setWeekPlan((plan) => plan.map((d) => (d.day === day ? { ...d, mealTitle } : d)));
  }, []);

  const shouldAskFeedback = !preferences.feedbackGivenRecipeIds.includes(meal.id);

  return {
    currentScreen,
    preferences,
    meal,
    weekPlan,
    cookStepIndex,
    navigate,
    goBack,
    replace,
    toggleAllergy,
    completeFoodPreferences,
    handleWeeklyOptIn,
    saveWeekPlan,
    startCook,
    nextCookStep,
    prevCookStep,
    submitFeedback,
    openWeeklyPlan,
    updateWeekDay,
    shouldAskFeedback,
    setMeal,
  };
}
