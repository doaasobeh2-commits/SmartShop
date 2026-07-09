import type { Lang } from "@fitness-ai/core/types";

export type UserGoal = "lose" | "muscle" | "fit" | "health" | "sport" | "stress";
export type ActivityLevel = "sed" | "light" | "mod" | "active" | "athlete";
export type Gender = "male" | "female" | "other";
export type ExperienceLevel = "beginner" | "intermediate" | "advanced";

export type UserProfile = {
  id: string;
  displayName: string;
  email: string;
  goal: UserGoal;
  gender: Gender;
  activityLevel: ActivityLevel;
  heightCm: number;
  weightKg: number;
  age: number;
  lang: Lang;
  streakDays: number;
  memberSince: string;
  /** Set during onboarding or Lifestyle setup. */
  experienceLevel?: ExperienceLevel;
  /** Weekday indices 0–6 (Sun–Sat). Set when collected. */
  trainingDays?: number[];
  /** Dietary preferences when collected. Synced with Fitness Brain lifestyle layer. */
  foodPreferences?: string[];
};

/** Long-term lifestyle data lives in `fitnessBrain/lifestyle` (localStorage). */

export type DailyNutrition = {
  goalKcal: number;
  /** Undefined when meals not logged — unknown ≠ 0 */
  eatenKcal?: number;
  remainingKcal?: number;
  proteinGoalG?: number;
  proteinEatenG?: number;
  proteinRemainingG?: number;
  /** Undefined when water not logged */
  waterLiters?: number;
  waterGoalLiters: number;
  caloriesKnown?: boolean;
  proteinKnown?: boolean;
  waterKnown?: boolean;
  gapMessages?: string[];
};

export type DailyWorkout = {
  id: string;
  title: string;
  subtitle: string;
  durationMin: number;
  exerciseCount: number;
  completedCount: number;
  focus: string;
  /** Brain-generated session items — not a fixed template */
  exercises?: WorkoutExercise[];
  sportId?: string;
  sessionId?: string;
};

export type CoachInsight = {
  id: string;
  title: string;
  body: string;
  tone: "motivation" | "nutrition" | "recovery" | "workout";
  /** Rule id from Fitness Brain — traceable, never random. */
  ruleId?: string;
  /** Transparent reasoning for future "Why?" UI — populated by Brain, not AI. */
  explanation?: {
    id: string;
    engine: string;
    title: string;
    summary: string;
    steps: { label: string; value: string; formula?: string }[];
    references: string[];
  };
};

export type DailyPlan = {
  date: string;
  greeting: string;
  nutrition: DailyNutrition;
  workout: DailyWorkout;
  coachInsight: CoachInsight;
  recoveryNote?: string;
};

export type MealEntry = {
  id: string;
  name: string;
  timeLabel: string;
  kcal: number;
  hint?: string;
  /** Links to Food Knowledge Engine when available. */
  foodId?: string;
  servingGrams?: number;
  proteinG?: number;
};

export type WorkoutExercise = {
  id: string;
  name: string;
  detail: string;
  done: boolean;
};
