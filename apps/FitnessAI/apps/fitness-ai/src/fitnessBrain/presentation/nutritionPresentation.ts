/**
 * Nutrition presentation — unknown ≠ zero for UI adapters.
 */

import type { DailyNutrition } from "../../domain/models";
import type { UserDataInput } from "../types";
import {
  caloriesEatenValue,
  hydrationValue,
  isHydrationKnown,
  isNutritionKnown,
  proteinEatenValue,
} from "../explainability/evidenceSignals";

export type NutritionPresentation = DailyNutrition & {
  caloriesKnown: boolean;
  proteinKnown: boolean;
  waterKnown: boolean;
  gapMessages: string[];
};

export function buildNutritionPresentation(
  userData: UserDataInput | undefined,
  goals: { goalKcal: number; proteinGoalG: number; waterGoalLiters: number },
): NutritionPresentation {
  const nutritionKnown = userData ? isNutritionKnown(userData) : false;
  const hydrationKnown = userData ? isHydrationKnown(userData) : false;

  const eatenKcal = userData ? caloriesEatenValue(userData) : undefined;
  const proteinEatenG = userData ? proteinEatenValue(userData) : undefined;
  const waterLiters = userData ? hydrationValue(userData) : undefined;

  const gapMessages: string[] = [];
  if (!nutritionKnown) {
    gapMessages.push(
      "Today's nutrition cannot be evaluated — meal data is incomplete or not logged.",
    );
  }
  if (!hydrationKnown) {
    gapMessages.push(
      "Hydration is unknown — log water before intake can be assessed (missing ≠ 0%).",
    );
  }

  return {
    goalKcal: goals.goalKcal,
    eatenKcal: nutritionKnown && eatenKcal !== undefined ? eatenKcal : undefined,
    remainingKcal:
      nutritionKnown && eatenKcal !== undefined
        ? Math.max(goals.goalKcal - eatenKcal, 0)
        : undefined,
    proteinGoalG: goals.proteinGoalG,
    proteinEatenG: nutritionKnown && proteinEatenG !== undefined ? Math.round(proteinEatenG) : undefined,
    proteinRemainingG:
      nutritionKnown && proteinEatenG !== undefined
        ? Math.max(Math.round(goals.proteinGoalG - proteinEatenG), 0)
        : undefined,
    waterLiters: hydrationKnown && waterLiters !== undefined ? waterLiters : undefined,
    waterGoalLiters: goals.waterGoalLiters,
    caloriesKnown: nutritionKnown,
    proteinKnown: nutritionKnown,
    waterKnown: hydrationKnown,
    gapMessages,
  };
}
