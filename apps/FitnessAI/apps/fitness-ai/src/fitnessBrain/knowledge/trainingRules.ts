/**
 * Training knowledge rules — frequency, rest, and movement guidance.
 * General activity guidance — not a personalised exercise prescription.
 */

import type { ExperienceLevel, NormalizedUserProfile } from "../types";
import type { KnowledgeRule } from "./evidenceLevels";

export const TRAINING_RULES: KnowledgeRule[] = [
  {
    id: "beginner-frequency",
    description: "Beginners benefit from full-body sessions with adequate recovery between days.",
    evidenceLevel: "moderate",
    sourceCategory: "resistance_training_guidelines",
    recommendation: "Schedule 2–3 resistance sessions per week with rest or light movement on other days.",
    sourceIds: ["acsm-exercise-prescription"],
  },
  {
    id: "intermediate-frequency",
    description: "Intermediate lifters can tolerate more weekly volume with planned splits.",
    evidenceLevel: "moderate",
    sourceCategory: "resistance_training_guidelines",
    recommendation: "Schedule 3–5 training days per week based on split and recovery capacity.",
    sourceIds: ["acsm-exercise-prescription"],
  },
  {
    id: "rest-day-logic",
    description: "Planned rest supports adaptation between harder sessions.",
    evidenceLevel: "moderate",
    sourceCategory: "resistance_training_guidelines",
    recommendation: "On non-training days, prioritise rest or easy movement instead of hard sessions.",
    sourceIds: ["acsm-recovery-training", "acsm-exercise-prescription"],
  },
  {
    id: "progressive-overload-basics",
    description: "Gradual increases in load, reps, or sets drive strength and muscle adaptations.",
    evidenceLevel: "strong",
    sourceCategory: "resistance_training_guidelines",
    recommendation: "Increase training stress slowly over weeks — form and recovery come first.",
    sourceIds: ["acsm-exercise-prescription"],
  },
  {
    id: "light-activity-recommendation",
    description: "Low-intensity movement supports daily health and active recovery.",
    evidenceLevel: "moderate",
    sourceCategory: "public_health_guidelines",
    recommendation: "Use 20–30 min walks or easy mobility on rest or low-recovery days.",
    sourceIds: ["compendium-met-2011", "acsm-exercise-prescription"],
  },
  {
    id: "fat-loss-walking",
    description: "Easy aerobic movement can complement resistance training for fat-loss goals.",
    evidenceLevel: "limited",
    sourceCategory: "public_health_guidelines",
    recommendation: "Prefer active recovery walks on non-lifting days when the goal is fat loss.",
    sourceIds: ["compendium-met-2011", "nice-weight-loss-deficit"],
  },
];

export const TRAINING_VALUES = {
  defaultTrainingDays: [1, 3, 5] as number[],
  advancedTrainingDays: [1, 2, 4, 5] as number[],
  sessionsPerWeek: {
    beginner: { min: 2, max: 3 },
    intermediate: { min: 3, max: 5 },
    advanced: { min: 4, max: 6 },
  } satisfies Record<ExperienceLevel, { min: number; max: number }>,
  walkDurationMin: 20,
  walkDurationMax: 30,
} as const;

export type SessionTemplate = {
  key: string;
  type: "workout" | "rest" | "light_activity" | "walking";
  title: string;
  detail: string;
};

export const SESSION_TEMPLATES: Record<string, SessionTemplate> = {
  leg_strength: {
    key: "leg_strength",
    type: "workout",
    title: "Lower body strength",
    detail: "Squat pattern, hinges, and controlled volume — ~45 min.",
  },
  upper_strength: {
    key: "upper_strength",
    type: "workout",
    title: "Upper body strength",
    detail: "Push and pull patterns with moderate sets — ~40 min.",
  },
  full_beginner: {
    key: "full_beginner",
    type: "workout",
    title: "Full-body basics",
    detail: "Simple compound movements, focus on form — ~30 min.",
  },
  rest: {
    key: "rest",
    type: "rest",
    title: "Planned rest",
    detail: "Recovery helps adaptation. Light stretching is optional.",
  },
  walk: {
    key: "walk",
    type: "walking",
    title: "Active recovery walk",
    detail: `${TRAINING_VALUES.walkDurationMin}–${TRAINING_VALUES.walkDurationMax} min easy pace — supports recovery and daily movement.`,
  },
  light: {
    key: "light",
    type: "light_activity",
    title: "Light movement",
    detail: "Mobility, easy cycling, or a short walk — keep it easy.",
  },
};

export function getDefaultTrainingDays(experience: ExperienceLevel): number[] {
  const { sessionsPerWeek, defaultTrainingDays, advancedTrainingDays } = TRAINING_VALUES;
  if (experience === "advanced") return [...advancedTrainingDays];
  if (sessionsPerWeek[experience].max <= 3) return [1, 3, 5];
  return [...defaultTrainingDays];
}

export function pickSessionKey(profile: NormalizedUserProfile, isTrainingDay: boolean): string {
  if (!isTrainingDay) {
    if (profile.goal === "fat_loss") return "walk";
    return profile.activityLevel === "sedentary" ? "walk" : "light";
  }
  if (profile.experienceLevel === "beginner") return "full_beginner";
  if (profile.experienceLevel === "advanced") {
    const dow = new Date().getDay();
    if (dow % 3 === 1) return "upper_strength";
    if (dow % 3 === 2) return "leg_strength";
    return "full_beginner";
  }
  if (profile.goal === "muscle_gain") return "leg_strength";
  if (profile.goal === "fat_loss") return "upper_strength";
  return "full_beginner";
}
