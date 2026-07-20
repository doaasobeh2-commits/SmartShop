import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { CuisineFamilyId } from "@recipe-ai/core/types";
import { DISH_CATALOG, getDishById } from "./dishes";
import { matchDishesByIngredients } from "./matchIngredients";
import {
  buildDefaultWeekPlan,
  buildMealRecommendation,
  resolveTonightDecision,
  selectTonightCandidates,
} from "./resolveMeal";
import { composeMealForMain, isCompatibleCompanion } from "./decision";
import { freezeCookSessionMeal } from "../../hooks/cookSession";
import {
  INSPECTED_CORRECT_RECIPE_IMAGE_IDS,
  NEEDS_PHOTO_PLACEHOLDER_PATH,
} from "./imageAssets";

describe("catalog resolveMeal", () => {
  it("builds localized meal with dish-specific image", () => {
    const meal = buildMealRecommendation("tabbouleh", "ar", {
      occasion: "household",
      guestPreferredCuisineIds: [],
    });
    assert.ok(meal);
    assert.equal(meal.recipeId, "tabbouleh");
    assert.match(meal.imageUrl, /\/assets\/dishes\/arab\/tabbouleh\.jpg$/);
    assert.equal(meal.ingredients[0]?.name, "بقدونس");
    assert.match(meal.steps[0]?.instruction ?? "", /برغل/);
  });

  it("uses guest reason copy without nationality inference", () => {
    const meal = buildMealRecommendation("tabbouleh", "en", {
      occasion: "guests",
      intent: "special",
      guestPrimaryCuisineId: "arab",
      guestPreferredCuisineIds: [],
    });
    assert.ok(meal?.reason.toLowerCase().includes("guest"));
    assert.doesNotMatch(
      meal?.reason ?? "",
      /national|Austrian|Mexican|ethnicity/i,
    );
  });

  it("Tonight uses today’s weekly planned meal when available", () => {
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
    // Monday 2026-07-20
    const monday = new Date(2026, 6, 20);
    const decision = resolveTonightDecision({
      context: { occasion: "household", guestPreferredCuisineIds: [] },
      weeklyPlan: plan,
      weeklyPlanningEnabled: true,
      hostCuisineIds: ["arab"],
      allergies: [],
      locale: "en",
      date: monday,
    });
    assert.equal(decision.source, "weekly-plan");
    assert.equal(decision.plannedRecipeId, "mujaddara");
    assert.equal(decision.candidateIds[0], "mujaddara");
  });

  it("Easy & familiar is guest-aware for CE host + Arab guest", () => {
    const ids = selectTonightCandidates({
      locale: "en",
      hostCuisineIds: ["central_european"],
      occasion: "guests",
      intent: "familiar",
      guestPrimaryCuisineId: "arab",
      guestPreferredCuisineIds: [],
    });
    assert.ok(ids.length >= 1);
    assert.ok(ids.length <= 3);
    const cuisines = new Set(ids.map((id) => getDishById(id)?.cuisineFamilyId));
    assert.ok(
      cuisines.has("arab") || cuisines.has("central_european"),
      "must return host and/or explicit guest cuisine dishes",
    );
    for (const id of ids) {
      const dish = getDishById(id);
      assert.equal(dish?.difficulty, "easy");
      assert.equal(dish?.mealSlotRole, "dinner_complete");
    }
  });

  it("Something special uses bridge when present, else host special fallback", () => {
    const bridged = selectTonightCandidates({
      locale: "en",
      hostCuisineIds: ["mexican"],
      occasion: "guests",
      intent: "special",
      guestPrimaryCuisineId: "central_european",
      guestPreferredCuisineIds: [],
    });
    assert.ok(bridged.includes("paprika-chicken"));

    const fallback = selectTonightCandidates({
      locale: "en",
      hostCuisineIds: ["chinese"],
      occasion: "guests",
      intent: "special",
      guestPrimaryCuisineId: "indian",
      guestPreferredCuisineIds: [],
    });
    assert.ok(fallback.length >= 1);
    for (const id of fallback) {
      assert.equal(getDishById(id)?.cuisineFamilyId, "chinese");
    }
  });

  it("Surprise them returns guest-cuisine dishes only", () => {
    const ids = selectTonightCandidates({
      locale: "en",
      hostCuisineIds: ["mexican"],
      occasion: "guests",
      intent: "surprise",
      guestPrimaryCuisineId: "central_european",
      guestPreferredCuisineIds: [],
    });
    assert.ok(ids.length >= 1);
    for (const id of ids) {
      assert.equal(getDishById(id)?.cuisineFamilyId, "central_european");
    }
  });

  it("Guests returns up to 3 ranked eligible choices simultaneously", () => {
    const ids = selectTonightCandidates({
      locale: "en",
      hostCuisineIds: ["central_european"],
      occasion: "guests",
      intent: "familiar",
      guestPrimaryCuisineId: "arab",
      guestPreferredCuisineIds: ["turkish"],
    });
    assert.ok(ids.length >= 2);
    assert.ok(ids.length <= 3);
    assert.equal(new Set(ids).size, ids.length);
    for (const id of ids) {
      const dish = getDishById(id)!;
      assert.equal(dish.mealSlotRole, "dinner_complete");
      assert.equal(dish.difficulty, "easy");
      assert.ok(["arab", "turkish", "central_european"].includes(dish.cuisineFamilyId));
    }
  });

  it("Guest Surprise uses explicit cuisine context only", () => {
    const centralEuropean = selectTonightCandidates({
      locale: "en",
      hostCuisineIds: ["mexican"],
      occasion: "guests",
      intent: "surprise",
      guestPrimaryCuisineId: "central_european",
      guestPreferredCuisineIds: [],
    });
    const arab = selectTonightCandidates({
      locale: "en",
      hostCuisineIds: ["mexican"],
      occasion: "guests",
      intent: "surprise",
      guestPrimaryCuisineId: "arab",
      guestPreferredCuisineIds: [],
    });
    assert.ok(
      centralEuropean.every(
        (id) => getDishById(id)?.cuisineFamilyId === "central_european",
      ),
    );
    assert.ok(arab.every((id) => getDishById(id)?.cuisineFamilyId === "arab"));
    assert.notDeepEqual(centralEuropean, arab);
  });

  it("Someone Special returns up to 3 choices and stays distinct from Guests", () => {
    const friendDecision = resolveTonightDecision({
      context: {
        occasion: "friend",
        intent: "special",
        guestPrimaryCuisineId: "italian",
        guestPreferredCuisineIds: [],
      },
      weeklyPlan: [],
      weeklyPlanningEnabled: false,
      hostCuisineIds: ["arab", "italian"],
      allergies: [],
      locale: "en",
    });
    const guestDecision = resolveTonightDecision({
      context: {
        occasion: "guests",
        intent: "special",
        guestPrimaryCuisineId: "italian",
        guestPreferredCuisineIds: [],
      },
      weeklyPlan: [],
      weeklyPlanningEnabled: false,
      hostCuisineIds: ["arab", "italian"],
      allergies: [],
      locale: "en",
    });
    assert.equal(friendDecision.policy, "SOMEONE_SPECIAL");
    assert.notEqual(friendDecision.policy, guestDecision.policy);
    assert.ok(friendDecision.candidateIds.length >= 1);
    assert.ok(friendDecision.candidateIds.length <= 3);
    for (const id of friendDecision.candidateIds) {
      assert.equal(getDishById(id)?.mealSlotRole, "dinner_complete");
    }
  });

  it("selecting one top-3 choice locks that recipe and composition for cooking", () => {
    const ids = selectTonightCandidates({
      locale: "en",
      hostCuisineIds: ["central_european"],
      occasion: "guests",
      intent: "familiar",
      guestPrimaryCuisineId: "arab",
      guestPreferredCuisineIds: [],
    });
    const selectedId = ids[1] ?? ids[0]!;
    const selectedDish = getDishById(selectedId)!;
    const composition = composeMealForMain(selectedDish, {
      hostCuisineIds: ["central_european"],
      allergies: [],
      dietType: undefined,
    });
    const meal = buildMealRecommendation(selectedId, "en", {
      occasion: "guests",
      intent: "familiar",
      guestPrimaryCuisineId: "arab",
      guestPreferredCuisineIds: [],
    }, {
      companionRecipeIds: composition.companionRecipeIds,
    })!;
    const frozen = freezeCookSessionMeal(meal);
    assert.equal(frozen.recipeId, selectedId);
    assert.deepEqual(
      frozen.companions?.map((c) => c.recipeId) ?? [],
      composition.companionRecipeIds,
    );
  });

  it("allergies hard-filter all strategies", () => {
    const familiar = selectTonightCandidates({
      locale: "en",
      hostCuisineIds: ["arab"],
      occasion: "guests",
      intent: "familiar",
      guestPrimaryCuisineId: "turkish",
      guestPreferredCuisineIds: [],
      allergies: ["Gluten"],
    });
    for (const id of familiar) {
      assert.ok(!getDishById(id)?.allergens.includes("Gluten"));
    }

    const surprise = selectTonightCandidates({
      locale: "en",
      hostCuisineIds: ["arab"],
      occasion: "guests",
      intent: "surprise",
      guestPrimaryCuisineId: "arab",
      guestPreferredCuisineIds: [],
      allergies: ["Gluten"],
    });
    for (const id of surprise) {
      assert.ok(!getDishById(id)?.allergens.includes("Gluten"));
    }
  });

  it("no curated compatible companion means honest main-only composition", () => {
    const main = getDishById("mujaddara")!;
    const meal = composeMealForMain(main, {
      hostCuisineIds: ["arab"],
      allergies: [],
      dietType: undefined,
    });
    assert.deepEqual(meal.companionRecipeIds, []);
    assert.equal(meal.balanceReason, "self_contained");
  });

  it("curated companions are main-specific, not same-cuisine filler", () => {
    const kabsa = getDishById("kabsa-chicken")!;
    const tabbouleh = getDishById("tabbouleh")!;
    assert.equal(isCompatibleCompanion(kabsa, tabbouleh), false);
  });

  it("guest ranked choices stay within valid candidates", () => {
    const ids = selectTonightCandidates({
      locale: "en",
      hostCuisineIds: ["italian"],
      occasion: "guests",
      intent: "familiar",
      guestPrimaryCuisineId: "arab",
      guestPreferredCuisineIds: [],
    });
    assert.ok(ids.length >= 2);
    assert.equal(new Set(ids).size, ids.length);
    for (const id of ids) {
      assert.equal(getDishById(id)?.mealSlotRole, "dinner_complete");
    }
  });

  it("Cook With What I Have changes candidates by ingredient overlap", () => {
    const lentils = matchDishesByIngredients("lentils cumin rice", [], "en", 3);
    assert.equal(lentils.noStrongMatch, false);
    assert.ok(lentils.recipeIds.length >= 1);
    assert.ok(
      lentils.recipeIds.some((id) =>
        ["mujaddara", "dal-tadka", "shorbat-adas", "mercimek-corbasi"].includes(
          id,
        ),
      ),
    );

    const avocado = matchDishesByIngredients(
      "avocado lime cilantro",
      [],
      "en",
      3,
    );
    assert.ok(avocado.recipeIds.includes("guacamole-plates"));
    assert.notDeepEqual(avocado.recipeIds, lentils.recipeIds);

    const chickenRosemary = matchDishesByIngredients(
      "Chicken garlic rosemary, 3 persons",
      [],
      "en",
      5,
    );
    assert.ok(chickenRosemary.recipeIds.includes("garlic-rosemary-chicken"));
    assert.ok(!chickenRosemary.recipeIds.includes("caprese"));
  });

  it("weekly plan is 7 deterministic days with limited duplicates", () => {
    const plan = buildDefaultWeekPlan("en", ["arab", "italian"], []);
    assert.equal(plan.length, 7);
    const unique = new Set(plan.map((d) => d.recipeId));
    assert.ok(unique.size >= 5);
    const again = buildDefaultWeekPlan("en", ["arab", "italian"], []);
    assert.deepEqual(again, plan);
  });

  it("each catalog dish has unique image path and required metadata", () => {
    const urls = DISH_CATALOG.map((d) => d.imageUrl);
    assert.equal(new Set(urls).size, urls.length);
    assert.ok(DISH_CATALOG.length >= 30);
    for (const dish of DISH_CATALOG) {
      assert.ok(dish.mealTypes.length >= 1);
      assert.ok(dish.ingredientTokens.length >= 2);
      assert.ok(dish.content.ar.steps.length >= 2);
      assert.ok(dish.content.en.steps.length >= 2);
    }
  });

  it("recipeId resolves consistently to the same image across surfaces", () => {
    for (const dish of DISH_CATALOG) {
      const meal = buildMealRecommendation(dish.id, "en", {
        occasion: "household",
        guestPreferredCuisineIds: [],
      })!;
      assert.equal(meal.imageUrl, dish.imageUrl, dish.id);
    }
  });

  it("main and companion image resolution cannot cross-wire", () => {
    const meal = buildMealRecommendation(
      "wiener-schnitzel",
      "en",
      { occasion: "household", guestPreferredCuisineIds: [] },
      { companionRecipeIds: ["gurkensalat"] },
    )!;
    const main = getDishById("wiener-schnitzel")!;
    const companion = getDishById("gurkensalat")!;
    assert.equal(meal.imageUrl, main.imageUrl);
    assert.equal(meal.companions?.[0]?.imageUrl, companion.imageUrl);
    assert.notEqual(meal.imageUrl, meal.companions?.[0]?.imageUrl);
  });

  it("known catalog entries resolve to identity-correct JPG paths", () => {
    const correct = new Set<string>(INSPECTED_CORRECT_RECIPE_IMAGE_IDS);
    assert.equal(correct.size, DISH_CATALOG.length);
    for (const dish of DISH_CATALOG) {
      assert.ok(correct.has(dish.id), dish.id);
      if (dish.id === "sumac-chicken") {
        assert.equal(dish.imageUrl, "/assets/dishes/arab/musakhan-wraps.jpg");
      } else {
        assert.match(dish.imageUrl, new RegExp(`/${dish.id}\\.jpg$`));
      }
      assert.ok(!dish.imageUrl.includes(NEEDS_PHOTO_PLACEHOLDER_PATH), dish.id);
    }
  });

  it("keeps the three guest strategies meaningfully distinct", () => {
    const base = {
      locale: "en" as const,
      hostCuisineIds: ["mexican" as const],
      occasion: "guests" as const,
      guestPrimaryCuisineId: "central_european" as const,
      guestPreferredCuisineIds: [] as CuisineFamilyId[],
    };
    const familiar = selectTonightCandidates({ ...base, intent: "familiar" });
    const special = selectTonightCandidates({ ...base, intent: "special" });
    const surprise = selectTonightCandidates({ ...base, intent: "surprise" });
    assert.ok(familiar.length >= 1);
    assert.ok(special.includes("paprika-chicken"));
    assert.ok(
      surprise.every(
        (id) => getDishById(id)?.cuisineFamilyId === "central_european",
      ),
    );
    assert.notDeepEqual(familiar, surprise);
  });
});
