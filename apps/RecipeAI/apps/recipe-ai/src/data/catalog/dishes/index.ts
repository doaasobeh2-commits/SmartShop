import type { DishCatalogEntry } from "../types";
import { ARAB_DISHES } from "./arab";
import { CENTRAL_EUROPEAN_DISHES } from "./centralEuropean";
import { CHINESE_DISHES } from "./chinese";
import { COVERAGE_EXPANSION_DISHES } from "./coverageExpansion";
import { INDIAN_DISHES } from "./indian";
import { ITALIAN_DISHES } from "./italian";
import { MEXICAN_DISHES } from "./mexican";
import { TURKISH_DISHES } from "./turkish";

/** Curated starter catalog — deterministic demo coverage, not a recipe library. */
export const DISH_CATALOG: readonly DishCatalogEntry[] = [
  ...ARAB_DISHES,
  ...TURKISH_DISHES,
  ...CENTRAL_EUROPEAN_DISHES,
  ...ITALIAN_DISHES,
  ...CHINESE_DISHES,
  ...INDIAN_DISHES,
  ...MEXICAN_DISHES,
  ...COVERAGE_EXPANSION_DISHES,
];

export function listAllDishes(): DishCatalogEntry[] {
  return [...DISH_CATALOG];
}

export function getDishById(id: string): DishCatalogEntry | undefined {
  return DISH_CATALOG.find((dish) => dish.id === id);
}

export function listDishesByCuisine(
  cuisineFamilyId: string,
): DishCatalogEntry[] {
  return DISH_CATALOG.filter((d) => d.cuisineFamilyId === cuisineFamilyId);
}
