import type { MealComposition } from "@recipe-ai/core/types";
import { getDishById, listAllDishes } from "../dishes";
import type { DishCatalogEntry } from "../types";
import { applyHardSafety, isDishSafe } from "./safety";
import type { DecisionContext } from "./types";

/**
 * Honest V1 meal-balance signals — not medical nutrition claims.
 */
export type MealBalance =
  | "light"
  | "balanced"
  | "hearty"
  | "vegetable_forward"
  | "protein_forward"
  | "high_energy";

export type CompanionSlot = "salad" | "soup" | "side" | "grain";

/**
 * Curated culinary pairings only — never invented fusion.
 * Empty list / missing key → main may stand alone (honest sparse catalog).
 */
const CURATED_COMPANIONS: Record<string, string[]> = {
  "wiener-schnitzel": ["gurkensalat"],
  "paprika-chicken": ["gurkensalat"],
  gulasch: ["gurkensalat"],
  "sumac-chicken": ["tabbouleh", "fattoush"],
  "kabsa-chicken": [],
  mujaddara: [],
  kofte: ["cacik"],
  "tandoori-style-chicken": ["cucumber-raita"],
  "aloo-gobi": ["cucumber-raita", "jeera-rice"],
  "garlic-rosemary-chicken": ["caprese"],
  "pomodoro-pasta": ["caprese"],
  "street-tacos": ["guacamole-plates"],
  "chicken-tinga": ["mexican-rice"],
  "ginger-soy-chicken": ["cucumber-salad-smashed"],
  dumplings: ["cucumber-salad-smashed"],
  "tomato-egg-stirfry": ["cucumber-salad-smashed"],
};

const HEAVY_BALANCE = new Set<MealBalance>([
  "hearty",
  "high_energy",
  "protein_forward",
]);

export function deriveMealBalance(dish: DishCatalogEntry): MealBalance {
  const types = new Set(dish.mealTypes);
  const tags = new Set(dish.dietaryTags);
  const id = dish.id;

  if (
    id.includes("schnitzel") ||
    id.includes("fried") ||
    id.includes("gulasch") ||
    id.includes("tinga")
  ) {
    return "high_energy";
  }
  if (types.has("stew") || dish.specialness >= 3) return "hearty";
  if (
    tags.has("vegetarian_ok") &&
    (types.has("salad") ||
      id.includes("gobi") ||
      id.includes("dal") ||
      types.has("soup"))
  ) {
    return "vegetable_forward";
  }
  if (
    tags.has("contains_meat") ||
    tags.has("contains_fish") ||
    dish.ingredientTokens.some((t) =>
      ["chicken", "beef", "lamb", "fish"].includes(t),
    )
  ) {
    if (types.has("rice") || types.has("soup")) return "balanced";
    return "protein_forward";
  }
  if (types.has("salad") || types.has("side")) return "light";
  return "balanced";
}

export function companionSlotOf(dish: DishCatalogEntry): CompanionSlot | null {
  if (dish.mealSlotRole === "dinner_complete") return null;
  const types = new Set(dish.mealTypes);
  if (types.has("salad")) return "salad";
  if (types.has("soup")) return "soup";
  if (types.has("rice")) return "grain";
  if (types.has("side")) return "side";
  return null;
}

function mainAlreadySelfContained(main: DishCatalogEntry): boolean {
  // One-pot rice mains / soups are complete dinners without forced sides.
  if (main.mealTypes.includes("soup") && !main.mealTypes.includes("main")) {
    return true;
  }
  if (
    main.mealTypes.includes("rice") &&
    main.mealSlotRole === "dinner_complete"
  ) {
    return true;
  }
  const curated = CURATED_COMPANIONS[main.id];
  if (curated && curated.length === 0) return true;
  return false;
}

function mainNeedsCompanion(main: DishCatalogEntry): boolean {
  if (mainAlreadySelfContained(main)) return false;
  const balance = deriveMealBalance(main);
  if (HEAVY_BALANCE.has(balance)) return true;
  const curated = CURATED_COMPANIONS[main.id];
  return Boolean(curated && curated.length > 0);
}

function rolesOverlapUnnecessarily(
  main: DishCatalogEntry,
  companion: DishCatalogEntry,
): boolean {
  const slot = companionSlotOf(companion);
  if (!slot) return true;
  // Don't add grain when the main already carries rice/starch.
  if (slot === "grain" && main.mealTypes.includes("rice")) return true;
  // Don't add soup beside a soup main.
  if (slot === "soup" && main.mealTypes.includes("soup")) return true;
  // Don't pair two salad-forward plates.
  if (
    slot === "salad" &&
    main.mealTypes.includes("salad") &&
    !main.mealTypes.includes("main")
  ) {
    return true;
  }
  return false;
}

function balanceFit(
  main: DishCatalogEntry,
  companion: DishCatalogEntry,
): number {
  const mainBal = deriveMealBalance(main);
  const compBal = deriveMealBalance(companion);
  const slot = companionSlotOf(companion);
  let score = 0;

  if (HEAVY_BALANCE.has(mainBal) && (compBal === "light" || slot === "salad")) {
    score += 12;
  }
  if (
    mainBal === "protein_forward" &&
    (compBal === "vegetable_forward" ||
      slot === "salad" ||
      companion.dietaryTags.includes("vegetarian_ok"))
  ) {
    score += 10;
  }
  if (mainBal === "vegetable_forward" && slot === "grain") score += 6;
  if (compBal === "high_energy" || compBal === "hearty") score -= 8;

  // Effort: prefer quick light companions
  score -= companion.prepMinutes / 30;
  return score;
}

/**
 * Same cuisine alone is never sufficient — companions must be curated
 * for this main (culinarily validated), then pass safety + balance.
 */
export function isCompatibleCompanion(
  main: DishCatalogEntry,
  companion: DishCatalogEntry,
): boolean {
  if (main.id === companion.id) return false;
  if (companion.mealSlotRole === "dinner_complete") return false;
  if (companionSlotOf(companion) == null) return false;
  if (rolesOverlapUnnecessarily(main, companion)) return false;

  const curated = CURATED_COMPANIONS[main.id];
  if (!curated || curated.length === 0) return false;
  return curated.includes(companion.id);
}

export function composeMealForMain(
  main: DishCatalogEntry,
  ctx: Pick<DecisionContext, "allergies" | "dietType" | "hostCuisineIds">,
  usedCompanionIds: string[] = [],
): MealComposition {
  if (!mainNeedsCompanion(main)) {
    return {
      mainRecipeId: main.id,
      companionRecipeIds: [],
      balanceReason: mainAlreadySelfContained(main)
        ? "self_contained"
        : "main_only",
    };
  }

  const curatedIds = CURATED_COMPANIONS[main.id] ?? [];
  const used = new Set(usedCompanionIds);
  const safePool = applyHardSafety(
    curatedIds
      .map((id) => getDishById(id))
      .filter((d): d is DishCatalogEntry => Boolean(d)),
    ctx,
  );

  let best: DishCatalogEntry | undefined;
  let bestScore = -Infinity;

  for (const companion of safePool) {
    if (used.has(companion.id)) continue;
    if (!isCompatibleCompanion(main, companion)) continue;
    if (!isDishSafe(companion, ctx.allergies, ctx.dietType)) continue;

    let score = balanceFit(main, companion);
    // Household cuisine preference (soft)
    if (ctx.hostCuisineIds.includes(companion.cuisineFamilyId)) score += 2;
    // Repetition across the week
    score -= usedCompanionIds.filter((id) => id === companion.id).length * 20;

    if (score > bestScore) {
      bestScore = score;
      best = companion;
    }
  }

  if (!best || bestScore < 0) {
    return {
      mainRecipeId: main.id,
      companionRecipeIds: [],
      balanceReason: "no_safe_compatible_companion",
    };
  }

  const mainBal = deriveMealBalance(main);
  return {
    mainRecipeId: main.id,
    companionRecipeIds: [best.id],
    balanceReason: HEAVY_BALANCE.has(mainBal)
      ? "lighter_companion_for_hearty_main"
      : "compatible_accompaniment",
  };
}

/** Catalog gap report helper — mains with no curated companions. */
export function mainsWithoutCuratedCompanions(): string[] {
  return listAllDishes()
    .filter((d) => d.mealSlotRole === "dinner_complete")
    .filter((d) => {
      const curated = CURATED_COMPANIONS[d.id];
      return curated == null;
    })
    .map((d) => d.id);
}

export function companionTitles(
  meal: MealComposition,
  localeTitle: (id: string) => string,
): string[] {
  return meal.companionRecipeIds.map(localeTitle);
}

export { CURATED_COMPANIONS };
