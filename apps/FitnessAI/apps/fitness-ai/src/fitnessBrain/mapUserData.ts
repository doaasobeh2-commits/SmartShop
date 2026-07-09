import type { ExperienceLevel, MealEntry, UserProfile, WorkoutExercise } from "../domain/models";
import type { BehaviorSignals } from "./storage/behaviorSignals";
import type { UserDataInput } from "./types";

export type AppBrainInput = {
  profile: UserProfile;
  meals: MealEntry[];
  exercises: WorkoutExercise[];
  /** Undefined when water not logged — unknown ≠ 0. */
  waterLiters?: number;
};

type MapExtras = {
  missedWorkoutToday?: boolean;
  trainingDaysOverride?: number[];
  foodPreferencesOverride?: string[];
  activitySummary?: {
    count: number;
    totalMinutes: number;
    lastActivityId?: string;
    lastIntensity?: string;
  };
  lifestyleTraining?: {
    primarySport?: string;
    favouriteSports?: string[];
    availableTrainingMinutes?: number;
    preferredExerciseCount?: number;
  };
};

/** Maps repository + behavior signals into Fitness Brain userData. */
export function mapAppDataToUserData(
  input: AppBrainInput,
  signals?: BehaviorSignals,
  extras?: MapExtras,
): UserDataInput {
  const proteinEatenG = input.meals.reduce((s, m) => s + (m.proteinG ?? 0), 0);
  const caloriesEaten = input.meals.reduce((s, m) => s + m.kcal, 0);
  const completed = input.exercises.filter((e) => e.done).length;
  const nutritionLogged = input.meals.length > 0;
  const waterLogged =
    (signals?.waterIntake !== undefined && signals.waterIntake > 0) ||
    (input.waterLiters !== undefined && input.waterLiters > 0);

  const primarySportId = extras?.lifestyleTraining?.primarySport;

  const experienceLevel: ExperienceLevel | undefined = input.profile.experienceLevel;
  const trainingDays =
    extras?.trainingDaysOverride ??
    (input.profile.trainingDays && input.profile.trainingDays.length > 0
      ? input.profile.trainingDays
      : undefined);
  const foodPreferences = extras?.foodPreferencesOverride ?? input.profile.foodPreferences;

  return {
    age: input.profile.age,
    gender: input.profile.gender,
    heightCm: input.profile.heightCm,
    weightKg: input.profile.weightKg,
    goal: input.profile.goal,
    activityLevel: input.profile.activityLevel,
    ...(experienceLevel ? { experienceLevel } : {}),
    ...(trainingDays && trainingDays.length > 0 ? { trainingDays, lifestyleTrainingDays: trainingDays } : {}),
    ...(foodPreferences && foodPreferences.length > 0 ? { foodPreferences } : {}),
    streakDays: input.profile.streakDays,
    adherenceScore: signals?.dailyAdherence ?? input.profile.streakDays,
    dailyAdherence: signals?.dailyAdherence,
    trainedYesterday: signals?.trainedYesterday ?? false,
    consecutiveTrainingDays: signals?.consecutiveTrainingDays ?? 0,
    lastWorkoutDate: signals?.lastWorkoutDate ?? undefined,
    sleepHours: signals?.sleepHours,
    ...(waterLogged
      ? { waterLitersConsumed: signals?.waterIntake ?? input.waterLiters }
      : {}),
    ...(signals?.proteinProgress !== undefined ? { proteinProgress: signals.proteinProgress } : {}),
    ...(signals?.calorieProgress !== undefined ? { calorieProgress: signals.calorieProgress } : {}),
    ...(nutritionLogged ? { caloriesEaten, proteinEatenG } : {}),
    ...(primarySportId ? { primarySportId } : {}),
    ...(extras?.lifestyleTraining?.availableTrainingMinutes !== undefined
      ? { availableTrainingMinutes: extras.lifestyleTraining.availableTrainingMinutes }
      : {}),
    ...(extras?.lifestyleTraining?.preferredExerciseCount !== undefined
      ? { preferredExerciseCount: extras.lifestyleTraining.preferredExerciseCount }
      : {}),
    exercisesCompletedToday: completed,
    exercisesTotalToday: input.exercises.length,
    missedWorkoutYesterday: signals?.missedWorkoutYesterday ?? false,
    missedWorkoutToday: extras?.missedWorkoutToday ?? false,
    ...(extras?.activitySummary
      ? {
          activityCountToday: extras.activitySummary.count,
          activityMinutesToday: extras.activitySummary.totalMinutes,
          lastActivityId: extras.activitySummary.lastActivityId,
          lastActivityIntensity: extras.activitySummary.lastIntensity,
        }
      : {}),
  };
}
