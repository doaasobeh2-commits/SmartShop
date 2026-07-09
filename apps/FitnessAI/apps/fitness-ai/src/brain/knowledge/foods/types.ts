/** Structured food knowledge — supports calorie and micronutrient calculations. */

export type MacroNutrients = {
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fibreG: number;
};

export type MicroNutrients = {
  /** mg unless noted */
  vitaminA_mcg?: number;
  vitaminC_mg?: number;
  vitaminD_mcg?: number;
  calcium_mg?: number;
  iron_mg?: number;
  potassium_mg?: number;
  sodium_mg?: number;
};

export type ServingSize = {
  label: string;
  grams: number;
};

export type FoodItem = {
  id: string;
  name: string;
  category: "protein" | "carb" | "fat" | "mixed" | "produce" | "dairy";
  per100g: MacroNutrients & Partial<MicroNutrients>;
  defaultServing: ServingSize;
  tags: string[];
};

export type FoodPortion = {
  foodId: string;
  servingGrams: number;
};
