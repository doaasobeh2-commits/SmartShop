import type { UserGoal } from "../../../../domain/models";
import { proteinGramsPerKg } from "./energyExpenditure";

/** Macronutrient planning formulas — reproducible, explainable. */

export function dailyProteinTargetG(weightKg: number, goal: UserGoal): number {
  return Math.round(weightKg * proteinGramsPerKg(goal));
}

/** ~28% of calories from fat (within AMDR 20–35%). */
export function dailyFatTargetG(calorieTarget: number): number {
  return Math.round((calorieTarget * 0.28) / 9);
}

export function dailyCarbsTargetG(calorieTarget: number, proteinG: number, fatG: number): number {
  const remainingKcal = calorieTarget - proteinG * 4 - fatG * 9;
  return Math.max(Math.round(remainingKcal / 4), 0);
}

/** 14 g fibre per 1000 kcal (Dietary Guidelines heuristic). */
export function dailyFibreTargetG(calorieTarget: number): number {
  return Math.round((calorieTarget / 1000) * 14);
}

export function roundKcal(value: number): number {
  return Math.round(value);
}

export function roundMacroG(value: number): number {
  return Math.round(value * 10) / 10;
}
