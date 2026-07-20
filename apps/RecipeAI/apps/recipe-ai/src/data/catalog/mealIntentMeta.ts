/**
 * Curated meal-intent metadata for the starter catalog.
 *
 * Honesty notes (V1):
 * - `healthy` = curated lighter/vegetable-forward suitability — NOT medical nutrition.
 * - `high_calorie` = curated filling/energy-dense suitability — NOT validated kcal.
 * - `budget` / `budgetTier` = catalog-relative economical suitability — NOT live prices.
 * Later: SmartShop prices + validated nutrition datasets can refine these signals.
 */
import type {
  BudgetTier,
  MealIntentTag,
  ProteinCategory,
} from "./types";

export type DishIntentMeta = {
  mealIntents: MealIntentTag[];
  budgetTier: BudgetTier;
  proteinCategory: ProteinCategory;
};

/** Explicit curated tags per dish id — source of truth for V1 intent intelligence. */
export const DISH_INTENT_META: Record<string, DishIntentMeta> = {
  // Arab
  tabbouleh: {
    mealIntents: ["healthy", "quick", "family_friendly"],
    budgetTier: "low",
    proteinCategory: "vegetable",
  },
  fattoush: {
    mealIntents: ["healthy", "quick"],
    budgetTier: "low",
    proteinCategory: "vegetable",
  },
  mujaddara: {
    mealIntents: ["budget", "family_friendly", "healthy"],
    budgetTier: "low",
    proteinCategory: "legume",
  },
  "shorbat-adas": {
    mealIntents: ["budget", "healthy", "quick", "family_friendly"],
    budgetTier: "low",
    proteinCategory: "legume",
  },
  "sumac-chicken": {
    mealIntents: ["family_friendly", "special"],
    budgetTier: "medium",
    proteinCategory: "chicken",
  },
  "kabsa-chicken": {
    mealIntents: ["high_calorie", "special", "family_friendly"],
    budgetTier: "medium",
    proteinCategory: "chicken",
  },
  "foul-medames": {
    mealIntents: ["budget", "healthy", "quick", "family_friendly"],
    budgetTier: "low",
    proteinCategory: "legume",
  },
  // Turkish
  kofte: {
    mealIntents: ["high_calorie", "family_friendly"],
    budgetTier: "medium",
    proteinCategory: "beef",
  },
  "mercimek-corbasi": {
    mealIntents: ["budget", "healthy", "quick", "family_friendly"],
    budgetTier: "low",
    proteinCategory: "legume",
  },
  cacik: {
    mealIntents: ["healthy", "quick"],
    budgetTier: "low",
    proteinCategory: "dairy",
  },
  menemen: {
    mealIntents: ["budget", "quick", "family_friendly"],
    budgetTier: "low",
    proteinCategory: "egg",
  },
  ezogelin: {
    mealIntents: ["budget", "healthy", "family_friendly"],
    budgetTier: "low",
    proteinCategory: "legume",
  },
  "imam-bayildi": {
    mealIntents: ["healthy", "budget", "special"],
    budgetTier: "low",
    proteinCategory: "vegetable",
  },
  // Central European
  "wiener-schnitzel": {
    mealIntents: ["high_calorie", "special"],
    budgetTier: "premium",
    proteinCategory: "mixed",
  },
  gurkensalat: {
    mealIntents: ["healthy", "quick"],
    budgetTier: "low",
    proteinCategory: "vegetable",
  },
  kartoffelsuppe: {
    mealIntents: ["budget", "healthy", "family_friendly", "quick"],
    budgetTier: "low",
    proteinCategory: "vegetable",
  },
  "paprika-chicken": {
    mealIntents: ["high_calorie", "family_friendly"],
    budgetTier: "medium",
    proteinCategory: "chicken",
  },
  gulasch: {
    mealIntents: ["high_calorie", "special"],
    budgetTier: "medium",
    proteinCategory: "beef",
  },
  eiernockerl: {
    mealIntents: ["budget", "quick", "family_friendly", "high_calorie"],
    budgetTier: "low",
    proteinCategory: "egg",
  },
  // Italian
  "pomodoro-pasta": {
    mealIntents: ["budget", "quick", "family_friendly"],
    budgetTier: "low",
    proteinCategory: "none",
  },
  minestrone: {
    mealIntents: ["healthy", "budget", "family_friendly"],
    budgetTier: "low",
    proteinCategory: "vegetable",
  },
  caprese: {
    mealIntents: ["healthy", "quick", "special"],
    budgetTier: "medium",
    proteinCategory: "dairy",
  },
  "garlic-rosemary-chicken": {
    mealIntents: ["special", "family_friendly", "high_calorie"],
    budgetTier: "medium",
    proteinCategory: "chicken",
  },
  "mushroom-risotto": {
    mealIntents: ["special", "high_calorie"],
    budgetTier: "medium",
    proteinCategory: "vegetable",
  },
  "pasta-e-ceci": {
    mealIntents: ["budget", "healthy", "family_friendly"],
    budgetTier: "low",
    proteinCategory: "legume",
  },
  // Chinese
  dumplings: {
    mealIntents: ["special", "high_calorie", "family_friendly"],
    budgetTier: "medium",
    proteinCategory: "mixed",
  },
  "tomato-egg-stirfry": {
    mealIntents: ["budget", "quick", "healthy", "family_friendly"],
    budgetTier: "low",
    proteinCategory: "egg",
  },
  "cucumber-salad-smashed": {
    mealIntents: ["healthy", "quick"],
    budgetTier: "low",
    proteinCategory: "vegetable",
  },
  "egg-fried-rice": {
    mealIntents: ["budget", "quick", "high_calorie", "family_friendly"],
    budgetTier: "low",
    proteinCategory: "egg",
  },
  "ginger-soy-chicken": {
    mealIntents: ["family_friendly", "special"],
    budgetTier: "medium",
    proteinCategory: "chicken",
  },
  "mapo-tofu": {
    mealIntents: ["budget", "high_calorie", "quick", "family_friendly"],
    budgetTier: "low",
    proteinCategory: "legume",
  },
  // Indian
  "dal-tadka": {
    mealIntents: ["budget", "healthy", "quick", "family_friendly"],
    budgetTier: "low",
    proteinCategory: "legume",
  },
  "jeera-rice": {
    mealIntents: ["budget", "quick"],
    budgetTier: "low",
    proteinCategory: "none",
  },
  "cucumber-raita": {
    mealIntents: ["healthy", "quick"],
    budgetTier: "low",
    proteinCategory: "dairy",
  },
  "aloo-gobi": {
    mealIntents: ["budget", "healthy", "family_friendly"],
    budgetTier: "low",
    proteinCategory: "vegetable",
  },
  "tandoori-style-chicken": {
    mealIntents: ["special", "high_calorie"],
    budgetTier: "medium",
    proteinCategory: "chicken",
  },
  "chana-masala": {
    mealIntents: ["budget", "healthy", "quick", "family_friendly"],
    budgetTier: "low",
    proteinCategory: "legume",
  },
  // Mexican
  "street-tacos": {
    mealIntents: ["high_calorie", "family_friendly", "quick"],
    budgetTier: "medium",
    proteinCategory: "mixed",
  },
  "black-bean-soup": {
    mealIntents: ["budget", "healthy", "family_friendly"],
    budgetTier: "low",
    proteinCategory: "legume",
  },
  "mexican-rice": {
    mealIntents: ["budget", "quick"],
    budgetTier: "low",
    proteinCategory: "none",
  },
  "chicken-tinga": {
    mealIntents: ["high_calorie", "family_friendly", "special"],
    budgetTier: "medium",
    proteinCategory: "chicken",
  },
  "guacamole-plates": {
    mealIntents: ["healthy", "quick", "special"],
    budgetTier: "medium",
    proteinCategory: "vegetable",
  },
  "huevos-rancheros": {
    mealIntents: ["budget", "quick", "high_calorie", "family_friendly"],
    budgetTier: "low",
    proteinCategory: "egg",
  },
};

export function resolveDishIntentMeta(
  dishId: string,
  fallback?: Partial<DishIntentMeta>,
): DishIntentMeta {
  const curated = DISH_INTENT_META[dishId];
  if (curated) return curated;
  return {
    mealIntents: fallback?.mealIntents ?? ["family_friendly"],
    budgetTier: fallback?.budgetTier ?? "medium",
    proteinCategory: fallback?.proteinCategory ?? "mixed",
  };
}

export function auditCuisineIntentCoverage(
  dishes: Array<{
    id: string;
    cuisineFamilyId: string;
    mealSlotRole: string;
    mealIntents: MealIntentTag[];
  }>,
): Record<string, Record<MealIntentTag | "dinner_complete", number>> {
  const intents: MealIntentTag[] = [
    "budget",
    "healthy",
    "high_calorie",
    "special",
    "quick",
    "family_friendly",
  ];
  const out: Record<string, Record<string, number>> = {};
  for (const d of dishes) {
    out[d.cuisineFamilyId] ??= Object.fromEntries([
      ["dinner_complete", 0],
      ...intents.map((i) => [i, 0]),
    ]);
    if (d.mealSlotRole === "dinner_complete") {
      out[d.cuisineFamilyId]!.dinner_complete += 1;
      for (const intent of d.mealIntents) {
        out[d.cuisineFamilyId]![intent] =
          (out[d.cuisineFamilyId]![intent] ?? 0) + 1;
      }
    }
  }
  return out as Record<
    string,
    Record<MealIntentTag | "dinner_complete", number>
  >;
}
