import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { CuisineFamilyId, DayPlanIntent } from "@recipe-ai/core/types";
import { listAllDishes } from "../dishes";
import {
  auditCuisineIntentCoverage,
  DISH_INTENT_META,
} from "../mealIntentMeta";
import { EXPECTED_DISH_IMAGE_PATHS } from "../imageAssets";
import type { DishCatalogEntry, IngredientRole } from "../types";
import {
  buildIntelligentWeekPlan,
  composeMealForMain,
  computeCompletionBurden,
  dayIntentFit,
  isCompatibleCompanion,
  matchPantryDishes,
  reselectWeekDay,
  scorePantryDish,
} from "./index";

function syntheticDish(
  id: string,
  pantry: Array<{ id: string; role: IngredientRole }>,
  extras?: Partial<DishCatalogEntry>,
): DishCatalogEntry {
  return {
    id,
    cuisineFamilyId: "arab",
    title: id,
    imageUrl: `/assets/dishes/arab/${id}.jpg`,
    prepMinutes: 25,
    servings: 4,
    difficulty: "easy",
    mealTypes: ["main"],
    suitability: ["everyday_host"],
    specialness: 1,
    familiarity: 1,
    ingredientTokens: pantry.map((p) => p.id),
    pantryIngredients: pantry.map((p) => ({
      canonicalId: p.id,
      role: p.role,
      tokens: [p.id],
    })),
    allergens: [],
    mayContain: [],
    allergenDeclared: true,
    mealSlotRole: "dinner_complete",
    dietaryTags: ["vegetarian_ok"],
    mealIntents: ["budget"],
    budgetTier: "low",
    proteinCategory: "mixed",
    moods: ["everyday"],
    content: {
      en: {
        reason: "",
        cuisineLabel: "",
        ingredients: [],
        steps: [],
        tips: [],
        storageTip: "",
      },
      de: {
        reason: "",
        cuisineLabel: "",
        ingredients: [],
        steps: [],
        tips: [],
        storageTip: "",
      },
      ar: {
        reason: "",
        cuisineLabel: "",
        ingredients: [],
        steps: [],
        tips: [],
        storageTip: "",
      },
      tr: {
        reason: "",
        cuisineLabel: "",
        ingredients: [],
        steps: [],
        tips: [],
        storageTip: "",
      },
    },
    ...extras,
  };
}

describe("Meal-intent metadata consistency", () => {
  it("every catalog dish has curated intent meta + structured fields", () => {
    for (const dish of listAllDishes()) {
      assert.ok(
        DISH_INTENT_META[dish.id],
        `missing DISH_INTENT_META for ${dish.id}`,
      );
      assert.ok(dish.mealIntents.length > 0, `${dish.id} mealIntents empty`);
      assert.ok(
        ["low", "medium", "premium"].includes(dish.budgetTier),
        `${dish.id} budgetTier`,
      );
      assert.ok(dish.proteinCategory, `${dish.id} proteinCategory`);
      assert.ok(dish.mealSlotRole, `${dish.id} mealSlotRole`);
    }
  });

  it("expected image paths cover every dish url", () => {
    const expected = new Set(EXPECTED_DISH_IMAGE_PATHS);
    for (const dish of listAllDishes()) {
      assert.ok(
        expected.has(dish.imageUrl),
        `image path missing from EXPECTED: ${dish.imageUrl}`,
      );
    }
  });

  it("each cuisine has dinner-complete coverage across key intents", () => {
    const coverage = auditCuisineIntentCoverage(listAllDishes());
    for (const cuisine of Object.keys(coverage)) {
      const row = coverage[cuisine]!;
      assert.ok(row.dinner_complete >= 3, `${cuisine} dinner_complete`);
      assert.ok(row.budget >= 1, `${cuisine} budget`);
      assert.ok(row.healthy >= 1, `${cuisine} healthy`);
      assert.ok(row.high_calorie >= 1, `${cuisine} high_calorie`);
      assert.ok(row.special >= 1, `${cuisine} special`);
    }
  });
});

describe("Day intent ranking (A–F)", () => {
  const now = new Date(2026, 6, 14, 10);
  const baseCtx = {
    locale: "en" as const,
    hostCuisineIds: [
      "arab",
      "turkish",
      "central_european",
      "italian",
      "chinese",
      "indian",
      "mexican",
    ] as CuisineFamilyId[],
    allergies: [] as string[],
  };

  function planFor(intent: DayPlanIntent) {
    return buildIntelligentWeekPlan(baseCtx, {
      now,
      dayIntents: Array.from({ length: 7 }, () => intent),
    });
  }

  it("A — budget intent prefers low budgetTier mains", () => {
    const budget = planFor("budget");
    const auto = planFor("auto");
    const lowShare = (plan: typeof budget.plan) =>
      plan.filter((d) => {
        const dish = listAllDishes().find((x) => x.id === d.recipeId);
        return dish?.budgetTier === "low";
      }).length;
    assert.ok(lowShare(budget.plan) >= lowShare(auto.plan));
    assert.ok(
      budget.plan.every((d) => d.dayIntent === "budget"),
      "intents persist on plan days",
    );
  });

  it("B — healthy intent prefers curated healthy tags", () => {
    const healthy = planFor("healthy");
    const hits = healthy.plan.filter((d) => {
      const dish = listAllDishes().find((x) => x.id === d.recipeId);
      return dish?.mealIntents.includes("healthy");
    }).length;
    assert.ok(hits >= 3, `expected several healthy days, got ${hits}`);
  });

  it("C — high_calorie intent prefers filling tags", () => {
    const filling = planFor("high_calorie");
    const hits = filling.plan.filter((d) => {
      const dish = listAllDishes().find((x) => x.id === d.recipeId);
      return dish?.mealIntents.includes("high_calorie");
    }).length;
    assert.ok(hits >= 3, `expected several filling days, got ${hits}`);
  });

  it("D — special intent prefers special / high specialness", () => {
    const special = planFor("special");
    const hits = special.plan.filter((d) => {
      const dish = listAllDishes().find((x) => x.id === d.recipeId)!;
      return dish.mealIntents.includes("special") || dish.specialness >= 3;
    }).length;
    assert.ok(hits >= 3, `expected several special days, got ${hits}`);
  });

  it("E — quick intent prefers quick / short prep", () => {
    const quick = planFor("quick");
    const hits = quick.plan.filter((d) => {
      const dish = listAllDishes().find((x) => x.id === d.recipeId)!;
      return dish.mealIntents.includes("quick") || dish.prepMinutes <= 25;
    }).length;
    assert.ok(hits >= 4, `expected several quick days, got ${hits}`);
  });

  it("F — safety always wins over any intent", () => {
    const unsafe = buildIntelligentWeekPlan(
      { ...baseCtx, allergies: ["Gluten"] },
      {
        now,
        dayIntents: Array.from({ length: 7 }, () => "special" as const),
      },
    );
    for (const day of unsafe.plan) {
      const dish = listAllDishes().find((x) => x.id === day.recipeId)!;
      assert.ok(!dish.allergens.includes("Gluten"), day.recipeId);
    }
    // Fit score never overrides hard safety — gluten dishes stay out.
    const glutenDish = listAllDishes().find((d) =>
      d.allergens.includes("Gluten"),
    )!;
    assert.ok(dayIntentFit(glutenDish, "special") !== Number.POSITIVE_INFINITY);
  });
});

describe("Pantry completion burden (G–H + regress)", () => {
  it("G — low completionBurden outranks high supporting burden", () => {
    const low = syntheticDish("low-burden", [
      { id: "chicken", role: "critical" },
      { id: "rice", role: "critical" },
      { id: "onion", role: "supporting" },
    ]);
    const high = syntheticDish("high-burden", [
      { id: "chicken", role: "critical" },
      { id: "rice", role: "critical" },
      { id: "saffron", role: "supporting" },
      { id: "cardamom", role: "supporting" },
      { id: "rosewater", role: "supporting" },
      { id: "pistachios", role: "supporting" },
      { id: "sumac", role: "supporting" },
    ]);
    const tokens = ["chicken", "rice"];
    const a = scorePantryDish(low, tokens)!;
    const b = scorePantryDish(high, tokens)!;
    assert.ok(a.completionBurden < b.completionBurden);
    assert.ok(a.score > b.score);
    assert.equal(a.minimalExtraCount, 1);
    assert.equal(b.minimalExtraCount, 5);
  });

  it("H — missing optional / garnish does not hurt heavily", () => {
    const withGarnish = syntheticDish("garnish-dish", [
      { id: "chicken", role: "critical" },
      { id: "rice", role: "critical" },
      { id: "parsley", role: "garnish" },
      { id: "yogurt", role: "optional" },
    ]);
    const tokens = ["chicken", "rice"];
    const scored = scorePantryDish(withGarnish, tokens)!;
    assert.equal(scored.missingCritical, 0);
    assert.ok(scored.completionBurden < 2);
    assert.equal(scored.minimalExtraCount, 0);
  });

  it("missing critical still excludes the dish", () => {
    const dish = syntheticDish("needs-lamb", [
      { id: "lamb", role: "critical" },
      { id: "rice", role: "critical" },
    ]);
    assert.equal(scorePantryDish(dish, ["chicken", "rice"]), null);
  });

  it("budget preference soft-boosts low-tier recipes", () => {
    const budget = syntheticDish(
      "budget-rice",
      [
        { id: "rice", role: "critical" },
        { id: "lentils", role: "critical" },
      ],
      { budgetTier: "low" },
    );
    const premium = syntheticDish(
      "premium-rice",
      [
        { id: "rice", role: "critical" },
        { id: "lentils", role: "critical" },
      ],
      { budgetTier: "premium", mealIntents: ["special"] },
    );
    const tokens = ["rice", "lentils"];
    assert.ok(
      scorePantryDish(budget, tokens)!.score >
        scorePantryDish(premium, tokens)!.score,
    );
  });

  it("safety dominates budget in pantry matching", () => {
    const result = matchPantryDishes(
      {
        locale: "en",
        tonight: { occasion: "household", guestPreferredCuisineIds: [] },
        hostCuisineIds: ["italian"],
        allergies: ["Gluten"],
        weeklyPlanningEnabled: false,
        weeklyPlan: [],
        mode: "pantry",
        pantryQuery: "pasta tomato",
      },
      5,
    );
    for (const id of result.recipeIds) {
      const dish = listAllDishes().find((d) => d.id === id)!;
      assert.ok(!dish.allergens.includes("Gluten"), id);
    }
  });

  it("computeCompletionBurden weights roles correctly", () => {
    assert.equal(
      computeCompletionBurden({
        missingCritical: 1,
        missingSupporting: 2,
        missingOptional: 2,
      }),
      10 + 6 + 1,
    );
  });
});

describe("Weekly intents persist + single-day reselect (I–K)", () => {
  const now = new Date(2026, 6, 14, 10);
  const ctx = {
    locale: "en" as const,
    hostCuisineIds: [
      "arab",
      "central_european",
      "italian",
    ] as CuisineFamilyId[],
    allergies: [] as string[],
  };

  it("I — saved intents persist with planStart", () => {
    const intents: DayPlanIntent[] = [
      "budget",
      "healthy",
      "high_calorie",
      "special",
      "quick",
      "auto",
      "budget",
    ];
    const built = buildIntelligentWeekPlan(ctx, { now, dayIntents: intents });
    assert.equal(built.planStart, "2026-07-14");
    built.plan.forEach((day, i) => {
      assert.equal(day.dayIntent, intents[i]);
      assert.equal(day.date, built.plan[i]?.date);
    });
  });

  it("J — changing one day intent only reselects that day", () => {
    const built = buildIntelligentWeekPlan(ctx, {
      now,
      dayIntents: Array.from({ length: 7 }, () => "auto" as const),
    });
    const before = built.plan.map((d) => d.recipeId);
    const next = reselectWeekDay(
      built.plan,
      built.roles,
      2,
      "budget",
      ctx,
    );
    assert.equal(next[2]?.dayIntent, "budget");
    for (let i = 0; i < 7; i++) {
      if (i === 2) continue;
      assert.equal(next[i]?.recipeId, before[i], `day ${i} should stay`);
      assert.equal(next[i]?.dayIntent, "auto");
    }
  });

  it("K — companions remain compatible with selected main", () => {
    const built = buildIntelligentWeekPlan(ctx, {
      now,
      dayIntents: Array.from({ length: 7 }, () => "healthy" as const),
    });
    for (const day of built.plan) {
      const main = listAllDishes().find((d) => d.id === day.recipeId)!;
      for (const companionId of day.meal.companionRecipeIds) {
        const companion = listAllDishes().find((d) => d.id === companionId)!;
        assert.ok(
          isCompatibleCompanion(main, companion),
          `${main.id} + ${companionId}`,
        );
      }
      const recomposed = composeMealForMain(
        main,
        {
          allergies: [],
          dietType: undefined,
          hostCuisineIds: [...ctx.hostCuisineIds],
        },
        [],
      );
      assert.equal(recomposed.mainRecipeId, main.id);
    }
  });
});
