import type { DishCatalogEntry } from "../types";
import {
  normalizeAllergyList,
  normalizeAllergenLabel,
  normalizeDietType,
  type SupportedDietType,
} from "./allergenNormalize";
import type { DecisionContext } from "./types";

function dishAllergenSet(dish: DishCatalogEntry): Set<string> {
  const out = new Set<string>();
  for (const raw of dish.allergens ?? []) {
    const n = normalizeAllergenLabel(raw);
    if (n) out.add(n);
  }
  for (const raw of dish.mayContain ?? []) {
    const n = normalizeAllergenLabel(raw);
    if (n) out.add(n);
  }
  return out;
}

function passesDiet(dish: DishCatalogEntry, diet: SupportedDietType): boolean {
  const tags = new Set(dish.dietaryTags ?? []);
  if (diet === "normal") return true;
  if (diet === "halal") {
    return !tags.has("contains_pork") && !tags.has("contains_alcohol");
  }
  if (diet === "vegetarian") {
    return (
      tags.has("vegetarian_ok") &&
      !tags.has("contains_meat") &&
      !tags.has("contains_fish") &&
      !tags.has("contains_pork")
    );
  }
  // vegan
  return (
    tags.has("vegan_ok") &&
    !tags.has("contains_meat") &&
    !tags.has("contains_fish") &&
    !tags.has("contains_pork") &&
    !tags.has("contains_dairy") &&
    !tags.has("contains_egg")
  );
}

/**
 * V1 hard safety — household allergies + representable dietType.
 * Fail-closed: undeclared allergen metadata is never treated as safe.
 * Positive preference scoring must never reach unsafe dishes.
 */
export function isDishSafe(
  dish: DishCatalogEntry,
  allergies: string[] | undefined,
  dietType?: string | null,
): boolean {
  if (!dish.allergenDeclared) return false;

  const household = normalizeAllergyList(allergies);
  if (household.length > 0) {
    const dishSet = dishAllergenSet(dish);
    if (household.some((a) => dishSet.has(a))) return false;
  }

  return passesDiet(dish, normalizeDietType(dietType));
}

/** Fail-closed: remove unsafe and excluded dishes before any scoring. */
export function applyHardSafety(
  dishes: DishCatalogEntry[],
  ctx: Pick<DecisionContext, "allergies" | "excludeRecipeIds" | "dietType">,
): DishCatalogEntry[] {
  return dishes.filter(
    (dish) =>
      isDishSafe(dish, ctx.allergies, ctx.dietType) &&
      !ctx.excludeRecipeIds?.includes(dish.id),
  );
}

export function isSafetyBlocked(
  allDishes: DishCatalogEntry[],
  allergies: string[],
  dietType?: string | null,
): boolean {
  if (!allergies.length && normalizeDietType(dietType) === "normal") {
    return false;
  }
  return allDishes.every((dish) => !isDishSafe(dish, allergies, dietType));
}

/** Dinner / Tonight primary slots require dinner-complete meals. */
export function isDinnerComplete(dish: DishCatalogEntry): boolean {
  return dish.mealSlotRole === "dinner_complete";
}

export function filterDinnerComplete(
  dishes: DishCatalogEntry[],
): DishCatalogEntry[] {
  return dishes.filter(isDinnerComplete);
}
