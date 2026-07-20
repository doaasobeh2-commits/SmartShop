import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AppPreferences, CuisineFamilyId } from "@recipe-ai/core/types";
import { listAllDishes } from "../dishes";
import {
  applyHardSafety,
  buildIntelligentWeekPlan,
  composeMealForMain,
  dayIntentFit,
  filterDinnerComplete,
  isCompatibleCompanion,
  isVegetarianMainDish,
  MAX_PREFERRED_CUISINES,
  resolveHouseholdCuisineProfile,
  syncFavoriteCuisinesMirror,
} from "./index";
import { migratePreferences } from "../../../hooks/appStateLogic";

const now = new Date(2026, 6, 14, 10);

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
  };
}

function dishById(id: string) {
  const dish = listAllDishes().find((d) => d.id === id);
  assert.ok(dish, id);
  return dish!;
}

describe("Cuisine preference model (A)", () => {
  it("requires exactly one explicit primary — not duplicated in preferred", () => {
    const profile = arabProfile();
    assert.equal(profile.primaryCuisine, "arab");
    assert.equal(profile.preferredCuisines.length, 3);
    assert.ok(!profile.preferredCuisines.includes("arab"));
  });

  it("caps preferred cuisines at configured max", () => {
    assert.equal(MAX_PREFERRED_CUISINES, 3);
    const mirror = syncFavoriteCuisinesMirror("arab", [
      "turkish",
      "italian",
      "chinese",
    ]);
    assert.equal(mirror.length, 4);
  });

  it("does not infer primary from multi-item legacy favorites", () => {
    const migrated = migratePreferences({
      favoriteCuisines: ["arab", "turkish", "italian"],
    });
    assert.equal(migrated.primaryCuisine, undefined);
    assert.deepEqual(migrated.preferredCuisines, []);
  });

  it("migrates single legacy favorite to explicit primary", () => {
    const migrated = migratePreferences({
      favoriteCuisines: ["arab"],
    });
    assert.equal(migrated.primaryCuisine, "arab");
    assert.deepEqual(migrated.preferredCuisines, []);
  });

  it("never reads nationality/language — profile comes only from stored fields", () => {
    const prefs: Pick<
      AppPreferences,
      "primaryCuisine" | "preferredCuisines" | "favoriteCuisines"
    > = {
      primaryCuisine: undefined,
      preferredCuisines: [],
      favoriteCuisines: [],
    };
    const profile = resolveHouseholdCuisineProfile(prefs);
    assert.equal(profile.hasExplicitPrimary, false);
    assert.deepEqual(profile.hostCuisineIds, []);
  });
});

describe("AUTO weekly primary balance (B)", () => {
  it("primary cuisine forms majority when coverage exists", () => {
    const profile = arabProfile();
    const built = buildIntelligentWeekPlan(weekCtx(profile), {
      now,
      dayCuisineSources: Array.from({ length: 7 }, () => "auto" as const),
    });
    const primaryCount = built.plan.filter(
      (d) => dishById(d.recipeId).cuisineFamilyId === "arab",
    ).length;
    assert.ok(
      primaryCount >= 4,
      `expected arab majority, got ${primaryCount}/7`,
    );
    const secondaryCount = built.plan.filter((d) => {
      const c = dishById(d.recipeId).cuisineFamilyId;
      return profile.preferredCuisines.includes(c);
    }).length;
    assert.ok(
      secondaryCount <= 3,
      `expected controlled secondary variety, got ${secondaryCount}`,
    );
  });
});

describe("Intent + cuisine source (C)", () => {
  const profile = arabProfile();
  const ctx = weekCtx(profile);

  function pickDay(
    intent: import("@recipe-ai/core/types").DayPlanIntent,
    source: import("@recipe-ai/core/types").DayCuisineSource,
  ) {
    const built = buildIntelligentWeekPlan(ctx, {
      now,
      dayIntents: [intent],
      dayCuisineSources: [source],
    });
    return dishById(built.plan[0]!.recipeId);
  }

  it("Filling + main cuisine prioritizes primary", () => {
    const dish = pickDay("high_calorie", "primary");
    assert.equal(dish.cuisineFamilyId, "arab");
  });

  it("Budget + main cuisine prioritizes primary", () => {
    const dish = pickDay("budget", "primary");
    assert.equal(dish.cuisineFamilyId, "arab");
  });

  it("Quick + main cuisine prioritizes primary", () => {
    const dish = pickDay("quick", "primary");
    assert.equal(dish.cuisineFamilyId, "arab");
  });

  it("Healthy + preferred cuisines can select secondary", () => {
    const built = buildIntelligentWeekPlan(ctx, {
      now,
      dayIntents: ["healthy"],
      dayCuisineSources: ["preferred"],
    });
    const dish = dishById(built.plan[0]!.recipeId);
    assert.ok(profile.preferredCuisines.includes(dish.cuisineFamilyId));
  });

  it("Vegetarian restricts to vegetarian_ok mains", () => {
    const built = buildIntelligentWeekPlan(ctx, {
      now,
      dayIntents: Array.from({ length: 7 }, () => "vegetarian" as const),
      dayCuisineSources: Array.from({ length: 7 }, () => "auto" as const),
    });
    for (const day of built.plan) {
      const dish = dishById(day.recipeId);
      assert.ok(isVegetarianMainDish(dish), dish.id);
    }
  });
});

describe("Healthy vs Light (D)", () => {
  it("uses distinct scoring signals", () => {
    const healthyTagged = listAllDishes().find((d) =>
      d.mealIntents.includes("healthy"),
    )!;
    const heavy = listAllDishes().find(
      (d) =>
        d.mealIntents.includes("high_calorie") &&
        !d.mealIntents.includes("healthy"),
    )!;
    assert.ok(dayIntentFit(healthyTagged, "healthy") > dayIntentFit(heavy, "healthy"));
    assert.ok(dayIntentFit(heavy, "light") < dayIntentFit(healthyTagged, "light"));
    assert.notEqual(
      dayIntentFit(healthyTagged, "healthy"),
      dayIntentFit(healthyTagged, "light"),
    );
  });
});

describe("Explicit override (E)", () => {
  it("preferred source on multiple days overrides AUTO balance", () => {
    const profile = arabProfile();
    const built = buildIntelligentWeekPlan(weekCtx(profile), {
      now,
      dayCuisineSources: Array.from({ length: 7 }, () => "preferred" as const),
    });
    const preferredHits = built.plan.filter((d) =>
      profile.preferredCuisines.includes(
        dishById(d.recipeId).cuisineFamilyId,
      ),
    ).length;
    assert.ok(
      preferredHits >= 5,
      `expected preferred-heavy week, got ${preferredHits}`,
    );
  });
});

describe("Safety (F)", () => {
  it("allergy hard gate overrides cuisine and intent", () => {
    const built = buildIntelligentWeekPlan(
      {
        ...weekCtx(),
        allergies: ["Gluten"],
      },
      {
        now,
        dayIntents: Array.from({ length: 7 }, () => "special" as const),
        dayCuisineSources: Array.from({ length: 7 }, () => "primary" as const),
      },
    );
    for (const day of built.plan) {
      const dish = dishById(day.recipeId);
      assert.ok(!dish.allergens.includes("Gluten"), dish.id);
    }
  });
});

describe("Catalog pressure (G)", () => {
  it("degrades gracefully without fake quota when primary coverage thin", () => {
    const thinProfile = resolveHouseholdCuisineProfile({
      primaryCuisine: "mexican",
      preferredCuisines: [],
      favoriteCuisines: ["mexican"],
    });
    const safe = filterDinnerComplete(
      applyHardSafety(listAllDishes(), {
        allergies: [],
        dietType: "normal",
        excludeRecipeIds: [],
      }),
    );
    const mexicanSafe = safe.filter((d) => d.cuisineFamilyId === "mexican");
    assert.ok(mexicanSafe.length > 0 && mexicanSafe.length < 7);

    const built = buildIntelligentWeekPlan(weekCtx(thinProfile), {
      now,
      dayCuisineSources: Array.from({ length: 7 }, () => "primary" as const),
    });
    assert.equal(built.plan.length, 7);
    for (const day of built.plan) {
      assert.ok(dishById(day.recipeId).mealSlotRole === "dinner_complete");
    }
  });
});

describe("Existing invariants (H)", () => {
  it("weekly plan persists dayIntent and dayCuisineSource fields", () => {
    const built = buildIntelligentWeekPlan(weekCtx(), {
      now,
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
    });
    assert.equal(built.plan[0]?.dayIntent, "budget");
    assert.equal(built.plan[0]?.dayCuisineSource, "primary");
    const reloaded = JSON.parse(JSON.stringify(built.plan));
    assert.equal(reloaded[0]?.dayCuisineSource, "primary");
  });

  it("companions stay curated — not cuisine-matched only", () => {
    const main = listAllDishes().find(
      (d) => d.cuisineFamilyId === "arab" && d.mealSlotRole === "dinner_complete",
    )!;
    const meal = composeMealForMain(main, weekCtx(), []);
    for (const id of meal.companionRecipeIds) {
      const companion = dishById(id);
      assert.ok(
        isCompatibleCompanion(main, companion),
        `${main.id} + ${companion.id}`,
      );
    }
  });
});
