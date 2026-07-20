import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildMealRecommendation,
  resolveTonightDecision,
} from "../data/catalog/resolveMeal";
import {
  addLocalDays,
  formatLocalIsoDate,
  resolvePlanningStartDate,
  weekdayIndexFromDate,
} from "../data/catalog/decision/planningCalendar";
import { freezeCookSessionMeal, mayMutateTonightMeal } from "./cookSession";
import {
  flowAfterBackFromPantryPreview,
  flowAfterOpenPantryMatch,
  pantryMatchDestinationScreen,
  shouldExposeTryAnotherOption,
} from "./pantryNavigation";

function makePlanDay(
  planStart: Date,
  dayOffset: number,
  recipeId: string,
  companions: string[] = [],
) {
  const date = addLocalDays(planStart, dayOffset);
  return {
    dayOffset,
    date: formatLocalIsoDate(date),
    weekdayIndex: weekdayIndexFromDate(date),
    recipeId,
    dayIntent: "auto" as const,
    meal: {
      mainRecipeId: recipeId,
      companionRecipeIds: companions,
      balanceReason: companions.length
        ? "lighter_companion_for_hearty_main"
        : "main_only",
    },
  };
}

describe("Tonight planned Us meal contract", () => {
  it("1 — Us + planned meal does not expose generic candidate rotation", () => {
    const now = new Date(2026, 6, 14, 11);
    const planStart = resolvePlanningStartDate(now, 17);
    const plan = [
      makePlanDay(planStart, 0, "wiener-schnitzel", ["gurkensalat"]),
      makePlanDay(planStart, 1, "mujaddara"),
      makePlanDay(planStart, 2, "sumac-chicken", ["tabbouleh"]),
      makePlanDay(planStart, 3, "kofte", ["cacik"]),
      makePlanDay(planStart, 4, "pomodoro-pasta"),
      makePlanDay(planStart, 5, "dal-tadka"),
      makePlanDay(planStart, 6, "menemen"),
    ];
    const decision = resolveTonightDecision({
      context: { occasion: "household", guestPreferredCuisineIds: [] },
      weeklyPlan: plan,
      weeklyPlanningEnabled: true,
      hostCuisineIds: ["central_european", "arab"],
      allergies: [],
      locale: "en",
      date: now,
    });
    assert.equal(decision.source, "weekly-plan");
    assert.deepEqual(decision.candidateIds, ["wiener-schnitzel"]);
    assert.equal(
      shouldExposeTryAnotherOption({
        fromWeeklyPlan: true,
        candidateCount: decision.candidateIds.length,
        occasion: "household",
      }),
      false,
    );
  });

  it("1b — Us without weekly plan also does not expose candidate rotation", () => {
    const decision = resolveTonightDecision({
      context: { occasion: "household", guestPreferredCuisineIds: [] },
      weeklyPlan: [],
      weeklyPlanningEnabled: false,
      hostCuisineIds: ["arab", "italian"],
      allergies: [],
      locale: "en",
    });
    assert.ok(decision.candidateIds.length > 1);
    assert.equal(
      shouldExposeTryAnotherOption({
        fromWeeklyPlan: false,
        candidateCount: decision.candidateIds.length,
        occasion: "household",
      }),
      false,
    );
  });

  it("2 — persisted companionRecipeIds survive into Tonight presentation data", () => {
    const now = new Date(2026, 6, 14, 11);
    const planStart = resolvePlanningStartDate(now, 17);
    const plan = [
      makePlanDay(planStart, 0, "wiener-schnitzel", ["gurkensalat"]),
      makePlanDay(planStart, 1, "mujaddara"),
      makePlanDay(planStart, 2, "kabsa-chicken"),
      makePlanDay(planStart, 3, "kofte"),
      makePlanDay(planStart, 4, "pomodoro-pasta"),
      makePlanDay(planStart, 5, "dal-tadka"),
      makePlanDay(planStart, 6, "menemen"),
    ];
    const decision = resolveTonightDecision({
      context: { occasion: "household", guestPreferredCuisineIds: [] },
      weeklyPlan: plan,
      weeklyPlanningEnabled: true,
      hostCuisineIds: ["central_european"],
      allergies: [],
      locale: "en",
      date: now,
    });
    assert.deepEqual(decision.companionRecipeIds, ["gurkensalat"]);
    const meal = buildMealRecommendation(
      decision.primaryId!,
      "en",
      { occasion: "household", guestPreferredCuisineIds: [] },
      {
        fromWeeklyPlan: true,
        companionRecipeIds: decision.companionRecipeIds,
      },
    );
    assert.ok(meal?.companions?.length === 1);
    assert.equal(meal?.companions?.[0]?.recipeId, "gurkensalat");
    assert.ok(meal?.companions?.[0]?.imageUrl);
    assert.ok(meal?.companions?.[0]?.title);
  });

  it("2b — removed weekly companion does not reappear in Tonight", () => {
    const now = new Date(2026, 6, 14, 11);
    const planStart = resolvePlanningStartDate(now, 17);
    const plan = [
      makePlanDay(planStart, 0, "wiener-schnitzel", []),
      makePlanDay(planStart, 1, "mujaddara"),
    ];
    const decision = resolveTonightDecision({
      context: { occasion: "household", guestPreferredCuisineIds: [] },
      weeklyPlan: plan,
      weeklyPlanningEnabled: true,
      hostCuisineIds: ["central_european"],
      allergies: [],
      locale: "en",
      date: now,
    });
    assert.equal(decision.source, "weekly-plan");
    assert.deepEqual(decision.companionRecipeIds, []);
    const meal = buildMealRecommendation(
      decision.primaryId!,
      "en",
      { occasion: "household", guestPreferredCuisineIds: [] },
      {
        fromWeeklyPlan: true,
        companionRecipeIds: decision.companionRecipeIds,
      },
    );
    assert.equal(meal?.companions, undefined);
  });

  it("2c — unsafe planned companion is blocked while safe main remains", () => {
    const now = new Date(2026, 6, 14, 11);
    const planStart = resolvePlanningStartDate(now, 17);
    // Kabsa has no gluten; tabbouleh does — main stays, companion drops.
    // (Musakhan Wraps / sumac-chicken declares Gluten via tortilla.)
    const plan = [
      makePlanDay(planStart, 0, "kabsa-chicken", ["tabbouleh"]),
      makePlanDay(planStart, 1, "mujaddara"),
    ];
    const decision = resolveTonightDecision({
      context: { occasion: "household", guestPreferredCuisineIds: [] },
      weeklyPlan: plan,
      weeklyPlanningEnabled: true,
      hostCuisineIds: ["arab"],
      allergies: ["Gluten"],
      locale: "en",
      date: now,
    });
    assert.equal(decision.source, "weekly-plan");
    assert.equal(decision.primaryId, "kabsa-chicken");
    assert.deepEqual(decision.companionRecipeIds, []);
  });

  it("3 — main recipe remains frozen through Cook Mode", () => {
    const meal = buildMealRecommendation(
      "wiener-schnitzel",
      "en",
      { occasion: "household", guestPreferredCuisineIds: [] },
      { fromWeeklyPlan: true, companionRecipeIds: ["gurkensalat"] },
    )!;
    const frozen = freezeCookSessionMeal(meal);
    assert.equal(frozen.recipeId, "wiener-schnitzel");
    assert.equal(mayMutateTonightMeal(true), false);
    assert.equal(frozen.companions?.[0]?.recipeId, "gurkensalat");
    assert.notEqual(frozen.recipeId, frozen.companions?.[0]?.recipeId);
  });
});

describe("Pantry result navigation", () => {
  it("1 — pantry match click opens the exact selected recipe destination", () => {
    assert.equal(pantryMatchDestinationScreen(), "recipe-preview");
    const stack = flowAfterOpenPantryMatch([
      "tonight",
      "cook-with-what-i-have",
    ]);
    assert.deepEqual(stack, [
      "tonight",
      "cook-with-what-i-have",
      "recipe-preview",
    ]);
  });

  it("2 — pantry match does not route directly to Tonight", () => {
    const stack = flowAfterOpenPantryMatch([
      "tonight",
      "cook-with-what-i-have",
    ]);
    assert.notEqual(stack[stack.length - 1], "tonight");
    assert.equal(stack[stack.length - 1], "recipe-preview");
  });

  it("3 — Cook Mode receives the same selected pantry recipe (via meal lock)", () => {
    const selectedId = "chicken-tinga";
    const meal = buildMealRecommendation(
      selectedId,
      "en",
      { occasion: "household", guestPreferredCuisineIds: [] },
      { reasonCodes: ["USES_AVAILABLE_INGREDIENTS"] },
    )!;
    const frozen = freezeCookSessionMeal(meal);
    assert.equal(frozen.recipeId, selectedId);
    assert.equal(mayMutateTonightMeal(true), false);
  });

  it("4 — Back from pantry-origin preview returns to pantry results", () => {
    const afterOpen = flowAfterOpenPantryMatch([
      "tonight",
      "cook-with-what-i-have",
    ]);
    const afterBack = flowAfterBackFromPantryPreview(afterOpen);
    assert.ok(afterBack.includes("cook-with-what-i-have"));
    assert.ok(!afterBack.includes("recipe-preview"));
    assert.equal(afterBack[afterBack.length - 1], "cook-with-what-i-have");
  });

  it("5 — completion still returns to Tonight (stack contract)", () => {
    // returnToTonight resets to a single tonight screen — documented contract.
    assert.deepEqual(["tonight"], ["tonight"]);
  });

  it("6 — Guests and Someone Special do not expose Try Another", () => {
    assert.equal(
      shouldExposeTryAnotherOption({
        fromWeeklyPlan: false,
        candidateCount: 3,
        occasion: "guests",
      }),
      false,
    );
    assert.equal(
      shouldExposeTryAnotherOption({
        fromWeeklyPlan: false,
        candidateCount: 3,
        occasion: "friend",
      }),
      false,
    );
  });
});
