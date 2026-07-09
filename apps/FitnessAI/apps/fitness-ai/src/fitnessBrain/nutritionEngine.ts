/**
 * Nutrition Engine — daily macro and hydration targets from rule-based knowledge.
 * Protein: ISSN g/kg · Fat: IOM AMDR · Carbs: remainder · Water: EFSA-aligned heuristic.
 * @see knowledge/nutritionRules, knowledge/scientificSources — protein-target, fat-target, hydration-target
 */



import {

  getEngineDisclaimer,

  getFiberGrams,

  getProteinGramsPerKg,

  getWaterLiters,

  NUTRITION_VALUES,

} from "./knowledge";

import type { MetabolismResult, NormalizedUserProfile, NutritionTargets } from "./types";



export function calculateNutrition(

  profile: NormalizedUserProfile,

  metabolism: MetabolismResult,

): NutritionTargets {

  const kcal = metabolism.dailyCalorieTarget;

  const proteinG = Math.round(profile.weightKg * getProteinGramsPerKg(profile.goal));

  const fatG = Math.round((kcal * NUTRITION_VALUES.fatKcalPercent) / 9);

  const carbsKcal = kcal - proteinG * 4 - fatG * 9;

  const carbohydratesG = Math.max(Math.round(carbsKcal / 4), 0);

  const waterLiters = getWaterLiters(profile.weightKg);

  const fiberG = getFiberGrams(kcal);



  return {

    proteinG,

    fatG,

    carbohydratesG,

    waterLiters,

    fiberG,

    disclaimer: getEngineDisclaimer("nutrition"),

  };

}


