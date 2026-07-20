import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { MealRecommendation } from "@recipe-ai/core/types";
import {
  cookStartWritesCookedEvent,
  freezeCookSessionMeal,
  isCookSessionActive,
  mayMutateTonightMeal,
} from "./cookSession";

const sampleMeal: MealRecommendation = {
  id: "mujaddara-en",
  recipeId: "mujaddara",
  cuisineFamilyId: "arab",
  title: "Mujaddara",
  reason: "test",
  prepMinutes: 40,
  imageUrl: "/x.jpg",
  cuisine: "Arab",
  ingredients: [{ id: "rice", name: "Rice", detail: "1 cup", status: "need" }],
  steps: [
    { order: 1, instruction: "Rinse" },
    { order: 2, instruction: "Cook" },
  ],
  tips: ["tip"],
  storageTip: "fridge",
};

describe("Cook session freeze lifecycle", () => {
  it("freezes recipe snapshot; Tonight must not mutate active cook meal", () => {
    const frozen = freezeCookSessionMeal(sampleMeal);
    assert.equal(frozen.recipeId, "mujaddara");
    assert.equal(isCookSessionActive(frozen), true);
    assert.equal(mayMutateTonightMeal(true), false);
    assert.equal(mayMutateTonightMeal(false), true);

    // Mutating the live Tonight meal object must not alter the frozen snapshot.
    const live: MealRecommendation = {
      ...sampleMeal,
      recipeId: "kabsa-chicken",
      steps: [{ order: 1, instruction: "Different" }],
    };
    assert.equal(frozen.recipeId, "mujaddara");
    assert.equal(frozen.steps[0]?.instruction, "Rinse");
    assert.notEqual(live.recipeId, frozen.recipeId);
  });

  it("cook-start does not write cooked memory", () => {
    assert.equal(cookStartWritesCookedEvent(), false);
  });
});
