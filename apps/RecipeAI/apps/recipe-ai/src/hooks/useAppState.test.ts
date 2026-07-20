import assert from "node:assert/strict";

import { describe, it } from "node:test";

import type { AppPreferences } from "@recipe-ai/core/types";

import { migratePreferences } from "./appStateLogic";

import {
  resolveInitialFlowScreen,
  resolvePostAuthOnboardingScreen,
} from "./useAppState";

const basePrefs: AppPreferences = {
  onboardingComplete: false,

  languageSelected: false,

  householdMembersComplete: false,

  allergiesComplete: false,

  cuisinePreferencesComplete: false,

  favoriteCuisines: [],

  preferredCuisines: [],

  favoriteRestaurants: [],

  allergies: [],

  weeklyPlanningEnabled: false,

  weeklyPlanOptInAsked: false,

  feedbackGivenRecipeIds: [],

  mealFeedbackEvents: [],

  mealCookEvents: [],
};

describe("migratePreferences", () => {
  it("maps legacy foodPreferencesComplete to split flags", () => {
    const migrated = migratePreferences({ foodPreferencesComplete: true });

    assert.equal(migrated.allergiesComplete, true);

    assert.equal(migrated.cuisinePreferencesComplete, true);

    assert.equal(migrated.householdMembersComplete, true);
  });

  it("normalizes legacy cuisine ids", () => {
    const migrated = migratePreferences({
      favoriteCuisines: ["arabic", "austrian"],
    });

    assert.deepEqual(migrated.favoriteCuisines, ["arab", "central_european"]);
  });

  it("migrates single legacy favorite to primary cuisine", () => {
    const migrated = migratePreferences({
      favoriteCuisines: ["arab"],
    });
    assert.equal(migrated.primaryCuisine, "arab");
    assert.deepEqual(migrated.preferredCuisines, []);
  });

  it("does not invent primary from multiple legacy favorites", () => {
    const migrated = migratePreferences({
      favoriteCuisines: ["arab", "turkish"],
    });
    assert.equal(migrated.primaryCuisine, undefined);
  });
});

describe("resolveInitialFlowScreen", () => {
  it("routes to language-selection before welcome for new users", () => {
    assert.equal(resolveInitialFlowScreen(basePrefs), "language-selection");
  });

  it("routes to welcome after language is selected", () => {
    assert.equal(
      resolveInitialFlowScreen({ ...basePrefs, languageSelected: true }),

      "welcome",
    );
  });

  it("routes to tonight when onboarding is complete", () => {
    assert.equal(
      resolveInitialFlowScreen({ ...basePrefs, onboardingComplete: true }),

      "tonight",
    );
  });
});

describe("resolvePostAuthOnboardingScreen", () => {
  it("routes to household-members when household step not complete", () => {
    assert.equal(
      resolvePostAuthOnboardingScreen({
        ...basePrefs,

        languageSelected: true,
      }),

      "household-members",
    );
  });

  it("routes to food-preferences when allergies step not complete", () => {
    assert.equal(
      resolvePostAuthOnboardingScreen({
        ...basePrefs,

        languageSelected: true,

        householdMembersComplete: true,
      }),

      "food-preferences",
    );
  });

  it("routes to cuisine-preferences after allergies", () => {
    assert.equal(
      resolvePostAuthOnboardingScreen({
        ...basePrefs,

        languageSelected: true,

        householdMembersComplete: true,

        allergiesComplete: true,
      }),

      "cuisine-preferences",
    );
  });

  it("routes to weekly-plan-opt-in after cuisine preferences", () => {
    assert.equal(
      resolvePostAuthOnboardingScreen({
        ...basePrefs,

        languageSelected: true,

        householdMembersComplete: true,

        allergiesComplete: true,

        cuisinePreferencesComplete: true,
      }),

      "weekly-plan-opt-in",
    );
  });

  it("routes to tonight when onboarding is complete", () => {
    assert.equal(
      resolvePostAuthOnboardingScreen({
        ...basePrefs,

        languageSelected: true,

        householdMembersComplete: true,

        allergiesComplete: true,

        cuisinePreferencesComplete: true,

        onboardingComplete: true,

        weeklyPlanOptInAsked: true,
      }),

      "tonight",
    );
  });
});

describe("onboarding order", () => {
  it("follows language → household → allergies → cuisine → weekly plan", () => {
    let prefs: AppPreferences = { ...basePrefs };

    assert.equal(resolveInitialFlowScreen(prefs), "language-selection");

    prefs = { ...prefs, languageSelected: true, language: "ar" };

    assert.equal(resolveInitialFlowScreen(prefs), "welcome");

    assert.equal(resolvePostAuthOnboardingScreen(prefs), "household-members");

    prefs = { ...prefs, householdMembersComplete: true };

    assert.equal(resolvePostAuthOnboardingScreen(prefs), "food-preferences");

    prefs = { ...prefs, allergiesComplete: true };

    assert.equal(resolvePostAuthOnboardingScreen(prefs), "cuisine-preferences");

    prefs = {
      ...prefs,

      cuisinePreferencesComplete: true,

      favoriteCuisines: ["arab", "turkish"],
    };

    assert.equal(resolvePostAuthOnboardingScreen(prefs), "weekly-plan-opt-in");
  });
});
