import type { FoodItem, FoodPortion } from "../../knowledge/foods/types";
import { FOOD_BY_ID, FOOD_CATALOG } from "../../knowledge/foods/catalog";
import type { MacroTotals } from "../../types";

export type FoodKnowledgeEngine = {
  getById(id: string): FoodItem | undefined;
  list(): FoodItem[];
  computePortion(portion: FoodPortion): MacroTotals;
  searchByTag(tag: string): FoodItem[];
};

function scaleMacros(food: FoodItem, grams: number): MacroTotals {
  const factor = grams / 100;
  const p = food.per100g;
  return {
    kcal: Math.round(p.kcal * factor),
    proteinG: Math.round(p.proteinG * factor * 10) / 10,
    carbsG: Math.round(p.carbsG * factor * 10) / 10,
    fatG: Math.round(p.fatG * factor * 10) / 10,
    fibreG: Math.round(p.fibreG * factor * 10) / 10,
  };
}

export const foodKnowledgeEngine: FoodKnowledgeEngine = {
  getById(id) {
    return FOOD_BY_ID[id];
  },
  list() {
    return FOOD_CATALOG;
  },
  computePortion({ foodId, servingGrams }) {
    const food = FOOD_BY_ID[foodId];
    if (!food) {
      return { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0, fibreG: 0 };
    }
    return scaleMacros(food, servingGrams);
  },
  searchByTag(tag) {
    return FOOD_CATALOG.filter((f) => f.tags.includes(tag));
  },
};
