/**
 * Builds Fitness Brain userData from app repositories + persisted behavior signals.
 */

import { getTodayActivitySummary, getRecentActivityLogs } from "./activity/activityLogStorage";
import { getBrainInput } from "../data/repositories/mockRepositories";
import { resolveEffectiveTrainingDays, buildLifestyleIntelligence } from "./lifestyle";
import { calculateMetabolism } from "./metabolismEngine";
import { calculateNutrition } from "./nutritionEngine";
import { mapAppDataToUserData } from "./mapUserData";
import { buildUserProfile } from "./userProfileEngine";
import {
  computeBehaviorSignals,
  getBehaviorLogs,
  syncDailyBehaviorLog,
} from "./storage/behaviorSignals";
import type { UserDataInput } from "./types";

function yesterdayWasTrainingDay(trainingDays: number[]): boolean {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return trainingDays.includes(d.getDay());
}

function todayIsTrainingDay(trainingDays: number[]): boolean {
  return trainingDays.includes(new Date().getDay());
}

/** Syncs behavior logs and merges signals into Brain input. */
export async function buildFitnessBrainUserData(): Promise<UserDataInput> {
  const input = await getBrainInput();
  const activitySummary = getTodayActivitySummary();
  const activityLogs = getRecentActivityLogs();
  const todayLog = syncDailyBehaviorLog(input, activitySummary);
  const logs = getBehaviorLogs();

  const lifestyle = buildLifestyleIntelligence({
    appProfile: input.profile,
    behaviorLogs: logs,
    activityLogs,
  });

  const effectiveTrainingDays = resolveEffectiveTrainingDays(
    lifestyle,
    input.profile.trainingDays,
  );

  const partialProfile = {
    age: input.profile.age,
    gender: input.profile.gender,
    heightCm: input.profile.heightCm,
    weightKg: input.profile.weightKg,
    goal: input.profile.goal,
    activityLevel: input.profile.activityLevel,
    experienceLevel: input.profile.experienceLevel,
    foodPreferences:
      input.profile.foodPreferences ?? lifestyle.profile.food.dietaryPreferences,
    trainingDays: effectiveTrainingDays,
    lifestyleTrainingDays: effectiveTrainingDays,
  };

  const userProfile = buildUserProfile(partialProfile);
  const metabolism = calculateMetabolism(userProfile);
  const nutrition = calculateNutrition(userProfile, metabolism);

  const trainingDays = userProfile.trainingDays;
  const signals = computeBehaviorSignals(
    logs,
    todayLog,
    {
      proteinGoalG: nutrition.proteinG,
      calorieTargetKcal: metabolism.dailyCalorieTarget,
      waterGoalLiters: nutrition.waterLiters,
    },
    input.profile.streakDays,
    yesterdayWasTrainingDay(trainingDays),
  );

  const completed = input.exercises.filter((e) => e.done).length;
  const hour = new Date().getHours();
  const missedWorkoutToday =
    todayIsTrainingDay(trainingDays) &&
    hour >= 17 &&
    completed === 0 &&
    activitySummary.count === 0;

  return mapAppDataToUserData(input, signals, {
    missedWorkoutToday,
    trainingDaysOverride: effectiveTrainingDays,
    foodPreferencesOverride: partialProfile.foodPreferences,
    activitySummary: {
      count: activitySummary.count,
      totalMinutes: activitySummary.totalMinutes,
      lastActivityId: activitySummary.lastActivityId,
      lastIntensity: activitySummary.lastIntensity,
    },
    lifestyleTraining: lifestyle.profile.training,
  });
}
