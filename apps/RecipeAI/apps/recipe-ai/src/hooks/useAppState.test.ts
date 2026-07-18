import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AppPreferences } from "@recipe-ai/core/types";
import { resolvePostAuthOnboardingScreen } from "./useAppState";

const basePrefs: AppPreferences = {
  onboardingComplete: false,
  foodPreferencesComplete: false,
  favoriteCuisines: [],
  favoriteRestaurants: [],
  allergies: [],
  weeklyPlanningEnabled: false,
  weeklyPlanOptInAsked: false,
  feedbackGivenRecipeIds: [],
};

describe("resolvePostAuthOnboardingScreen", () => {
  it("routes to food-preferences when allergies step not complete", () => {
    assert.equal(
      resolvePostAuthOnboardingScreen(basePrefs),
      "food-preferences",
    );
  });

  it("routes to weekly-plan-opt-in after food preferences", () => {
    assert.equal(
      resolvePostAuthOnboardingScreen({
        ...basePrefs,
        foodPreferencesComplete: true,
      }),
      "weekly-plan-opt-in",
    );
  });

  it("routes to tonight when onboarding is complete", () => {
    assert.equal(
      resolvePostAuthOnboardingScreen({
        ...basePrefs,
        foodPreferencesComplete: true,
        onboardingComplete: true,
        weeklyPlanOptInAsked: true,
      }),
      "tonight",
    );
  });
});
