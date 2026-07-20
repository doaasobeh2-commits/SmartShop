import type { DayPlanIntent } from "@recipe-ai/core/types";
import type { DishCatalogEntry } from "../types";
import { isVegetarianMainDish } from "./householdCuisine";

/**
 * Day-intent fit AFTER hard safety / dinner_complete.
 * Explicit intent strongly influences the day but never bypasses safety.
 */
export function dayIntentFit(
  dish: DishCatalogEntry,
  intent: DayPlanIntent | undefined,
): number {
  const i = intent ?? "auto";
  if (i === "auto") return 0;

  switch (i) {
    case "budget":
      if (dish.budgetTier === "low") return 20;
      if (dish.budgetTier === "medium") return 4;
      return -14;
    case "healthy":
      return dish.mealIntents.includes("healthy") ? 20 : -10;
    case "light":
      if (dish.prepMinutes <= 25 && dish.difficulty === "easy") return 14;
      if (
        dish.mealIntents.includes("healthy") &&
        !dish.mealIntents.includes("high_calorie")
      ) {
        return 8;
      }
      if (dish.dietaryTags.includes("vegetarian_ok")) return 4;
      if (dish.mealIntents.includes("high_calorie")) return -12;
      return -4;
    case "high_calorie":
      return dish.mealIntents.includes("high_calorie") ? 20 : -8;
    case "special":
      if (dish.mealIntents.includes("special") || dish.specialness >= 3) {
        return 18;
      }
      return -8;
    case "quick":
      if (dish.mealIntents.includes("quick") || dish.prepMinutes <= 25) {
        return 18;
      }
      if (dish.prepMinutes <= 35 && dish.difficulty === "easy") return 6;
      return -12;
    case "vegetarian":
      return isVegetarianMainDish(dish) ? 16 : -20;
    default:
      return 0;
  }
}

export const DAY_PLAN_INTENTS: DayPlanIntent[] = [
  "auto",
  "budget",
  "healthy",
  "light",
  "high_calorie",
  "special",
  "quick",
  "vegetarian",
];
