/** Raw input from app repositories — engines normalize with safe defaults. */

import type { UserProfile } from "../domain/models";
import type { DailyBehaviorLog } from "./storage/behaviorSignals";
import type { BodyState } from "./body/bodyState";
import type { LifestyleIntelligence } from "./lifestyle/lifestyleProfile";
import type { ActivityRequirementContext } from "./activityRequirements/activityRequirementTypes";

export type FitnessGoal = "fat_loss" | "maintenance" | "muscle_gain";

export type NormalizedGender = "male" | "female" | "other";

export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "athlete";

export type ExperienceLevel = "beginner" | "intermediate" | "advanced";

/** Set only when user explicitly provided experience — never defaulted. */
export type ProfileExperience = ExperienceLevel | "unknown";

export type UserDataInput = {
  age?: number;
  gender?: string;
  heightCm?: number;
  height?: number;
  weightKg?: number;
  weight?: number;
  goal?: string;
  activityLevel?: string;
  experienceLevel?: ExperienceLevel;
  foodPreferences?: string[];
  trainingDays?: number[];
  streakDays?: number;
  trainedYesterday?: boolean;
  consecutiveTrainingDays?: number;
  adherenceScore?: number;
  dailyAdherence?: number;
  sleepHours?: number;
  waterLitersConsumed?: number;
  waterIntake?: number;
  caloriesEaten?: number;
  proteinEatenG?: number;
  exercisesCompletedToday?: number;
  exercisesTotalToday?: number;
  lastWorkoutDate?: string | null;
  proteinProgress?: number;
  calorieProgress?: number;
  missedWorkoutYesterday?: boolean;
  missedWorkoutToday?: boolean;
  /** From lifestyle layer — effective training days (learned + profile). */
  lifestyleTrainingDays?: number[];
  activityMinutesToday?: number;
  activityCountToday?: number;
  lastActivityIntensity?: string;
  lastActivityId?: string;
  /** Primary sport — set at onboarding */
  primarySportId?: string;
  availableTrainingMinutes?: number;
  preferredExerciseCount?: number;
};

export type NormalizedUserProfile = {
  age: number;
  gender: NormalizedGender;
  heightCm: number;
  weightKg: number;
  goal: FitnessGoal;
  activityLevel: ActivityLevel;
  experienceLevel: ProfileExperience;
  foodPreferences: string[];
  trainingDays: number[];
  /** Primary sport from onboarding / lifestyle — drives sport knowledge */
  primarySportId?: string;
  availableTrainingMinutes?: number;
  preferredExerciseCount?: number;
};

export type MetabolismResult = {
  bmrKcal: number;
  tdeeKcal: number;
  dailyCalorieTarget: number;
  goalAdjustmentKcal: number;
  formula: "mifflin-st-jeor";
  disclaimer: string;
};

export type NutritionTargets = {
  proteinG: number;
  fatG: number;
  carbohydratesG: number;
  waterLiters: number;
  fiberG: number;
  disclaimer: string;
};

export type TrainingSessionExercise = {
  id: string;
  name: string;
  detail: string;
  estMinutes?: number;
};

export type TrainingRecommendation = {
  type: "workout" | "rest" | "light_activity" | "walking";
  title: string;
  detail: string;
  isTrainingDay: boolean;
  disclaimer: string;
  /** Primary sport used for this session */
  sportId?: string;
  sessionId?: string;
  durationMin?: number;
  exercises?: TrainingSessionExercise[];
  supportingRuleIds?: string[];
  rationale?: string[];
};

export type RecoveryLevel =
  | "low_recovery"
  | "normal_recovery"
  | "good_recovery"
  | "overtraining_risk"
  | "neutral";

export type RecoveryAssessment = {
  level: RecoveryLevel;
  /** @deprecated Use level — kept for internal rule mapping */
  status: "ready" | "caution" | "rest_suggested" | "neutral";
  score: number;
  summary: string;
  disclaimer: string;
};

export type ExplanationEvidenceLevel = "strong" | "moderate" | "limited" | "heuristic";

export type DailyActionExplanation = {
  selectedBecause: string[];
  supportingRuleIds: string[];
  blockedBySafetyRules: string[];
  evidenceLevel: ExplanationEvidenceLevel;
  userSignalsUsed: string[];
};

export type DailyAction = {
  id: string;
  title: string;
  message: string;
  reason: string;
  priority: number;
  nutritionFocus: string;
  trainingFocus: string;
  confidence: "high" | "medium" | "low";
  params: Record<string, string | number>;
  explanation: DailyActionExplanation;
};

/** Internal candidate before localization and safety finalization. */
export type DailyActionCandidate = {
  id: string;
  priority: number;
  nutritionFocus: string;
  trainingFocus: string;
  params: Record<string, string | number>;
  sortScore: number;
  selectedBecause: string[];
  supportingRuleIds: string[];
  userSignalsUsed: string[];
};

export type FitnessBrainState = {
  userProfile: NormalizedUserProfile;
  metabolism: MetabolismResult;
  nutrition: NutritionTargets;
  training: TrainingRecommendation;
  recovery: RecoveryAssessment;
  dailyAction: DailyAction;
  lifestyle: LifestyleIntelligence;
  /** Internal readiness score 0–100 — not shown in UI yet. */
  brainCompleteness: number;
  /** Hidden physiological context from logged activities. */
  activityRequirements: ActivityRequirementContext;
  /** Unified body response model — hidden from UI. */
  bodyState: BodyState;
};

export type DecisionContext = {
  userProfile: NormalizedUserProfile;
  metabolism: MetabolismResult;
  nutrition: NutritionTargets;
  training: TrainingRecommendation;
  recovery: RecoveryAssessment;
  userData: UserDataInput;
  lifestyle: LifestyleIntelligence;
  activityRequirements: ActivityRequirementContext;
  bodyState: BodyState;
  clock?: BrainValidationClock;
};

export type BrainValidationClock = {
  /** 0–23 — fixes time-of-day decision thresholds in validation runs. */
  hour: number;
  /** 0=Sun … 6=Sat — fixes training-day logic in validation runs. */
  dayOfWeek: number;
};

export type GenerateFitnessBrainOptions = {
  appProfile?: UserProfile;
  behaviorLogs?: DailyBehaviorLog[];
  activityLogs?: import("./activity/types").ActivityLogEntry[];
  /** Deterministic clock for validation/tests — production omits this. */
  clock?: BrainValidationClock;
};
