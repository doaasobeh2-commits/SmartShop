import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { WeekDayPlan } from "@recipe-ai/core/types";
import { getDishById } from "../dishes";
import {
  buildDefaultWeekPlanDetailed,
  resolveTonightDecision,
} from "../resolveMeal";
import {
  composeMealForMain,
  isCompatibleCompanion,
  CURATED_COMPANIONS,
} from "./mealComposition";
import {
  DEFAULT_PLANNING_CUTOFF_HOUR_LOCAL,
  addLocalDays,
  formatLocalIsoDate,
  resolvePlanStartKey,
  resolvePlanningStartDate,
  weekdayIndexFromDate,
} from "./planningCalendar";
import {
  freezeCookSessionMeal,
  mayMutateTonightMeal,
} from "../../../hooks/cookSession";
import { buildMealRecommendation } from "../resolveMeal";

function atLocal(
  y: number,
  m0: number,
  d: number,
  hour: number,
  minute = 0,
): Date {
  return new Date(y, m0, d, hour, minute, 0, 0);
}

function makeDay(
  planStart: Date,
  dayOffset: number,
  recipeId: string,
  companions: string[] = [],
): WeekDayPlan {
  const date = addLocalDays(planStart, dayOffset);
  return {
    dayOffset,
    date: formatLocalIsoDate(date),
    weekdayIndex: weekdayIndexFromDate(date),
    recipeId,
    dayIntent: "auto",
    meal: {
      mainRecipeId: recipeId,
      companionRecipeIds: companions,
      balanceReason: companions.length
        ? "compatible_accompaniment"
        : "main_only",
    },
  };
}

describe("Calendar-aware rolling weekly plan", () => {
  it("Tuesday morning plan starts Tuesday → … → Monday", () => {
    const now = atLocal(2026, 6, 14, 10); // Tue Jul 14 2026
    const start = resolvePlanningStartDate(
      now,
      DEFAULT_PLANNING_CUTOFF_HOUR_LOCAL,
    );
    assert.equal(formatLocalIsoDate(start), "2026-07-14");
    assert.equal(weekdayIndexFromDate(start), 1); // Tuesday

    const { plan, planStart } = buildDefaultWeekPlanDetailed(
      "en",
      ["central_european", "arab"],
      [],
      undefined,
      { now },
    );
    assert.equal(planStart, "2026-07-14");
    assert.equal(plan.length, 7);
    assert.equal(plan[0]?.date, "2026-07-14");
    assert.equal(plan[0]?.weekdayIndex, 1);
    assert.equal(plan[6]?.date, "2026-07-20");
    assert.equal(plan[6]?.weekdayIndex, 0); // Monday
    for (let i = 0; i < 7; i++) {
      assert.equal(plan[i]?.dayOffset, i);
    }
  });

  it("Tuesday evening after cutoff plan starts Wednesday → … → Tuesday", () => {
    const now = atLocal(2026, 6, 14, 18); // Tue 18:00
    const start = resolvePlanningStartDate(now, 17);
    assert.equal(formatLocalIsoDate(start), "2026-07-15");
    assert.equal(resolvePlanStartKey(now, 17), "2026-07-15");

    const { plan, planStart } = buildDefaultWeekPlanDetailed(
      "en",
      ["italian", "arab"],
      [],
      undefined,
      { now, planningCutoffHourLocal: 17 },
    );
    assert.equal(planStart, "2026-07-15");
    assert.equal(plan[0]?.weekdayIndex, 2); // Wednesday
    assert.equal(plan[6]?.date, "2026-07-21");
    assert.equal(plan[6]?.weekdayIndex, 1); // Tuesday
  });

  it("same planStart refresh keeps identical plan + companions", () => {
    const now = atLocal(2026, 6, 14, 11);
    const a = buildDefaultWeekPlanDetailed(
      "en",
      ["arab", "italian"],
      [],
      undefined,
      { now },
    );
    const b = buildDefaultWeekPlanDetailed(
      "en",
      ["arab", "italian"],
      [],
      undefined,
      { now },
    );
    assert.deepEqual(a.plan, b.plan);
    assert.equal(a.planStart, b.planStart);
    assert.deepEqual(
      a.plan.map((d) => d.meal),
      b.plan.map((d) => d.meal),
    );
  });
});

describe("Meal composition", () => {
  it("1 — complete main may remain alone", () => {
    const kabsa = getDishById("kabsa-chicken")!;
    const meal = composeMealForMain(kabsa, {
      allergies: [],
      hostCuisineIds: ["arab"],
    });
    assert.equal(meal.mainRecipeId, "kabsa-chicken");
    assert.deepEqual(meal.companionRecipeIds, []);
    assert.ok(
      meal.balanceReason === "self_contained" ||
        meal.balanceReason === "main_only",
    );
  });

  it("2 — heavy main can receive compatible lighter companion", () => {
    const schnitzel = getDishById("wiener-schnitzel")!;
    const meal = composeMealForMain(schnitzel, {
      allergies: [],
      hostCuisineIds: ["central_european"],
    });
    assert.equal(meal.mainRecipeId, "wiener-schnitzel");
    assert.ok(meal.companionRecipeIds.includes("gurkensalat"));
    assert.equal(meal.balanceReason, "lighter_companion_for_hearty_main");
  });

  it("3 — unsafe companion is never selected", () => {
    const schnitzel = getDishById("wiener-schnitzel")!;
    // Gurkensalat has no dairy — use sumac-chicken + tabbouleh with Gluten allergy
    // Tabbouleh has Gluten
    const sumac = getDishById("sumac-chicken")!;
    const meal = composeMealForMain(
      sumac,
      { allergies: ["Gluten"], hostCuisineIds: ["arab"] },
      [],
    );
    assert.ok(!meal.companionRecipeIds.includes("tabbouleh"));
    assert.ok(!meal.companionRecipeIds.includes("fattoush"));
  });

  it("4 — random same-cuisine pairing is not enough", () => {
    const schnitzel = getDishById("wiener-schnitzel")!;
    const kartoffelsuppe = getDishById("kartoffelsuppe")!;
    // Same cuisine, but soup is dinner_complete / not curated companion
    assert.equal(isCompatibleCompanion(schnitzel, kartoffelsuppe), false);
    const mexicanRice = getDishById("mexican-rice")!;
    assert.equal(isCompatibleCompanion(schnitzel, mexicanRice), false);
  });

  it("5 — weekly meal composition survives refresh unchanged", () => {
    const now = atLocal(2026, 6, 15, 9);
    const a = buildDefaultWeekPlanDetailed(
      "en",
      ["central_european", "arab", "turkish"],
      [],
      undefined,
      { now },
    );
    const b = buildDefaultWeekPlanDetailed(
      "en",
      ["central_european", "arab", "turkish"],
      [],
      undefined,
      { now },
    );
    assert.deepEqual(
      a.plan.map((d) => d.meal.companionRecipeIds),
      b.plan.map((d) => d.meal.companionRecipeIds),
    );
  });

  it("6 — main + companion do not duplicate meal role unnecessarily", () => {
    const kabsa = getDishById("kabsa-chicken")!;
    const jeera = getDishById("jeera-rice")!;
    // Even if forced, grain+rice main is unnecessary — not curated for kabsa
    assert.equal(isCompatibleCompanion(kabsa, jeera), false);
    assert.deepEqual(CURATED_COMPANIONS["kabsa-chicken"], []);
  });

  it("7 — companion repetition is penalized across the week", () => {
    const now = atLocal(2026, 6, 14, 10);
    const { plan } = buildDefaultWeekPlanDetailed(
      "en",
      ["central_european", "arab", "turkish", "indian", "italian"],
      [],
      undefined,
      { now },
    );
    const companionCounts = new Map<string, number>();
    for (const day of plan) {
      for (const id of day.meal.companionRecipeIds) {
        companionCounts.set(id, (companionCounts.get(id) ?? 0) + 1);
      }
    }
    for (const [id, count] of companionCounts) {
      assert.ok(
        count <= 2,
        `companion ${id} repeated ${count} times across week`,
      );
    }
  });

  it("8 — Tonight displays today’s persisted meal composition", () => {
    const now = atLocal(2026, 6, 14, 11); // Tuesday
    const planStart = resolvePlanningStartDate(now, 17);
    const plan = [
      makeDay(planStart, 0, "wiener-schnitzel", ["gurkensalat"]),
      makeDay(planStart, 1, "mujaddara", []),
      makeDay(planStart, 2, "sumac-chicken", ["tabbouleh"]),
      makeDay(planStart, 3, "kofte", ["cacik"]),
      makeDay(planStart, 4, "pomodoro-pasta", []),
      makeDay(planStart, 5, "dal-tadka", []),
      makeDay(planStart, 6, "menemen", []),
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
    assert.equal(decision.primaryId, "wiener-schnitzel");
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
    assert.ok(meal?.companions?.some((c) => c.recipeId === "gurkensalat"));
  });

  it("9 — Cook Mode freezes main independently from companions", () => {
    const meal = buildMealRecommendation(
      "wiener-schnitzel",
      "en",
      { occasion: "household", guestPreferredCuisineIds: [] },
      { companionRecipeIds: ["gurkensalat"] },
    )!;
    const frozen = freezeCookSessionMeal(meal);
    assert.equal(frozen.recipeId, "wiener-schnitzel");
    assert.equal(mayMutateTonightMeal(true), false);
    // Companion metadata may exist on the snapshot, but Cook steps are the main's.
    assert.ok(frozen.steps.length > 0);
    assert.equal(frozen.recipeId, meal.recipeId);
    assert.notEqual(frozen.companions?.[0]?.recipeId, frozen.recipeId);
  });

  it("10 — sparse / uncurated main stays main-only (no fake pairing)", () => {
    const soup = getDishById("shorbat-adas")!;
    const meal = composeMealForMain(soup, {
      allergies: [],
      hostCuisineIds: ["arab"],
    });
    assert.deepEqual(meal.companionRecipeIds, []);
  });

  it("Tonight after cutoff does not force today’s removed slot", () => {
    const evening = atLocal(2026, 6, 14, 18);
    const { plan } = buildDefaultWeekPlanDetailed(
      "en",
      ["arab"],
      [],
      undefined,
      { now: evening },
    );
    assert.ok(!plan.some((d) => d.date === "2026-07-14"));
    const decision = resolveTonightDecision({
      context: { occasion: "household", guestPreferredCuisineIds: [] },
      weeklyPlan: plan,
      weeklyPlanningEnabled: true,
      hostCuisineIds: ["arab"],
      allergies: [],
      locale: "en",
      date: evening,
    });
    // Today (Tue) is not in Wed-start plan → not weekly-plan for tonight
    assert.notEqual(decision.source, "weekly-plan");
  });
});
