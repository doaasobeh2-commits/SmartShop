import type { AppPreferences, CuisineFamilyId, FlowScreen } from "@recipe-ai/core/types";
import { normalizeAppLocale } from "../i18n/types";
import { normalizeCuisineFamilyId } from "../data/cuisineOnboarding";
import {
  MAX_PREFERRED_CUISINES,
  syncFavoriteCuisinesMirror,
} from "../data/catalog/decision/householdCuisine";

const STORAGE_KEY = "recipeai.preferences.v1";

export const defaultPreferences: AppPreferences = {
  onboardingComplete: false,
  languageSelected: false,
  householdMembersComplete: false,
  allergiesComplete: false,
  cuisinePreferencesComplete: false,
  email: "",
  language: "en",
  country: "",
  city: "",
  familySize: "",
  dietType: "normal",
  favoriteCuisines: [],
  preferredCuisines: [],
  favoriteRestaurants: [],
  allergies: [],
  weeklyPlanningEnabled: false,
  weeklyPlanOptInAsked: false,
  feedbackGivenRecipeIds: [],
  mealFeedbackEvents: [],
  mealCookEvents: [],
  persistedWeekPlan: undefined,
  futurePlanCandidates: [],
};

type StoredPreferences = Partial<AppPreferences> & {
  foodPreferencesComplete?: boolean;
};

export function migratePreferences(parsed: StoredPreferences): AppPreferences {
  const merged: AppPreferences = { ...defaultPreferences, ...parsed };

  merged.language = normalizeAppLocale(merged.language);

  merged.favoriteCuisines = [
    ...new Set(
      (parsed.favoriteCuisines ?? [])
        .map(normalizeCuisineFamilyId)
        .filter(Boolean),
    ),
  ];

  merged.preferredCuisines = [
    ...new Set(
      (parsed.preferredCuisines ?? [])
        .map(normalizeCuisineFamilyId)
        .filter(Boolean),
    ),
  ].slice(0, MAX_PREFERRED_CUISINES) as CuisineFamilyId[];

  if (parsed.primaryCuisine) {
    merged.primaryCuisine = normalizeCuisineFamilyId(
      parsed.primaryCuisine,
    ) as CuisineFamilyId;
  } else if (merged.favoriteCuisines.length === 1) {
    merged.primaryCuisine = merged.favoriteCuisines[0] as CuisineFamilyId;
    merged.preferredCuisines = [];
  } else {
    merged.primaryCuisine = undefined;
  }

  if (merged.primaryCuisine) {
    merged.preferredCuisines = merged.preferredCuisines.filter(
      (c) => c !== merged.primaryCuisine,
    );
    merged.favoriteCuisines = syncFavoriteCuisinesMirror(
      merged.primaryCuisine,
      merged.preferredCuisines,
    );
  }

  if (parsed.foodPreferencesComplete === true) {
    merged.allergiesComplete = true;
    merged.cuisinePreferencesComplete = true;
  }

  if (merged.onboardingComplete) {
    merged.languageSelected = true;
    merged.householdMembersComplete = true;
    merged.allergiesComplete = true;
    merged.cuisinePreferencesComplete = true;
  }

  if (merged.allergiesComplete && !merged.householdMembersComplete) {
    merged.householdMembersComplete = true;
  }

  if (
    merged.allergiesComplete &&
    !merged.cuisinePreferencesComplete &&
    merged.primaryCuisine
  ) {
    merged.cuisinePreferencesComplete = true;
  }

  merged.mealFeedbackEvents = parsed.mealFeedbackEvents ?? [];
  merged.mealCookEvents = (parsed.mealCookEvents ?? []).map((e) => ({
    recipeId: e.recipeId,
    at: e.at,
    kind: e.kind ?? "completed",
  }));
  merged.persistedWeekPlan = parsed.persistedWeekPlan;
  merged.futurePlanCandidates = parsed.futurePlanCandidates ?? [];

  return merged;
}

export function loadPreferences(): AppPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPreferences;
    const parsed = JSON.parse(raw) as StoredPreferences;
    return migratePreferences(parsed);
  } catch {
    return defaultPreferences;
  }
}

export function savePreferences(prefs: AppPreferences) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export function resolveInitialFlowScreen(prefs: AppPreferences): FlowScreen {
  if (prefs.onboardingComplete) return "tonight";
  if (!prefs.languageSelected) return "language-selection";
  return "welcome";
}

export function resolvePostAuthOnboardingScreen(
  prefs: AppPreferences,
): FlowScreen {
  if (!prefs.householdMembersComplete) return "household-members";
  if (!prefs.allergiesComplete) return "food-preferences";
  if (!prefs.cuisinePreferencesComplete) return "cuisine-preferences";
  if (!prefs.onboardingComplete) return "weekly-plan-opt-in";
  return "tonight";
}
