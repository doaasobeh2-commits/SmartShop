import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { CuisineFamilyId } from "@recipe-ai/core/types";
import { getDishById, listAllDishes } from "../dishes";
import { matchDishesByIngredients } from "../matchIngredients";
import {
  buildDefaultWeekPlanDetailed,
  resolveTonightDecision,
  selectTonightCandidates,
} from "../resolveMeal";
import { candidateUniverse, resolvePolicy } from "./policy";
import { applyHardSafety } from "./safety";
import { rankCandidates, scoreCandidate } from "./score";
import { resolveDecision } from "./resolveDecision";
import type { DecisionContext } from "./types";

const arabHost: CuisineFamilyId[] = ["arab"];

function baseUs(overrides: Partial<DecisionContext> = {}): DecisionContext {
  return {
    locale: "en",
    tonight: { occasion: "household", guestPreferredCuisineIds: [] },
    hostCuisineIds: arabHost,
    allergies: [],
    weeklyPlanningEnabled: false,
    weeklyPlan: [],
    ...overrides,
  };
}

describe("Decision Engine V1 — scenarios A–J", () => {
  it("A — SAFETY: allergy conflict eliminates before ranking", () => {
    const glutenDish = listAllDishes().find((d) =>
      d.allergens.includes("Gluten"),
    );
    assert.ok(glutenDish, "catalog needs a gluten dish");

    const safe = applyHardSafety(listAllDishes(), {
      allergies: ["Gluten"],
    });
    assert.ok(!safe.some((d) => d.id === glutenDish.id));

    const decision = resolveDecision(
      baseUs({
        allergies: ["Gluten"],
        hostCuisineIds: [glutenDish.cuisineFamilyId],
      }),
    );
    for (const id of decision.candidateIds) {
      assert.ok(!getDishById(id)?.allergens.includes("Gluten"));
    }

    // Positive host affinity must never resurrect an allergen dish
    const scored = scoreCandidate(glutenDish, "US_WITHOUT_PLAN", baseUs());
    assert.ok(scored.score > 0);
    assert.ok(
      !decision.candidateIds.includes(glutenDish.id),
      "unsafe dish must not appear in decision output",
    );
  });

  it("B — WEEKLY PLAN → TONIGHT: safe planned dinner-complete dish is primary", () => {
    const monday = new Date(2026, 6, 20); // Mon
    const ids = [
      "mujaddara",
      "shorbat-adas",
      "sumac-chicken",
      "kabsa-chicken",
      "kofte",
      "menemen",
      "dal-tadka",
    ] as const;
    const plan = ids.map((recipeId, dayOffset) => {
      const date = new Date(2026, 6, 20 + dayOffset);
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return {
        dayOffset,
        date: `${y}-${m}-${d}`,
        weekdayIndex: (date.getDay() + 6) % 7,
        recipeId,
        dayIntent: "auto" as const,
        meal: { mainRecipeId: recipeId, companionRecipeIds: [] as string[] },
      };
    });
    const decision = resolveTonightDecision({
      context: { occasion: "household", guestPreferredCuisineIds: [] },
      weeklyPlan: plan,
      weeklyPlanningEnabled: true,
      hostCuisineIds: arabHost,
      allergies: [],
      locale: "en",
      date: monday,
    });
    assert.equal(decision.policy, "US_WITH_WEEKLY_PLAN");
    assert.equal(decision.source, "weekly-plan");
    assert.equal(decision.primaryId, "mujaddara");
    assert.equal(decision.candidateIds[0], "mujaddara");
    assert.ok(decision.reasonCodes.includes("FROM_WEEKLY_PLAN"));
  });

  it("C — WEEKLY DIVERSITY: avoids obvious dish/category repetition", () => {
    const { plan, roles } = buildDefaultWeekPlanDetailed(
      "en",
      ["arab", "italian"],
      [],
    );
    assert.equal(plan.length, 7);
    assert.equal(roles.length, 7);
    const ids = plan.map((d) => d.recipeId);
    assert.ok(new Set(ids).size >= 5, `unique dishes: ${new Set(ids).size}`);

    const mealTypes = ids.map(
      (id) => getDishById(id)?.mealTypes[0] ?? "unknown",
    );
    const typeCounts = mealTypes.reduce<Record<string, number>>((acc, t) => {
      acc[t] = (acc[t] ?? 0) + 1;
      return acc;
    }, {});
    const maxType = Math.max(...Object.values(typeCounts));
    assert.ok(
      maxType <= 5,
      `dominant meal type repeated too often: ${JSON.stringify(typeCounts)}`,
    );
  });

  it("D — PANTRY: chicken + rosemary beats Caprese", () => {
    // Garlic Rosemary Chicken no longer lists potato after corrected-catalog reconcile.
    const result = matchDishesByIngredients(
      "Chicken garlic rosemary lemon, 3 persons",
      [],
      "en",
      5,
    );
    assert.equal(result.noStrongMatch, false);
    assert.ok(result.recipeIds.includes("garlic-rosemary-chicken"));
    assert.ok(!result.recipeIds.includes("caprese"));
    assert.equal(result.recipeIds[0], "garlic-rosemary-chicken");
  });

  it("E — GUEST EASY: explicit cuisine influences ranking (not host-only)", () => {
    const decision = resolveDecision({
      locale: "en",
      tonight: {
        occasion: "guests",
        intent: "familiar",
        guestPrimaryCuisineId: "arab",
        guestPreferredCuisineIds: [],
      },
      hostCuisineIds: ["central_european"],
      allergies: [],
      weeklyPlanningEnabled: false,
      weeklyPlan: [],
    });
    assert.ok(decision.candidateIds.length >= 1);
    const cuisines = decision.candidateIds.map(
      (id) => getDishById(id)?.cuisineFamilyId,
    );
    const hasGuestAware =
      cuisines.includes("arab") ||
      decision.reasonCodes.includes("GUEST_FAMILIAR");
    assert.ok(
      hasGuestAware,
      "CE host + Arab guest must be guest-aware when catalog allows",
    );
    for (const id of decision.candidateIds) {
      const dish = getDishById(id);
      assert.equal(dish?.difficulty, "easy");
      assert.ok((dish?.prepMinutes ?? 99) <= 50);
      assert.equal(dish?.mealSlotRole, "dinner_complete");
    }
  });

  it("F — GUEST MIXED: primary + optional cuisine does not premature no-match", () => {
    const decision = resolveDecision({
      locale: "en",
      tonight: {
        occasion: "guests",
        intent: "surprise",
        guestPrimaryCuisineId: "turkish",
        guestPreferredCuisineIds: ["italian"],
      },
      hostCuisineIds: ["mexican"],
      allergies: [],
      weeklyPlanningEnabled: false,
      weeklyPlan: [],
    });
    assert.ok(
      decision.candidateIds.length >= 1,
      "must return sensible candidates",
    );
    for (const id of decision.candidateIds) {
      const cuisine = getDishById(id)?.cuisineFamilyId;
      assert.ok(
        cuisine === "turkish" || cuisine === "italian",
        `unexpected cuisine ${cuisine}`,
      );
    }
    // Primary should dominate first pick when available
    assert.equal(
      getDishById(decision.candidateIds[0]!)?.cuisineFamilyId,
      "turkish",
    );
  });

  it("G — SURPRISE: controlled guest novelty, not random", () => {
    const a = selectTonightCandidates({
      locale: "en",
      hostCuisineIds: ["mexican"],
      occasion: "guests",
      intent: "surprise",
      guestPrimaryCuisineId: "central_european",
      guestPreferredCuisineIds: [],
    });
    const b = selectTonightCandidates({
      locale: "en",
      hostCuisineIds: ["mexican"],
      occasion: "guests",
      intent: "surprise",
      guestPrimaryCuisineId: "central_european",
      guestPreferredCuisineIds: [],
    });
    assert.deepEqual(a, b, "surprise must be deterministic");
    assert.ok(a.length >= 1);
    for (const id of a) {
      assert.equal(getDishById(id)?.cuisineFamilyId, "central_european");
    }
    assert.notEqual(
      resolvePolicy({
        locale: "en",
        tonight: {
          occasion: "guests",
          intent: "surprise",
          guestPrimaryCuisineId: "central_european",
          guestPreferredCuisineIds: [],
        },
        hostCuisineIds: ["mexican"],
        allergies: [],
        weeklyPlanningEnabled: false,
        weeklyPlan: [],
      }),
      "US_WITHOUT_PLAN",
    );
  });

  it("H — SOMEONE SPECIAL without cuisine still recommends", () => {
    const decision = resolveDecision({
      locale: "en",
      tonight: {
        occasion: "friend",
        intent: "special",
        guestPreferredCuisineIds: [],
      },
      hostCuisineIds: ["italian"],
      allergies: [],
      weeklyPlanningEnabled: false,
      weeklyPlan: [],
    });
    assert.equal(decision.policy, "SOMEONE_SPECIAL");
    assert.ok(decision.candidateIds.length >= 1);
    assert.ok(decision.primaryId);
    assert.ok(
      decision.reasonCodes.includes("SOMEONE_SPECIAL") ||
        decision.reasonCodes.includes("FAMILY_FAMILIAR"),
    );
  });

  it("I — REPETITION: recently cooked loses to comparable fresh option", () => {
    const now = Date.now();
    const ctx = baseUs({
      hostCuisineIds: ["italian"],
      cookEvents: [
        {
          recipeId: "pomodoro-pasta",
          at: now - 60 * 60 * 1000,
          kind: "completed",
        },
      ],
    });
    const safe = applyHardSafety(listAllDishes(), ctx);
    const italian = safe.filter(
      (d) =>
        d.cuisineFamilyId === "italian" && d.mealSlotRole === "dinner_complete",
    );
    const ranked = rankCandidates(italian, "US_WITHOUT_PLAN", ctx, {
      limit: 5,
    });
    assert.ok(ranked.length >= 2);
    assert.notEqual(ranked[0]?.dish.id, "pomodoro-pasta");
  });

  it("J — DISCOVERY: cuisine prefs are not a hard prison", () => {
    const ctx = baseUs({ hostCuisineIds: ["arab"] });
    const safe = applyHardSafety(listAllDishes(), ctx);
    const universe = candidateUniverse("US_WITHOUT_PLAN", safe, ctx);
    assert.ok(
      universe.some((d) => d.cuisineFamilyId !== "arab"),
      "Us universe must include outside-cuisine candidates",
    );

    const outside = universe.find(
      (d) =>
        d.cuisineFamilyId !== "arab" &&
        d.difficulty === "easy" &&
        d.prepMinutes <= 45,
    );
    assert.ok(outside);
    const scored = scoreCandidate(outside, "US_WITHOUT_PLAN", ctx, {
      dayRole: "controlled_discovery",
    });
    assert.ok(
      scored.reasonCodes.includes("CONTROLLED_DISCOVERY") ||
        scored.signals.discovery,
      "discovery-eligible outside dish can earn discovery signal",
    );
  });
});
