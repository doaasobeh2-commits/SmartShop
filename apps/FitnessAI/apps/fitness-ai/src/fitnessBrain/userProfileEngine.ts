/**

 * User Profile Engine — normalizes scattered user data into one profile object.

 * Defaults from lifestyle/lifestyleDefaults — single source for clamp ranges.

 * Experience and primary sport are never invented — unknown until user provides them.

 */



import { USER_PROFILE_DEFAULTS } from "./lifestyle/lifestyleDefaults";

import type {

  ActivityLevel,

  ExperienceLevel,

  FitnessGoal,

  NormalizedGender,

  NormalizedUserProfile,

  ProfileExperience,

  UserDataInput,

} from "./types";

import { getDefaultTrainingDays } from "./knowledge";



const DEFAULTS = {

  age: USER_PROFILE_DEFAULTS.age,

  heightCm: USER_PROFILE_DEFAULTS.heightCm,

  weightKg: USER_PROFILE_DEFAULTS.weightKg,

  goal: "maintenance" as FitnessGoal,

  activityLevel: "moderate" as ActivityLevel,

};



function normalizeGender(raw?: string): NormalizedGender {

  const g = (raw ?? "other").toLowerCase();

  if (g === "male" || g === "m") return "male";

  if (g === "female" || g === "f") return "female";

  return "other";

}



function normalizeGoal(raw?: string): FitnessGoal {

  const g = (raw ?? "").toLowerCase();

  if (g === "lose" || g === "fat_loss" || g === "weight_loss") return "fat_loss";

  if (g === "muscle" || g === "muscle_gain" || g === "gain") return "muscle_gain";

  return "maintenance";

}



function normalizeActivity(raw?: string): ActivityLevel {

  const map: Record<string, ActivityLevel> = {

    sed: "sedentary",

    sedentary: "sedentary",

    light: "light",

    mod: "moderate",

    moderate: "moderate",

    active: "active",

    athlete: "athlete",

  };

  return map[(raw ?? "mod").toLowerCase()] ?? DEFAULTS.activityLevel;

}



function normalizeExperience(raw?: ExperienceLevel): ProfileExperience {

  if (raw === "beginner" || raw === "intermediate" || raw === "advanced") return raw;

  return "unknown";

}



function clamp(n: number, min: number, max: number): number {

  return Math.min(Math.max(n, min), max);

}



function resolveTrainingDays(

  userData: UserDataInput,

  experience: ProfileExperience,

): number[] {

  if (Array.isArray(userData.trainingDays) && userData.trainingDays.length > 0) {

    return userData.trainingDays;

  }

  if (Array.isArray(userData.lifestyleTrainingDays) && userData.lifestyleTrainingDays.length > 0) {

    return userData.lifestyleTrainingDays;

  }

  if (experience !== "unknown") {

    return getDefaultTrainingDays(experience);

  }

  return [];

}



export function buildUserProfile(userData: UserDataInput = {}): NormalizedUserProfile {

  const heightCm = userData.heightCm ?? userData.height ?? DEFAULTS.heightCm;

  const weightKg = userData.weightKg ?? userData.weight ?? DEFAULTS.weightKg;

  const p = USER_PROFILE_DEFAULTS;

  const experienceLevel = normalizeExperience(userData.experienceLevel);



  return {

    age: clamp(userData.age ?? DEFAULTS.age, p.ageMin, p.ageMax),

    gender: normalizeGender(userData.gender),

    heightCm: clamp(heightCm, p.heightMin, p.heightMax),

    weightKg: clamp(weightKg, p.weightMin, p.weightMax),

    goal: normalizeGoal(userData.goal),

    activityLevel: normalizeActivity(userData.activityLevel),

    experienceLevel,

    foodPreferences: Array.isArray(userData.foodPreferences) ? userData.foodPreferences : [],

    trainingDays: resolveTrainingDays(userData, experienceLevel),

    ...(userData.primarySportId ? { primarySportId: userData.primarySportId } : {}),

    ...(userData.availableTrainingMinutes !== undefined

      ? { availableTrainingMinutes: clamp(userData.availableTrainingMinutes, 15, 120) }

      : {}),

    ...(userData.preferredExerciseCount !== undefined

      ? { preferredExerciseCount: clamp(userData.preferredExerciseCount, 2, 8) }

      : {}),

  };

}

