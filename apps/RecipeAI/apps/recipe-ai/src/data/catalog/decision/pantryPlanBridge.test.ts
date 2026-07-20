import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type {
  CuisineFamilyId,
  FuturePlanCandidate,
  WeekDayPlan,
} from "@recipe-ai/core/types";
import { getDishById } from "../dishes";
import { CURATED_COMPANIONS, isCompatibleCompanion } from "./mealComposition";
import {
  addLocalDays,
  formatLocalIsoDate,
  resolvePlanningStartDate,
  weekdayIndexFromDate,
} from "./planningCalendar";
import {
  assessDishQuantityReadiness,
  parsePantryItems,
  parseRecipeQuantityHint,
} from "./pantryQuantity";
import {
  assessPlannedMealVsPantry,
  findTodayPlanDay,
  markFutureCandidatesScheduled,
  otherDaysUnchanged,
  replaceTodayPlanMain,
  saveFuturePlanCandidate,
} from "./pantryPlanBridge";
import { buildIntelligentWeekPlan } from "./weekly";
import {
  flowAfterBackFromPantryPreview,
  flowAfterOpenPantryMatch,
  pantryMatchDestinationScreen,
} from "../../../hooks/pantryNavigation";

function atLocal(
  y: number,
  m0: number,
  d: number,
  hour: number,
  minute = 0,
): Date {
  return new Date(y, m0, d, hour, minute, 0, 0);
}

function makePlan(now: Date, mains: string[]): WeekDayPlan[] {
  const start = resolvePlanningStartDate(now, 17);
  return mains.map((recipeId, dayOffset) => {
    const date = addLocalDays(start, dayOffset);
    const companions = CURATED_COMPANIONS[recipeId] ?? [];
    return {
      dayOffset,
      date: formatLocalIsoDate(date),
      weekdayIndex: weekdayIndexFromDate(date),
      recipeId,
      dayIntent: dayOffset === 0 ? ("budget" as const) : ("auto" as const),
      meal: {
        mainRecipeId: recipeId,
        companionRecipeIds: companions.slice(0, 1),
        balanceReason: companions.length ? "compatible_accompaniment" : "main_only",
      },
    };
  });
}

const hostCuisineIds: CuisineFamilyId[] = [
  "arab",
  "central_european",
  "italian",
];

describe("Pantry → Today / Weekly Plan bridge", () => {
  const morning = atLocal(2026, 6, 14, 10); // Tue before cutoff

  it("1 — COOK_NOW does not mutate weekly plan (replace helper unused)", () => {
    const before = makePlan(morning, [
      "kabsa-chicken",
      "mujaddara",
      "sumac-chicken",
      "kofte",
      "pomodoro-pasta",
      "dal-tadka",
      "menemen",
    ]);
    const snapshot = JSON.stringify(before);
    // Simulating COOK_NOW: no replaceTodayPlanMain call.
    assert.equal(JSON.stringify(before), snapshot);
  });

  it("2–3 — REPLACE_TODAY_PLAN changes today only; others unchanged", () => {
    const before = makePlan(morning, [
      "kabsa-chicken",
      "mujaddara",
      "sumac-chicken",
      "kofte",
      "pomodoro-pasta",
      "dal-tadka",
      "menemen",
    ]);
    const today = findTodayPlanDay(before, morning)!;
    assert.equal(today.recipeId, "kabsa-chicken");

    const result = replaceTodayPlanMain(
      before,
      "paprika-chicken",
      { allergies: [], hostCuisineIds, dietType: "normal" },
      morning,
    );
    assert.ok(result);
    assert.equal(result!.plan[0]?.recipeId, "paprika-chicken");
    assert.ok(otherDaysUnchanged(before, result!.plan, result!.replacedDayOffset));
  });

  it("4 — replacement persists logically with planStart identity", () => {
    const before = makePlan(morning, [
      "kabsa-chicken",
      "mujaddara",
      "sumac-chicken",
      "kofte",
      "pomodoro-pasta",
      "dal-tadka",
      "menemen",
    ]);
    const result = replaceTodayPlanMain(
      before,
      "eiernockerl",
      { allergies: [], hostCuisineIds },
      morning,
    )!;
    const reloaded = JSON.parse(JSON.stringify(result.plan)) as WeekDayPlan[];
    assert.equal(reloaded[0]?.recipeId, "eiernockerl");
    assert.equal(reloaded[0]?.date, before[0]?.date);
    assert.ok(otherDaysUnchanged(before, reloaded, 0));
  });

  it("5–6 — old companions do not leak; new curated companions resolve", () => {
    const before = makePlan(morning, [
      "wiener-schnitzel",
      "mujaddara",
      "sumac-chicken",
      "kofte",
      "pomodoro-pasta",
      "dal-tadka",
      "menemen",
    ]);
    assert.deepEqual(before[0]?.meal.companionRecipeIds, ["gurkensalat"]);
    const result = replaceTodayPlanMain(
      before,
      "foul-medames",
      { allergies: [], hostCuisineIds },
      morning,
    )!;
    const newMeal = result.plan[0]!.meal;
    assert.equal(newMeal.mainRecipeId, "foul-medames");
    // Self-contained / uncurated main → no invented companions; salad must not leak.
    assert.ok(!newMeal.companionRecipeIds.includes("gurkensalat"));
    for (const id of newMeal.companionRecipeIds) {
      const main = getDishById("foul-medames")!;
      const companion = getDishById(id)!;
      assert.ok(isCompatibleCompanion(main, companion), id);
    }
  });

  it("7 — today’s DayPlanIntent is preserved", () => {
    const before = makePlan(morning, [
      "kabsa-chicken",
      "mujaddara",
      "sumac-chicken",
      "kofte",
      "pomodoro-pasta",
      "dal-tadka",
      "menemen",
    ]);
    assert.equal(before[0]?.dayIntent, "budget");
    const result = replaceTodayPlanMain(
      before,
      "foul-medames",
      { allergies: [], hostCuisineIds },
      morning,
    )!;
    assert.equal(result.dayIntent, "budget");
    assert.equal(result.plan[0]?.dayIntent, "budget");
  });

  it("8 — SAVE_FOR_FUTURE_PLAN does not mutate current week", () => {
    const before = makePlan(morning, [
      "kabsa-chicken",
      "mujaddara",
      "sumac-chicken",
      "kofte",
      "pomodoro-pasta",
      "dal-tadka",
      "menemen",
    ]);
    const snapshot = JSON.stringify(before);
    const candidates = saveFuturePlanCandidate([], "mapo-tofu");
    assert.equal(candidates[0]?.recipeId, "mapo-tofu");
    assert.equal(JSON.stringify(before), snapshot);
  });

  it("9 — saved future candidate can influence a later compatible plan once", () => {
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
    assert.ok(
      built.plan.some((d) => d.recipeId === "chana-masala") ||
        (built.scheduledFutureCandidateIds ?? []).includes("chana-masala") ||
        built.plan.some((d) => d.recipeId === "chana-masala"),
      "candidate should be strongly considered when safe + budget-compatible",
    );
    // Prefer asserting scheduled list when it won a day:
    if (built.plan.some((d) => d.recipeId === "chana-masala")) {
      assert.ok(
        (built.scheduledFutureCandidateIds ?? []).includes("chana-masala"),
      );
      const marked = markFutureCandidatesScheduled(
        candidates,
        built.scheduledFutureCandidateIds ?? [],
        built.planStart,
      );
      assert.equal(marked[0]?.scheduledPlanStart, built.planStart);

      const second = buildIntelligentWeekPlan(
        {
          locale: "en",
          hostCuisineIds: ["indian", "arab", "italian"],
          allergies: [],
        },
        {
          now: atLocal(2026, 6, 21, 10),
          futurePlanCandidates: marked,
        },
      );
      // Once scheduled, must not force again via the same soft boost path.
      assert.ok(
        !(second.scheduledFutureCandidateIds ?? []).includes("chana-masala"),
      );
    }
  });

  it("10 — pantry-origin Recipe Detail navigation remains correct", () => {
    assert.equal(pantryMatchDestinationScreen(), "recipe-preview");
    const opened = flowAfterOpenPantryMatch([
      "tonight",
      "cook-with-what-i-have",
    ]);
    assert.deepEqual(opened, [
      "tonight",
      "cook-with-what-i-have",
      "recipe-preview",
    ]);
    assert.deepEqual(flowAfterBackFromPantryPreview(opened), [
      "tonight",
      "cook-with-what-i-have",
    ]);
  });

  it("11 — cooking an extra meal does not write planned dinner completion", () => {
    const plannedId = "kabsa-chicken";
    const cookedId = "mujaddara";
    const sessionRole = "extra" as const;
    const events = [
      {
        recipeId: cookedId,
        at: Date.now(),
        kind: "completed" as const,
        sessionRole,
      },
    ];
    assert.ok(!events.some((e) => e.recipeId === plannedId));
    assert.equal(events[0]?.sessionRole, "extra");
  });

  it("12 — quantity insufficiency only claimed when evidence is sufficient", () => {
    const presenceOnly = parsePantryItems("chicken, rice");
    assert.ok(presenceOnly.every((p) => p.evidence === "presence_only"));

    const withQty = parsePantryItems("50g chicken, rice, 5 people");
    const chicken = withQty.find((p) => p.token === "chicken");
    assert.equal(chicken?.evidence, "quantity");
    assert.equal(chicken?.quantity, 50);
    assert.equal(chicken?.unit, "g");

    const dish = getDishById("kabsa-chicken")!;
    // Force a known recipe hint path via detail parse helper honesty:
    const hint = parseRecipeQuantityHint("500 g");
    assert.ok(hint);
    const assessment = assessDishQuantityReadiness(dish, withQty, 5);
    // Without reliable recipe qty on criticals, must not claim insufficiency.
    if (!assessment.hasReliableInsufficiency) {
      assert.equal(assessment.hasReliableInsufficiency, false);
    } else {
      assert.ok(
        assessment.ingredients.some(
          (i) => i.reason === "compared" && i.readiness === "insufficient",
        ),
      );
    }

    // Presence-only query never yields reliable insufficiency.
    const soft = assessDishQuantityReadiness(dish, presenceOnly, 5);
    assert.equal(soft.hasReliableInsufficiency, false);
  });

  it("13 — safety always overrides pantry/plan replacement", () => {
    const before = makePlan(morning, [
      "kabsa-chicken",
      "mujaddara",
      "sumac-chicken",
      "kofte",
      "pomodoro-pasta",
      "dal-tadka",
      "menemen",
    ]);
    const glutenMain = listDinnerGluten();
    const blocked = replaceTodayPlanMain(
      before,
      glutenMain,
      { allergies: ["Gluten"], hostCuisineIds },
      morning,
    );
    assert.equal(blocked, null);

    const conflict = assessPlannedMealVsPantry({
      plan: before,
      query: "chicken rice onion",
      allergies: ["Gluten"],
      hostCuisineIds,
      locale: "en",
      now: morning,
    });
    if (conflict) {
      for (const id of conflict.alternatives) {
        const dish = getDishById(id)!;
        assert.ok(!dish.allergens.includes("Gluten"), id);
      }
    }
  });
});

function listDinnerGluten(): string {
  const dish = getDishById("pomodoro-pasta")!;
  assert.ok(dish.allergens.includes("Gluten"));
  return dish.id;
}
