import type { BehavioralSignal } from "./BehavioralSignal";

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export type RecipeSignalInput = {
  householdId: string;
  recipeId: string;
  recipeName: string;
  cuisineTags?: string[];
  ingredientNames?: string[];
};

function buildPayload(input: RecipeSignalInput): Record<string, string | number | boolean> {
  const payload: Record<string, string | number | boolean> = {
    recipeId: input.recipeId,
    recipeName: input.recipeName.trim().toLowerCase(),
  };

  if (input.cuisineTags?.length) {
    payload.cuisineTags = input.cuisineTags.map((tag) => tag.trim().toLowerCase()).join(",");
  }

  if (input.ingredientNames?.length) {
    payload.ingredients = input.ingredientNames
      .map((name) => name.trim().toLowerCase())
      .join(",");
  }

  return payload;
}

export function extractRecipeAcceptedSignal(
  input: RecipeSignalInput,
  observedAt = new Date().toISOString(),
): BehavioralSignal {
  return {
    id: createId("sig"),
    householdId: input.householdId,
    source: "recipe_ai",
    category: "recipe_accepted",
    observedAt,
    payload: buildPayload(input),
    weight: 1.2,
  };
}

export function extractRecipeRejectedSignal(
  input: RecipeSignalInput,
  observedAt = new Date().toISOString(),
): BehavioralSignal {
  return {
    id: createId("sig"),
    householdId: input.householdId,
    source: "recipe_ai",
    category: "recipe_rejected",
    observedAt,
    payload: buildPayload(input),
    weight: 1,
  };
}

export function extractMealCookedSignal(
  input: RecipeSignalInput,
  observedAt = new Date().toISOString(),
): BehavioralSignal {
  return {
    id: createId("sig"),
    householdId: input.householdId,
    source: "recipe_ai",
    category: "meal_cooked",
    observedAt,
    payload: buildPayload(input),
    weight: 1.5,
  };
}

export function extractRecipeSignals(
  input: RecipeSignalInput,
  action: "accepted" | "rejected" | "cooked",
  observedAt = new Date().toISOString(),
): BehavioralSignal {
  if (action === "rejected") {
    return extractRecipeRejectedSignal(input, observedAt);
  }
  if (action === "cooked") {
    return extractMealCookedSignal(input, observedAt);
  }
  return extractRecipeAcceptedSignal(input, observedAt);
}
