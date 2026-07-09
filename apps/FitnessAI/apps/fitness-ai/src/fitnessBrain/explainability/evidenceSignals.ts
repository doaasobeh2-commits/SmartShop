/**
 * Evidence signals — known vs unknown user data.
 * Pre-launch principle: missing information is never treated as zero.
 * @see knowledge/brainPhilosophy
 */

import type { UserDataInput } from "../types";

function fieldPresent(userData: UserDataInput, key: keyof UserDataInput): boolean {
  if (!(key in userData)) return false;
  const value = userData[key];
  return value !== undefined && value !== null && !(typeof value === "number" && Number.isNaN(value));
}

/** User has logged water intake today (unknown ≠ 0 %). */
export function isHydrationKnown(userData: UserDataInput): boolean {
  return fieldPresent(userData, "waterLitersConsumed") || fieldPresent(userData, "waterIntake");
}

/** User has logged meals / calorie intake today (unknown ≠ low protein). */
export function isNutritionKnown(userData: UserDataInput): boolean {
  if (fieldPresent(userData, "calorieProgress")) return true;
  if (fieldPresent(userData, "proteinProgress")) return true;
  if (fieldPresent(userData, "caloriesEaten")) return true;
  if (fieldPresent(userData, "proteinEatenG")) return true;
  return false;
}

/** Sleep duration recorded — unknown ≠ poor sleep. */
export function isSleepKnown(userData: UserDataInput): boolean {
  return fieldPresent(userData, "sleepHours");
}

/** Training load signals present for recovery beyond profile defaults. */
export function isRecoveryEvidencePresent(userData: UserDataInput): boolean {
  return (
    (userData.consecutiveTrainingDays ?? 0) > 0 ||
    userData.trainedYesterday === true ||
    (userData.exercisesCompletedToday ?? 0) > 0 ||
    (userData.activityMinutesToday ?? 0) > 0 ||
    isSleepKnown(userData)
  );
}

export function hydrationValue(userData: UserDataInput): number | undefined {
  if (!isHydrationKnown(userData)) return undefined;
  return userData.waterLitersConsumed ?? userData.waterIntake;
}

export function proteinEatenValue(userData: UserDataInput): number | undefined {
  if (!isNutritionKnown(userData)) return undefined;
  return userData.proteinEatenG;
}

export function caloriesEatenValue(userData: UserDataInput): number | undefined {
  if (!isNutritionKnown(userData)) return undefined;
  return userData.caloriesEaten;
}

export type MissingEvidence = "hydration" | "nutrition" | "sleep";

export function listMissingEvidence(userData: UserDataInput, hour: number): MissingEvidence[] {
  const missing: MissingEvidence[] = [];
  if (hour >= 10 && !isHydrationKnown(userData)) missing.push("hydration");
  if (hour >= 12 && !isNutritionKnown(userData)) missing.push("nutrition");
  if (!isSleepKnown(userData) && isRecoveryEvidencePresent(userData)) missing.push("sleep");
  return missing;
}
