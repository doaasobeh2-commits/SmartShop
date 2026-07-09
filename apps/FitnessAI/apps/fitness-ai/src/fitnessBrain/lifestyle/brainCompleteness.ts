/**
 * Brain Completeness Score — internal readiness of Fitness Brain data (0–100).
 */

import type { UserDataInput, NormalizedUserProfile } from "../types";
import type { DailyBehaviorLog } from "../storage/behaviorSignals";
import type { ActivityLogEntry } from "../activity/types";
import type {
  BrainCompleteness,
  BrainCompletenessFactor,
  LifePattern,
  LifestyleProfile,
} from "./lifestyleProfile";
import { isLifestyleProfileCustomized } from "./lifestyleStorage";

function sectionFilled(obj: Record<string, unknown> | undefined, minKeys = 1): boolean {
  if (!obj) return false;
  return Object.values(obj).filter((v) => v !== undefined && v !== null && v !== "").length >= minKeys;
}

function sectionPartial(obj: Record<string, unknown> | undefined): boolean {
  if (!obj) return false;
  return Object.values(obj).some((v) => v !== undefined && v !== null && v !== "");
}

export function computeBrainCompleteness(
  userProfile: NormalizedUserProfile,
  lifestyle: LifestyleProfile,
  patterns: LifePattern[],
  userData: UserDataInput,
  behaviorLogs: DailyBehaviorLog[],
  activityLogs: ActivityLogEntry[] = [],
): BrainCompleteness {
  const profileCore =
    userProfile.age > 0 &&
    userProfile.heightCm > 0 &&
    userProfile.weightKg > 0 &&
    userProfile.gender !== undefined;

  const goalDefined = userProfile.goal !== undefined;
  const bodyMeasurements = userProfile.heightCm > 0 && userProfile.weightKg > 0;

  const lifestyleWork = sectionFilled(lifestyle.work as Record<string, unknown>, 2);
  const lifestyleWorkPartial = sectionPartial(lifestyle.work as Record<string, unknown>);

  const lifestyleTraining =
    (lifestyle.training.usualTrainingDays?.length ?? 0) > 0 ||
    lifestyle.training.primarySport !== undefined;
  const lifestyleTrainingPartial = sectionPartial(lifestyle.training as Record<string, unknown>);

  const lifestyleSleep =
    Boolean(lifestyle.sleep.usualBedtime) && Boolean(lifestyle.sleep.usualWakeTime);
  const lifestyleSleepPartial = sectionPartial(lifestyle.sleep as Record<string, unknown>);

  const lifestyleFood =
    (lifestyle.food.dietaryPreferences?.length ?? 0) > 0 ||
    (lifestyle.food.allergies?.length ?? 0) > 0;
  const lifestyleFoodPartial = sectionPartial(lifestyle.food as Record<string, unknown>);

  const trainingHabitsKnown =
    patterns.some((p) => p.type === "usual_training_days") ||
    activityLogs.length >= 3 ||
    (userProfile.trainingDays?.length ?? 0) > 0 ||
    userData.consecutiveTrainingDays !== undefined;

  const nutritionLogs = behaviorLogs.filter((l) => l.caloriesEaten > 0);
  const nutritionHabitsKnown =
    patterns.some((p) => p.type === "consistent_meal_logging") ||
    nutritionLogs.length >= 7 ||
    userData.caloriesEaten !== undefined;

  const sleepLogs = behaviorLogs.filter((l) => l.sleepHours !== undefined);
  const sleepHabitsKnown =
    sleepLogs.length >= 3 ||
    userData.sleepHours !== undefined ||
    lifestyleSleep;

  const factors: BrainCompletenessFactor[] = [
    { id: "profile_core", weight: 15, filled: profileCore, partial: profileCore },
    { id: "goal_defined", weight: 10, filled: goalDefined, partial: goalDefined },
    { id: "body_measurements", weight: 10, filled: bodyMeasurements, partial: bodyMeasurements },
    {
      id: "lifestyle_work",
      weight: 10,
      filled: lifestyleWork || isLifestyleProfileCustomized(lifestyle),
      partial: lifestyleWorkPartial,
    },
    { id: "lifestyle_training", weight: 12, filled: lifestyleTraining, partial: lifestyleTrainingPartial },
    { id: "lifestyle_sleep", weight: 8, filled: lifestyleSleep, partial: lifestyleSleepPartial },
    { id: "lifestyle_food", weight: 8, filled: lifestyleFood, partial: lifestyleFoodPartial },
    { id: "training_habits_known", weight: 12, filled: trainingHabitsKnown, partial: trainingHabitsKnown },
    { id: "nutrition_habits_known", weight: 8, filled: nutritionHabitsKnown, partial: nutritionLogs.length >= 3 },
    { id: "sleep_habits_known", weight: 7, filled: sleepHabitsKnown, partial: sleepLogs.length >= 1 || lifestyleSleepPartial },
  ];

  const totalWeight = factors.reduce((s, f) => s + f.weight, 0);
  let earned = 0;
  for (const f of factors) {
    if (f.filled) earned += f.weight;
    else if (f.partial) earned += f.weight * 0.5;
  }

  const score = Math.round(Math.min(Math.max((earned / totalWeight) * 100, 0), 100));

  return { score, factors };
}
