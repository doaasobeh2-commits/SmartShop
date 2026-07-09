import type {
  EnergySystem,
  ImportanceLevel,
  RecoveryPriority,
} from "../lifestyle/activityLibrary";

export type ActivityIntensity = "light" | "moderate" | "hard";

export type UiActivityCategoryId =
  | "strength"
  | "cardio"
  | "cycling"
  | "swimming"
  | "walking"
  | "running"
  | "team_sports"
  | "combat_sports"
  | "yoga_mobility"
  | "outdoor"
  | "other";

/** Persisted activity log — rich Brain data, minimal user input. */
export type ActivityLogEntry = {
  id: string;
  activityId: string;
  activityCategory: UiActivityCategoryId;
  durationMinutes: number;
  intensity: ActivityIntensity;
  estimatedMET: number;
  estimatedCalories: number;
  energySystem: EnergySystem;
  recoveryPriority: RecoveryPriority;
  hydrationImportance: ImportanceLevel;
  proteinImportance: ImportanceLevel;
  date: string;
  time: string;
  optionalNote?: string;
  localInstallationId: string;
  loggedAt: string;
};

export type SaveActivityLogInput = {
  activityId: string;
  durationMinutes: number;
  intensity: ActivityIntensity;
  optionalNote?: string;
  weightKg?: number;
};

export type TodayActivitySummary = {
  count: number;
  totalMinutes: number;
  lastActivityId?: string;
  lastIntensity?: ActivityIntensity;
  estimatedCaloriesTotal: number;
};

export type ActivityLearningSnapshot = {
  favouriteActivities: { activityId: string; count: number }[];
  typicalDurationByActivity: Record<string, number>;
  mostCommonDurationOverall: number;
  typicalWorkoutTime: string | null;
  averageWeeklyFrequency: number;
  preferredIntensity: ActivityIntensity | null;
  mostActiveWeekdays: number[];
};
