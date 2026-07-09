/**
 * Internal sample cases for Fitness Brain — no test runner required.
 * Import and call runBrainSampleCases() during development.
 */

import { generateFitnessBrainState } from "../fitnessBrain";
import type { UserDataInput } from "../types";
import { seedBehaviorLogs, type DailyBehaviorLog } from "../storage/behaviorSignals";

export type BrainSampleCase = {
  id: string;
  label: string;
  userData: UserDataInput;
  behaviorSeed?: DailyBehaviorLog[];
};

const today = new Date().toISOString().slice(0, 10);
const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
const twoDaysAgo = new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10);

export const BRAIN_SAMPLE_CASES: BrainSampleCase[] = [
  {
    id: "fat_loss_beginner",
    label: "Fat loss · beginner",
    userData: {
      age: 24,
      gender: "female",
      heightCm: 165,
      weightKg: 72,
      goal: "lose",
      activityLevel: "light",
      experienceLevel: "beginner",
      trainingDays: [1, 3, 5],
      streakDays: 4,
      dailyAdherence: 55,
      caloriesEaten: 900,
      proteinEatenG: 45,
      proteinProgress: 0.35,
      calorieProgress: 0.45,
      waterLitersConsumed: 0.8,
      consecutiveTrainingDays: 0,
      trainedYesterday: false,
    },
  },
  {
    id: "muscle_gain_intermediate",
    label: "Muscle gain · intermediate",
    userData: {
      age: 30,
      gender: "male",
      heightCm: 180,
      weightKg: 82,
      goal: "muscle",
      activityLevel: "active",
      experienceLevel: "intermediate",
      trainingDays: [1, 2, 4, 5],
      streakDays: 12,
      dailyAdherence: 78,
      caloriesEaten: 2100,
      proteinEatenG: 140,
      proteinProgress: 0.85,
      calorieProgress: 0.75,
      waterLitersConsumed: 2.4,
      consecutiveTrainingDays: 2,
      trainedYesterday: true,
      exercisesCompletedToday: 0,
      exercisesTotalToday: 5,
    },
  },
  {
    id: "tired_user",
    label: "Tired user · high load",
    userData: {
      age: 35,
      gender: "male",
      heightCm: 178,
      weightKg: 80,
      goal: "fit",
      activityLevel: "mod",
      experienceLevel: "intermediate",
      trainingDays: [1, 3, 5],
      streakDays: 20,
      dailyAdherence: 65,
      sleepHours: 5.5,
      consecutiveTrainingDays: 4,
      trainedYesterday: true,
      caloriesEaten: 1800,
      proteinEatenG: 100,
      waterLitersConsumed: 1.5,
    },
    behaviorSeed: [
      { date: twoDaysAgo, trained: true, workoutCompleted: true, waterLiters: 2, proteinEatenG: 120, caloriesEaten: 2200 },
      { date: yesterday, trained: true, workoutCompleted: false, waterLiters: 1.6, proteinEatenG: 90, caloriesEaten: 1900 },
      { date: today, trained: false, workoutCompleted: false, waterLiters: 1.5, proteinEatenG: 60, caloriesEaten: 1200 },
    ],
  },
  {
    id: "low_protein_day",
    label: "Low protein day",
    userData: {
      age: 28,
      gender: "female",
      heightCm: 170,
      weightKg: 65,
      goal: "lose",
      activityLevel: "mod",
      experienceLevel: "beginner",
      trainingDays: [2, 4, 6],
      streakDays: 8,
      proteinEatenG: 35,
      proteinProgress: 0.28,
      caloriesEaten: 1400,
      calorieProgress: 0.7,
      waterLitersConsumed: 1.2,
      consecutiveTrainingDays: 1,
      trainedYesterday: false,
    },
  },
  {
    id: "rest_day",
    label: "Rest day · Sunday",
    userData: {
      age: 40,
      gender: "male",
      heightCm: 175,
      weightKg: 78,
      goal: "health",
      activityLevel: "light",
      experienceLevel: "intermediate",
      trainingDays: [1, 3, 5],
      streakDays: 15,
      dailyAdherence: 80,
      consecutiveTrainingDays: 0,
      trainedYesterday: true,
      caloriesEaten: 1600,
      proteinEatenG: 110,
      proteinProgress: 0.75,
      waterLitersConsumed: 2.1,
    },
  },
];

export type BrainSampleResult = {
  caseId: string;
  label: string;
  dailyActionId: string;
  recoveryLevel: string;
  priority: number;
};

/** Run all sample cases in memory (does not mutate production storage unless seed provided). */
export function runBrainSampleCases(): BrainSampleResult[] {
  return BRAIN_SAMPLE_CASES.map((sample) => {
    if (sample.behaviorSeed) {
      seedBehaviorLogs(sample.behaviorSeed);
    }
    const state = generateFitnessBrainState(sample.userData);
    return {
      caseId: sample.id,
      label: sample.label,
      dailyActionId: state.dailyAction.id,
      recoveryLevel: state.recovery.level,
      priority: state.dailyAction.priority,
    };
  });
}
