/**
 * Normalized lifestyle profile — information entered once, edited occasionally.
 * Not requested daily. Powers long-term Fitness Brain intelligence.
 * All fields must pass `privacy/isAllowedLifestyleField` before storage.
 */

export type OccupationType = "office" | "standing" | "physical" | "mixed";

export type WorkSchedule = "regular_daytime" | "evening" | "night_shift" | "rotating_shifts";

export type PreferredTrainingTime = "morning" | "midday" | "afternoon" | "evening" | "flexible";

export type AlcoholFrequency = "none" | "rare" | "moderate" | "frequent";

export type StressLevel = "low" | "moderate" | "high";

export type LifestyleProfile = {
  version: 1;
  updatedAt: string;
  work: {
    occupationType?: OccupationType;
    schedule?: WorkSchedule;
    averageWorkingHours?: number;
  };
  training: {
    /** Activity library IDs, e.g. strength_training, running */
    favouriteSports?: string[];
    /** Primary sport selected at onboarding — drives sport knowledge */
    primarySport?: string;
    usualTrainingDays?: number[];
    preferredTrainingTime?: PreferredTrainingTime;
    gymMember?: boolean;
    /** User preference — session length cap in minutes */
    availableTrainingMinutes?: number;
    /** User preference — target number of exercises/items */
    preferredExerciseCount?: number;
  };
  sleep: {
    /** 24h "HH:mm" */
    usualBedtime?: string;
    usualWakeTime?: string;
  };
  food: {
    dietaryPreferences?: string[];
    allergies?: string[];
    dislikedFoods?: string[];
  };
  lifestyle: {
    smoker?: boolean;
    alcohol?: AlcoholFrequency;
    dailyStressEstimate?: StressLevel;
  };
  /** User acknowledged one-time lifestyle education copy */
  educationAcknowledged?: boolean;
};

import type { ActivityLearningSnapshot } from "../activity/types";

export type LifestyleProfileInput = Partial<Omit<LifestyleProfile, "version" | "updatedAt">> & {
  work?: Partial<LifestyleProfile["work"]>;
  training?: Partial<LifestyleProfile["training"]>;
  sleep?: Partial<LifestyleProfile["sleep"]>;
  food?: Partial<LifestyleProfile["food"]>;
  lifestyle?: Partial<LifestyleProfile["lifestyle"]>;
};

export type LifePatternType =
  | "usual_training_days"
  | "late_sleep_after_shifts"
  | "weekend_more_movement"
  | "weekday_low_hydration"
  | "weekend_higher_hydration"
  | "consistent_meal_logging"
  | "morning_workout_tendency";

export type LifePatternConfidence = "emerging" | "established";

/** Learned long-term behaviour — not predictions. */
export type LifePattern = {
  id: string;
  type: LifePatternType;
  /** Internal description for Brain traceability */
  description: string;
  confidence: LifePatternConfidence;
  evidenceDays: number;
  detectedAt: string;
  payload: Record<string, string | number | boolean | number[]>;
};

export type BrainCompletenessFactorId =
  | "profile_core"
  | "goal_defined"
  | "body_measurements"
  | "lifestyle_work"
  | "lifestyle_training"
  | "lifestyle_sleep"
  | "lifestyle_food"
  | "training_habits_known"
  | "nutrition_habits_known"
  | "sleep_habits_known";

export type BrainCompletenessFactor = {
  id: BrainCompletenessFactorId;
  weight: number;
  filled: boolean;
  partial: boolean;
};

export type BrainCompleteness = {
  score: number;
  factors: BrainCompletenessFactor[];
};

export type LifestyleIntelligence = {
  profile: LifestyleProfile;
  patterns: LifePattern[];
  completeness: BrainCompleteness;
  activityLearning: ActivityLearningSnapshot;
};
