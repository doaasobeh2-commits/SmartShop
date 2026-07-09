/**
 * Safe defaults for lifestyle profile — general fitness planning only.
 */

import type { LifestyleProfile } from "./lifestyleProfile";

export const LIFESTYLE_PROFILE_VERSION = 1 as const;

export const DEFAULT_LIFESTYLE_PROFILE: LifestyleProfile = {
  version: LIFESTYLE_PROFILE_VERSION,
  updatedAt: "",
  work: {
    occupationType: "office",
    schedule: "regular_daytime",
    averageWorkingHours: 8,
  },
  training: {
    usualTrainingDays: [1, 3, 5],
    preferredTrainingTime: "evening",
    availableTrainingMinutes: 45,
    preferredExerciseCount: 5,
    gymMember: undefined,
  },
  sleep: {
    usualBedtime: "23:00",
    usualWakeTime: "07:00",
  },
  food: {
    dietaryPreferences: [],
    allergies: [],
    dislikedFoods: [],
  },
  lifestyle: {
    smoker: undefined,
    alcohol: undefined,
    dailyStressEstimate: undefined,
  },
  educationAcknowledged: false,
};

export const LIFESTYLE_STORAGE_KEY = "lifestyle:profile";
export const LIFESTYLE_PATTERNS_CACHE_KEY = "lifestyle:patterns-cache";

/** Minimum behavior log days before an emerging pattern is reported. */
export const PATTERN_MIN_DAYS_EMERGING = 7;
/** Minimum behavior log days before a pattern is considered established. */
export const PATTERN_MIN_DAYS_ESTABLISHED = 21;

/** Heuristic thresholds for lifePatternEngine — general behaviour detection only. */
export const PATTERN_THRESHOLDS = {
  weekdayMinLogs: 4,
  weekendMinLogs: 2,
  trainingDayTopRankMinCount: 2,
  trainingDayTopRankRatio: 0.5,
  weekendTrainRateLift: 0.15,
  weekendWaterRatioLift: 1.1,
  weekdayHydrationBelowWeekendRatio: 0.9,
  shiftSleepMaxHours: 6.5,
  mealLoggingMinRate: 0.6,
} as const;

/** Default normalized profile values — shared with userProfileEngine. */
export const USER_PROFILE_DEFAULTS = {
  age: 30,
  heightCm: 175,
  weightKg: 75,
  ageMin: 16,
  ageMax: 90,
  heightMin: 140,
  heightMax: 220,
  weightMin: 40,
  weightMax: 160,
} as const;
