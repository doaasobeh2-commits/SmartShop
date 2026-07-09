/**
 * Detects which user behavior signals are present vs defaulted.
 */

import { EXPLAINABILITY_VALUES } from "../knowledge";
import type { UserDataInput } from "../types";

const TRACKED_SIGNALS: (keyof UserDataInput)[] = [
  "consecutiveTrainingDays",
  "trainedYesterday",
  "sleepHours",
  "dailyAdherence",
  "adherenceScore",
  "waterIntake",
  "waterLitersConsumed",
  "proteinEatenG",
  "proteinProgress",
  "caloriesEaten",
  "calorieProgress",
  "missedWorkoutYesterday",
  "missedWorkoutToday",
  "exercisesCompletedToday",
  "streakDays",
  "lastWorkoutDate",
];

export type UserSignalSnapshot = {
  presentSignals: string[];
  missingSignals: string[];
  defaultsHeavy: boolean;
};

function isPresent(userData: UserDataInput, key: keyof UserDataInput): boolean {
  if (!(key in userData)) return false;
  const value = userData[key];
  if (value === undefined || value === null) return false;
  if (typeof value === "number" && Number.isNaN(value)) return false;
  return true;
}

export function snapshotUserSignals(userData: UserDataInput): UserSignalSnapshot {
  const presentSignals: string[] = [];
  const missingSignals: string[] = [];

  for (const key of TRACKED_SIGNALS) {
    if (isPresent(userData, key)) presentSignals.push(key);
    else missingSignals.push(key);
  }

  const defaultsHeavy =
    presentSignals.length <= EXPLAINABILITY_VALUES.defaultsHeavyMaxPresentSignals;

  return { presentSignals, missingSignals, defaultsHeavy };
}

export function countMatchingSignals(
  presentSignals: string[],
  requiredSignals: string[],
): number {
  const aliases: Record<string, string[]> = {
    waterIntake: ["waterIntake", "waterLitersConsumed"],
    dailyAdherence: ["dailyAdherence", "adherenceScore"],
  };

  let count = 0;
  for (const signal of requiredSignals) {
    const keys = aliases[signal] ?? [signal];
    if (keys.some((k) => presentSignals.includes(k))) count += 1;
  }
  return count;
}
