import type { ActivityLevel, Gender, UserGoal } from "../../../../domain/models";

/** Energy expenditure formulas — evidence-backed, deterministic. */

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sed: 1.2,
  light: 1.375,
  mod: 1.55,
  active: 1.725,
  athlete: 1.9,
};

export const GOAL_ENERGY_ADJUSTMENT: Record<UserGoal, number> = {
  lose: -500,
  muscle: 300,
  fit: 0,
  health: 0,
  sport: 200,
  stress: 0,
};

export const MIN_DAILY_KCAL = 1200;

/** Mifflin–St Jeor (1990) resting metabolic rate. */
export function mifflinStJeorBmr(params: {
  gender: Gender;
  weightKg: number;
  heightCm: number;
  age: number;
}): number {
  const { gender, weightKg, heightCm, age } = params;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === "male") return base + 5;
  if (gender === "female") return base - 161;
  return base - 78;
}

export function estimateTdee(bmr: number, activity: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activity]);
}

export function dailyCalorieTarget(tdee: number, goal: UserGoal): number {
  return Math.max(Math.round(tdee + GOAL_ENERGY_ADJUSTMENT[goal]), MIN_DAILY_KCAL);
}

export function proteinGramsPerKg(goal: UserGoal): number {
  switch (goal) {
    case "lose":
      return 1.8;
    case "muscle":
      return 2.0;
    case "sport":
      return 1.7;
    default:
      return 1.6;
  }
}
