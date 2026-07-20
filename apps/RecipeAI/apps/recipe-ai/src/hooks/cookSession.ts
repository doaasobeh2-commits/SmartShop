import type { MealRecommendation } from "@recipe-ai/core/types";

/** Deep-ish snapshot so Tonight re-ranking cannot mutate Cook Mode steps. */
export function freezeCookSessionMeal(
  source: MealRecommendation,
): MealRecommendation {
  return {
    ...source,
    ingredients: source.ingredients.map((i) => ({ ...i })),
    steps: source.steps.map((s) => ({ ...s })),
    tips: [...source.tips],
    reasonCodes: source.reasonCodes ? [...source.reasonCodes] : undefined,
    companions: source.companions?.map((c) => ({
      recipeId: c.recipeId,
      title: c.title,
      imageUrl: c.imageUrl,
    })),
  };
}

/** cook-start must never write a cooked/completed memory event. */
export function cookStartWritesCookedEvent(): false {
  return false;
}

export function isCookSessionActive(
  frozenMeal: MealRecommendation | null | undefined,
): boolean {
  return frozenMeal != null;
}

/**
 * During Cook/Feedback, live Tonight refresh must not replace the active recipe.
 */
export function mayMutateTonightMeal(cookSessionActive: boolean): boolean {
  return !cookSessionActive;
}
