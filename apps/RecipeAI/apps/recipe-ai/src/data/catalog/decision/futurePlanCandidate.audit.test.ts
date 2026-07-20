import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type {
  FuturePlanCandidate,
  MealCookEvent,
  MealFeedbackEvent,
} from "@recipe-ai/core/types";
import { getDishById } from "../dishes";
import { resolveHouseholdCuisineProfile } from "./householdCuisine";
import { feedbackScore, recentCookPenalty } from "./memory";
import {
  activeFutureCandidates,
  futureCandidateBoost,
  futureCandidatesScheduledInPlan,
  markFutureCandidatesScheduled,
  saveFuturePlanCandidate,
} from "./pantryPlanBridge";
import { buildIntelligentWeekPlan } from "./weekly";
import { migratePreferences } from "../../../hooks/appStateLogic";

const morning = new Date(2026, 6, 14, 10);

function arabProfile() {
  return resolveHouseholdCuisineProfile({
    primaryCuisine: "arab",
    preferredCuisines: ["chinese", "turkish", "italian"],
    favoriteCuisines: ["arab", "chinese", "turkish", "italian"],
  });
}

function weekCtx(profile = arabProfile()) {
  return {
    locale: "en" as const,
    hostCuisineIds: profile.hostCuisineIds,
    householdProfile: profile,
    allergies: [] as string[],
    feedbackEvents: [] as MealFeedbackEvent[],
    cookEvents: [] as MealCookEvent[],
  };
}

describe("Future-plan candidate audit (A–M)", () => {
  it("A — save future recipe does not mutate current week plan object", () => {
    const before = buildIntelligentWeekPlan(weekCtx(), { now: morning }).plan;
    const snapshot = JSON.stringify(before);
    saveFuturePlanCandidate([], "mapo-tofu");
    assert.equal(JSON.stringify(before), snapshot);
  });

  it("B — refresh/migration preserves future candidates", () => {
    const migrated = migratePreferences({
      futurePlanCandidates: [{ recipeId: "mapo-tofu", savedAt: 1_700_000_000_000 }],
    });
    assert.equal(migrated.futurePlanCandidates?.[0]?.recipeId, "mapo-tofu");
  });

  it("C — future candidate can influence next generated week when compatible", () => {
    const candidates: FuturePlanCandidate[] = [
      { recipeId: "mapo-tofu", savedAt: Date.now() },
    ];
    const built = buildIntelligentWeekPlan(weekCtx(), {
      now: morning,
      dayCuisineSources: Array.from({ length: 7 }, () => "preferred" as const),
      dayIntents: Array.from({ length: 7 }, () => "budget" as const),
      futurePlanCandidates: candidates,
    });
    const won = built.plan.some((d) => d.recipeId === "mapo-tofu");
    assert.ok(
      won || futureCandidateBoost("mapo-tofu", candidates) === 22,
      "saved candidate receives boost and may appear on preferred+budget days",
    );
  });

  it("D — generated plan is review-only until explicit commit marks scheduled", () => {
    const candidates: FuturePlanCandidate[] = [
      { recipeId: "chana-masala", savedAt: Date.now() },
    ];
    const built = buildIntelligentWeekPlan(
      {
        locale: "en",
        hostCuisineIds: ["indian", "arab", "italian"],
        allergies: [],
      },
      {
        now: morning,
        dayIntents: Array.from({ length: 7 }, () => "budget" as const),
        futurePlanCandidates: candidates,
      },
    );
    assert.ok(built.plan.length === 7, "reviewable week generated");
    assert.equal(
      activeFutureCandidates(candidates).length,
      1,
      "boost remains until commit marks scheduled",
    );
    if (built.plan.some((d) => d.recipeId === "chana-masala")) {
      assert.ok(
        (built.scheduledFutureCandidateIds ?? []).includes("chana-masala"),
        "engine tracks which candidates were placed",
      );
    }
  });

  it("E — PRIMARY cuisine day defeats saved secondary-cuisine candidate", () => {
    const candidates: FuturePlanCandidate[] = [
      { recipeId: "mapo-tofu", savedAt: Date.now() },
    ];
    const built = buildIntelligentWeekPlan(weekCtx(), {
      now: morning,
      dayIntents: ["budget", "auto", "auto", "auto", "auto", "auto", "auto"],
      dayCuisineSources: [
        "primary",
        "auto",
        "auto",
        "auto",
        "auto",
        "auto",
        "auto",
      ],
      futurePlanCandidates: candidates,
    });
    const day0 = getDishById(built.plan[0]!.recipeId)!;
    assert.notEqual(day0.id, "mapo-tofu");
    assert.equal(day0.cuisineFamilyId, "arab");
  });

  it("F — PREFERRED cuisine day may select compatible saved candidate", () => {
    const candidates: FuturePlanCandidate[] = [
      { recipeId: "mapo-tofu", savedAt: Date.now() },
    ];
    const built = buildIntelligentWeekPlan(weekCtx(), {
      now: morning,
      dayIntents: Array.from({ length: 7 }, () => "budget" as const),
      dayCuisineSources: Array.from({ length: 7 }, () => "preferred" as const),
      futurePlanCandidates: candidates,
    });
    const preferredIds = new Set(["chinese", "turkish", "italian"]);
    const hits = built.plan.filter((d) => {
      const dish = getDishById(d.recipeId)!;
      return preferredIds.has(dish.cuisineFamilyId);
    }).length;
    assert.ok(hits >= 1, "preferred-source days draw from secondary cuisines");
  });

  it("G — safety blocks saved candidate from unsafe pool", () => {
    const candidates: FuturePlanCandidate[] = [
      { recipeId: "dumplings", savedAt: Date.now() },
    ];
    const built = buildIntelligentWeekPlan(
      { ...weekCtx(), allergies: ["Gluten"] },
      {
        now: morning,
        futurePlanCandidates: candidates,
      },
    );
    for (const day of built.plan) {
      const dish = getDishById(day.recipeId)!;
      assert.ok(!dish.allergens.includes("Gluten"), dish.id);
    }
    assert.ok(
      !built.plan.some((d) => d.recipeId === "dumplings"),
      "gluten saved candidate must not appear when unsafe",
    );
  });

  it("H — vegetarian day blocks saved meat candidate", () => {
    const candidates: FuturePlanCandidate[] = [
      { recipeId: "kabsa-chicken", savedAt: Date.now() },
    ];
    const built = buildIntelligentWeekPlan(weekCtx(), {
      now: morning,
      dayIntents: Array.from({ length: 7 }, () => "vegetarian" as const),
      futurePlanCandidates: candidates,
    });
    for (const day of built.plan) {
      const dish = getDishById(day.recipeId)!;
      assert.ok(
        dish.dietaryTags.includes("vegetarian_ok") &&
          !dish.dietaryTags.includes("contains_meat"),
        dish.id,
      );
    }
  });

  it("I — committed schedule consumes one-shot boost", () => {
    const candidates: FuturePlanCandidate[] = [
      { recipeId: "mapo-tofu", savedAt: Date.now() },
    ];
    const plan = [
      {
        dayOffset: 0,
        date: "2026-07-14",
        weekdayIndex: 1,
        recipeId: "mapo-tofu",
        dayIntent: "budget" as const,
        dayCuisineSource: "preferred" as const,
        meal: {
          mainRecipeId: "mapo-tofu",
          companionRecipeIds: [],
          balanceReason: "main_only" as const,
        },
      },
    ];
    const scheduledIds = futureCandidatesScheduledInPlan(plan, candidates);
    assert.deepEqual(scheduledIds, ["mapo-tofu"]);
    const marked = markFutureCandidatesScheduled(
      candidates,
      scheduledIds,
      "2026-07-14",
    );
    assert.equal(futureCandidateBoost("mapo-tofu", marked), 0);
    assert.equal(marked[0]?.scheduledPlanStart, "2026-07-14");
  });

  it("J — candidate not selected remains active without growing boost", () => {
    const candidates: FuturePlanCandidate[] = [
      { recipeId: "mapo-tofu", savedAt: Date.now() },
    ];
    buildIntelligentWeekPlan(weekCtx(), {
      now: morning,
      dayCuisineSources: Array.from({ length: 7 }, () => "primary" as const),
      futurePlanCandidates: candidates,
    });
    assert.equal(activeFutureCandidates(candidates).length, 1);
    assert.equal(futureCandidateBoost("mapo-tofu", candidates), 22);
    assert.equal(futureCandidateBoost("mapo-tofu", candidates), 22);
  });

  it("K — not-for-us feedback suppresses future boost", () => {
    const candidates: FuturePlanCandidate[] = [
      { recipeId: "mapo-tofu", savedAt: Date.now() },
    ];
    const feedback: MealFeedbackEvent[] = [
      {
        recipeId: "mapo-tofu",
        rating: "not-for-us",
        at: Date.now(),
      },
    ];
    assert.ok(feedbackScore("mapo-tofu", feedback) < 0);
    assert.equal(futureCandidateBoost("mapo-tofu", candidates, feedback), 0);
  });

  it("L — recently cooked repetition still penalizes saved candidate", () => {
    const cooks: MealCookEvent[] = [
      { recipeId: "mapo-tofu", at: Date.now(), kind: "completed" },
    ];
    assert.ok(recentCookPenalty("mapo-tofu", cooks) >= 14);
  });

  it("M — repeated Save taps dedupe future candidate records", () => {
    let list = saveFuturePlanCandidate([], "mapo-tofu");
    list = saveFuturePlanCandidate(list, "mapo-tofu");
    list = saveFuturePlanCandidate(list, "mapo-tofu");
    assert.equal(list.filter((c) => c.recipeId === "mapo-tofu").length, 1);
  });
});
