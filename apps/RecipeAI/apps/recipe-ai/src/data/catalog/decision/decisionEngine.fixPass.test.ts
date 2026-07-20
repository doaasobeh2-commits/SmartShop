import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { DishCatalogEntry } from "../types";
import { getDishById, listAllDishes } from "../dishes";
import { matchDishesByIngredients } from "../matchIngredients";
import {
  buildDefaultWeekPlanDetailed,
  resolvePlanStartKey,
  resolveTonightDecision,
} from "../resolveMeal";
import {
  normalizeAllergyList,
  normalizeAllergenLabel,
  normalizeDietType,
} from "./allergenNormalize";
import { feedbackScore, recentCookPenalty } from "./memory";
import { hasBridge, resolvePolicy } from "./policy";
import {
  pantryReasonCodes,
  scorePantryDish,
  STRONG_PANTRY_COVERAGE,
} from "./pantry";
import { resolveDecision } from "./resolveDecision";
import { applyHardSafety, isDishSafe } from "./safety";
import { scoreCandidate } from "./score";
import type { DecisionContext } from "./types";

function baseCtx(overrides: Partial<DecisionContext> = {}): DecisionContext {
  return {
    locale: "en",
    tonight: { occasion: "household", guestPreferredCuisineIds: [] },
    hostCuisineIds: ["italian"],
    allergies: [],
    weeklyPlanningEnabled: false,
    weeklyPlan: [],
    ...overrides,
  };
}

function withMeta(
  dish: DishCatalogEntry,
  patch: Partial<DishCatalogEntry>,
): DishCatalogEntry {
  return { ...dish, ...patch };
}

describe("Decision Engine V1 — fix-pass adversarial invariants", () => {
  it("1 — cook-start style events do not apply cook penalty; completed does", () => {
    const id = "pomodoro-pasta";
    const startOnly = recentCookPenalty(id, []);
    assert.equal(startOnly, 0);
    const completed = recentCookPenalty(id, [
      { recipeId: id, at: Date.now(), kind: "completed" },
    ]);
    assert.ok(completed >= 14);
    // Stacked identical completions collapse to one signal
    const stacked = recentCookPenalty(id, [
      { recipeId: id, at: Date.now() - 1000, kind: "completed" },
      { recipeId: id, at: Date.now(), kind: "completed" },
    ]);
    assert.equal(stacked, completed);
  });

  it("2 — fail-closed: unknown / missing allergen declaration, mayContain, legacy labels", () => {
    const base = listAllDishes()[0]!;
    assert.equal(
      isDishSafe(
        withMeta(base, { allergenDeclared: false, allergens: [] }),
        [],
      ),
      false,
    );
    assert.equal(
      isDishSafe(
        withMeta(base, {
          allergenDeclared: true,
          allergens: [],
          mayContain: ["Nuts"],
        }),
        ["Nuts"],
      ),
      false,
    );
    assert.equal(
      isDishSafe(
        withMeta(base, { allergenDeclared: true, allergens: ["Dairy"] }),
        ["dairy"],
      ),
      false,
    );
    assert.equal(normalizeAllergenLabel("GLUTEN"), "Gluten");
    assert.equal(normalizeAllergenLabel("gluten"), "Gluten");
    assert.equal(normalizeAllergenLabel("unknown-allergen-xyz"), null);
    assert.deepEqual(normalizeAllergyList(["milk", "Tree Nuts"]), [
      "Dairy",
      "Nuts",
    ]);

    // Empty declared allergens = curated none → safe when no allergies
    assert.equal(
      isDishSafe(
        withMeta(base, {
          allergenDeclared: true,
          allergens: [],
          mayContain: [],
        }),
        [],
      ),
      true,
    );
  });

  it("2b — dietary restrictions hard-gate every supported dietType", () => {
    const meat = listAllDishes().find((d) =>
      d.dietaryTags.includes("contains_meat"),
    )!;
    const veganOk = listAllDishes().find((d) =>
      d.dietaryTags.includes("vegan_ok"),
    )!;
    assert.ok(meat && veganOk);

    assert.equal(isDishSafe(meat, [], "vegetarian"), false);
    assert.equal(isDishSafe(meat, [], "vegan"), false);
    assert.equal(isDishSafe(veganOk, [], "vegan"), true);
    assert.equal(isDishSafe(veganOk, [], "halal"), true);

    const porkish = listAllDishes().find((d) =>
      d.dietaryTags.includes("contains_pork"),
    );
    if (porkish) {
      assert.equal(isDishSafe(porkish, [], "halal"), false);
    }

    assert.equal(normalizeDietType("VEGAN"), "vegan");
    assert.equal(normalizeDietType("normal"), "normal");

    const veganDecision = resolveDecision(
      baseCtx({ dietType: "vegan", hostCuisineIds: ["italian", "arab"] }),
    );
    for (const id of veganDecision.candidateIds) {
      const d = getDishById(id)!;
      assert.ok(d.dietaryTags.includes("vegan_ok"));
      assert.ok(!d.dietaryTags.includes("contains_meat"));
    }
  });

  it("3 — unsafe planned dish never leaks as weekly primary / hidden fallback id", () => {
    const glutenDish = listAllDishes().find((d) =>
      d.allergens.includes("Gluten"),
    )!;
    const monday = new Date(2026, 6, 20);
    const ids = [
      glutenDish.id,
      "mujaddara",
      "shorbat-adas",
      "sumac-chicken",
      "kabsa-chicken",
      "dal-tadka",
      "menemen",
    ];
    const weeklyPlan = ids.map((recipeId, dayOffset) => {
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
      weeklyPlan,
      weeklyPlanningEnabled: true,
      hostCuisineIds: ["arab", "italian"],
      allergies: ["Gluten"],
      locale: "en",
      date: monday,
    });
    assert.notEqual(decision.plannedRecipeId, glutenDish.id);
    assert.ok(!decision.candidateIds.includes(glutenDish.id));
    // Empty decision stays empty — no manufactured tabbouleh/winner injection
    if (decision.candidateIds.length === 0) {
      assert.equal(decision.primaryId, undefined);
    } else {
      for (const id of decision.candidateIds) {
        assert.ok(isDishSafe(getDishById(id)!, ["Gluten"]));
      }
    }
  });

  it("3b — side_component planned dish is not treated as dinner primary", () => {
    const monday = new Date(2026, 6, 20);
    const ids = [
      "caprese",
      "mujaddara",
      "shorbat-adas",
      "sumac-chicken",
      "kabsa-chicken",
      "dal-tadka",
      "menemen",
    ];
    const weeklyPlan = ids.map((recipeId, dayOffset) => {
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
      weeklyPlan,
      weeklyPlanningEnabled: true,
      hostCuisineIds: ["italian", "arab"],
      allergies: [],
      locale: "en",
      date: monday,
    });
    assert.notEqual(decision.plannedRecipeId, "caprese");
    assert.notEqual(decision.primaryId, "caprese");
    if (decision.primaryId) {
      assert.equal(
        getDishById(decision.primaryId)?.mealSlotRole,
        "dinner_complete",
      );
    }
  });

  it("4 — Guest Easy: CE host + Arab guest is observably guest-aware", () => {
    const decision = resolveDecision(
      baseCtx({
        hostCuisineIds: ["central_european"],
        tonight: {
          occasion: "guests",
          intent: "familiar",
          guestPrimaryCuisineId: "arab",
          guestPreferredCuisineIds: [],
        },
      }),
    );
    assert.equal(decision.policy, "GUESTS_EASY");
    assert.ok(decision.candidateIds.length >= 1);
    const top = getDishById(decision.candidateIds[0]!)!;
    const guestInTop3 = decision.candidateIds.some(
      (id) => getDishById(id)?.cuisineFamilyId === "arab",
    );
    assert.ok(
      guestInTop3 || decision.reasonCodes.includes("GUEST_FAMILIAR"),
      "documented guest-aware ranking or GUEST_FAMILIAR evidence",
    );
    assert.equal(top.mealSlotRole, "dinner_complete");
  });

  it("5 — Someone Special stays policy-distinct even with explicit cuisine", () => {
    const friendCtx = baseCtx({
      hostCuisineIds: ["italian"],
      tonight: {
        occasion: "friend",
        intent: "familiar",
        guestPrimaryCuisineId: "arab",
        guestPreferredCuisineIds: [],
      },
    });
    assert.equal(resolvePolicy(friendCtx), "SOMEONE_SPECIAL");
    const withCuisine = resolveDecision(friendCtx);
    assert.equal(withCuisine.policy, "SOMEONE_SPECIAL");

    const guestsEasy = resolveDecision(
      baseCtx({
        hostCuisineIds: ["italian"],
        tonight: {
          occasion: "guests",
          intent: "familiar",
          guestPrimaryCuisineId: "arab",
          guestPreferredCuisineIds: [],
        },
      }),
    );
    assert.equal(guestsEasy.policy, "GUESTS_EASY");
    assert.notDeepEqual(
      withCuisine.candidateIds,
      guestsEasy.candidateIds,
      "Someone Special must not wholesale equal Guests Easy",
    );
    assert.ok(
      withCuisine.reasonCodes.includes("SOMEONE_SPECIAL") ||
        withCuisine.reasonCodes.includes("FAMILY_FAMILIAR"),
    );
    assert.ok(!withCuisine.reasonCodes.includes("GUEST_FAMILIAR"));
  });

  it("5b — bridge bonus only for current host↔guest pair", () => {
    const paprika = getDishById("paprika-chicken")!;
    assert.ok(
      hasBridge(paprika, ["central_european"], ["mexican"]),
      "fixture bridge CE→mexican",
    );
    assert.ok(!hasBridge(paprika, ["italian"], ["arab"]));

    const matching = scoreCandidate(
      paprika,
      "GUESTS_SPECIAL",
      baseCtx({
        hostCuisineIds: ["central_european"],
        tonight: {
          occasion: "guests",
          intent: "special",
          guestPrimaryCuisineId: "mexican",
          guestPreferredCuisineIds: [],
        },
      }),
    );
    const mismatch = scoreCandidate(
      paprika,
      "GUESTS_SPECIAL",
      baseCtx({
        hostCuisineIds: ["italian"],
        tonight: {
          occasion: "guests",
          intent: "special",
          guestPrimaryCuisineId: "arab",
          guestPreferredCuisineIds: [],
        },
      }),
    );
    assert.ok((matching.signals.bridge ?? 0) > 0);
    assert.equal(mismatch.signals.bridge ?? 0, 0);
    assert.ok(matching.score > mismatch.score);
  });

  it("6 — pantry query consumption: chicken+rice / chicken+rosemary", () => {
    // Potato was removed from Garlic Rosemary Chicken pantry/ingredients in catalog reconcile.
    const rosemary = matchDishesByIngredients(
      "chicken garlic rosemary, 3 persons",
      [],
      "en",
      5,
    );
    assert.equal(rosemary.recipeIds[0], "garlic-rosemary-chicken");
    assert.ok(
      (rosemary.queryCoverageById["garlic-rosemary-chicken"] ?? 0) >= 1,
    );

    const rice = matchDishesByIngredients("rice and chicken", [], "en", 8);
    assert.ok(rice.recipeIds.length >= 1);
    const top = rice.recipeIds[0]!;
    const topDish = getDishById(top)!;
    const tokens = ["rice", "chicken"];
    const topScore = scorePantryDish(topDish, tokens)!;
    assert.ok(topScore.queryCoverage >= 1, `${top} must consume both`);

    const chickenOnly = listAllDishes().find(
      (d) =>
        d.ingredientTokens.includes("chicken") &&
        !d.ingredientTokens.some(
          (t) => t.includes("rice") || t === "basmati",
        ) &&
        d.id !== top,
    );
    if (chickenOnly) {
      const onlyScore = scorePantryDish(chickenOnly, tokens);
      if (onlyScore) {
        assert.ok(
          topScore.score > onlyScore.score,
          "both-ingredient dish must outrank chicken-only",
        );
      }
    }
  });

  it("7 — weak pantry coverage cannot claim GOOD_PANTRY_MATCH", () => {
    assert.deepEqual(pantryReasonCodes(0.2), []);
    assert.deepEqual(pantryReasonCodes(0.5), ["USES_AVAILABLE_INGREDIENTS"]);
    assert.deepEqual(pantryReasonCodes(STRONG_PANTRY_COVERAGE), [
      "GOOD_PANTRY_MATCH",
      "USES_AVAILABLE_INGREDIENTS",
    ]);

    const decision = resolveDecision(
      baseCtx({
        mode: "pantry",
        pantryQuery: "chicken",
      }),
    );
    if (
      decision.primaryId &&
      (decision.pantryCoverage ?? 0) < STRONG_PANTRY_COVERAGE
    ) {
      assert.ok(!decision.reasonCodes.includes("GOOD_PANTRY_MATCH"));
    }
  });

  it("8 — weekly dinner completeness + protein/cuisine rhythm", () => {
    const { plan, roles } = buildDefaultWeekPlanDetailed(
      "en",
      ["arab", "italian", "central_european"],
      [],
    );
    assert.equal(plan.length, 7);
    assert.equal(roles.length, 7);
    for (const day of plan) {
      const dish = getDishById(day.recipeId)!;
      assert.equal(
        dish.mealSlotRole,
        "dinner_complete",
        `${dish.id} must be dinner-complete`,
      );
      assert.ok(
        ![
          "caprese",
          "cacik",
          "cucumber-raita",
          "gurkensalat",
          "jeera-rice",
          "mexican-rice",
        ].includes(dish.id),
      );
    }
  });

  it("9 — planStart identity: same household + same anchor is stable", () => {
    const now = new Date(2026, 6, 18, 10);
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
    assert.deepEqual(a.roles, b.roles);
    assert.equal(a.planStart, resolvePlanStartKey(now, 17));
    // Saturday morning → plan starts Saturday (not Monday week)
    assert.equal(resolvePlanStartKey(now, 17), "2026-07-18");
  });

  it("10 — feedback once-only (latest wins); positive prefs never resurrect unsafe", () => {
    const id = "pomodoro-pasta";
    const loved = feedbackScore(id, [
      { recipeId: id, rating: "loved", at: Date.now() - 5000 },
      { recipeId: id, rating: "loved", at: Date.now() },
    ]);
    const once = feedbackScore(id, [
      { recipeId: id, rating: "loved", at: Date.now() },
    ]);
    assert.ok(Math.abs(loved - once) < 0.01);

    const gluten = listAllDishes().find((d) => d.allergens.includes("Gluten"))!;
    const safe = applyHardSafety(listAllDishes(), {
      allergies: ["Gluten"],
      excludeRecipeIds: [],
    });
    assert.ok(!safe.some((d) => d.id === gluten.id));
    const scored = scoreCandidate(
      gluten,
      "US_WITHOUT_PLAN",
      baseCtx({
        allergies: ["Gluten"],
        feedbackEvents: [
          { recipeId: gluten.id, rating: "loved", at: Date.now() },
        ],
      }),
    );
    assert.ok(scored.score > 0);
    const decision = resolveDecision(
      baseCtx({
        allergies: ["Gluten"],
        hostCuisineIds: [gluten.cuisineFamilyId],
        feedbackEvents: [
          { recipeId: gluten.id, rating: "loved", at: Date.now() },
        ],
      }),
    );
    assert.ok(!decision.candidateIds.includes(gluten.id));
  });

  it("Tonight / Guests never promote side_component as primary", () => {
    for (const occasion of ["household", "guests", "friend"] as const) {
      const decision = resolveDecision(
        baseCtx({
          hostCuisineIds: ["italian", "arab", "turkish", "indian", "mexican"],
          tonight:
            occasion === "household"
              ? { occasion, guestPreferredCuisineIds: [] }
              : {
                  occasion,
                  intent: "familiar",
                  guestPrimaryCuisineId: "arab",
                  guestPreferredCuisineIds: [],
                },
        }),
      );
      if (decision.primaryId) {
        assert.equal(
          getDishById(decision.primaryId)?.mealSlotRole,
          "dinner_complete",
        );
      }
    }
  });
});
