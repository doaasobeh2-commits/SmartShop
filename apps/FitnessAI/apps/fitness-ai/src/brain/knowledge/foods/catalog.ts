import type { FoodItem } from "./types";

/** Seed catalog — replace/extend via Food Knowledge Engine + future data imports. */
export const FOOD_CATALOG: FoodItem[] = [
  {
    id: "oats",
    name: "Rolled oats",
    category: "carb",
    per100g: { kcal: 389, proteinG: 16.9, carbsG: 66.3, fatG: 6.9, fibreG: 10.6, iron_mg: 4.7 },
    defaultServing: { label: "1 bowl (50 g)", grams: 50 },
    tags: ["breakfast", "fibre"],
  },
  {
    id: "chicken-breast",
    name: "Chicken breast (grilled)",
    category: "protein",
    per100g: { kcal: 165, proteinG: 31, carbsG: 0, fatG: 3.6, fibreG: 0, sodium_mg: 74 },
    defaultServing: { label: "1 portion (150 g)", grams: 150 },
    tags: ["lean-protein", "lunch", "dinner"],
  },
  {
    id: "greek-yogurt",
    name: "Greek yogurt (plain)",
    category: "dairy",
    per100g: { kcal: 97, proteinG: 9, carbsG: 3.6, fatG: 5, fibreG: 0, calcium_mg: 110 },
    defaultServing: { label: "1 cup (170 g)", grams: 170 },
    tags: ["protein", "snack"],
  },
  {
    id: "brown-rice",
    name: "Brown rice (cooked)",
    category: "carb",
    per100g: { kcal: 123, proteinG: 2.7, carbsG: 25.6, fatG: 1, fibreG: 1.6, potassium_mg: 86 },
    defaultServing: { label: "1 cup (195 g)", grams: 195 },
    tags: ["lunch", "dinner"],
  },
  {
    id: "salmon",
    name: "Salmon (baked)",
    category: "protein",
    per100g: { kcal: 208, proteinG: 20, carbsG: 0, fatG: 13, fibreG: 0, vitaminD_mcg: 11, potassium_mg: 384 },
    defaultServing: { label: "1 fillet (120 g)", grams: 120 },
    tags: ["omega-3", "dinner"],
  },
  {
    id: "banana",
    name: "Banana",
    category: "produce",
    per100g: { kcal: 89, proteinG: 1.1, carbsG: 22.8, fatG: 0.3, fibreG: 2.6, potassium_mg: 358, vitaminC_mg: 8.7 },
    defaultServing: { label: "1 medium (118 g)", grams: 118 },
    tags: ["snack", "pre-workout"],
  },
  {
    id: "eggs",
    name: "Eggs (whole)",
    category: "protein",
    per100g: { kcal: 155, proteinG: 13, carbsG: 1.1, fatG: 11, fibreG: 0, vitaminD_mcg: 2.2, iron_mg: 1.8 },
    defaultServing: { label: "2 large (100 g)", grams: 100 },
    tags: ["breakfast", "protein"],
  },
  {
    id: "broccoli",
    name: "Broccoli (steamed)",
    category: "produce",
    per100g: { kcal: 35, proteinG: 2.4, carbsG: 7.2, fatG: 0.4, fibreG: 3.3, vitaminC_mg: 64.9, calcium_mg: 40 },
    defaultServing: { label: "1 cup (156 g)", grams: 156 },
    tags: ["vegetable", "fibre"],
  },
];

export const FOOD_BY_ID: Record<string, FoodItem> = Object.fromEntries(FOOD_CATALOG.map((f) => [f.id, f]));
