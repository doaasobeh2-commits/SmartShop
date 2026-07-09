import type { ExerciseItem, WorkoutTemplate } from "./types";

export const EXERCISE_CATALOG: ExerciseItem[] = [
  {
    id: "barbell-squat",
    name: "Barbell Squat",
    muscles: ["quads", "glutes", "core"],
    equipment: ["barbell", "rack"],
    difficulty: "intermediate",
    type: "strength",
    defaultSets: 4,
    defaultReps: "8–10",
    estMinutes: 12,
  },
  {
    id: "romanian-deadlift",
    name: "Romanian Deadlift",
    muscles: ["hamstrings", "glutes", "back"],
    equipment: ["barbell"],
    difficulty: "intermediate",
    type: "strength",
    defaultSets: 3,
    defaultReps: "10–12",
    estMinutes: 10,
  },
  {
    id: "leg-press",
    name: "Leg Press",
    muscles: ["quads", "glutes"],
    equipment: ["machine"],
    difficulty: "beginner",
    type: "strength",
    defaultSets: 3,
    defaultReps: "12–15",
    estMinutes: 8,
  },
  {
    id: "calf-raises",
    name: "Calf Raises",
    muscles: ["calves"],
    equipment: ["machine"],
    difficulty: "beginner",
    type: "strength",
    defaultSets: 4,
    defaultReps: "20",
    estMinutes: 6,
  },
  {
    id: "leg-extension",
    name: "Leg Extension",
    muscles: ["quads"],
    equipment: ["machine"],
    difficulty: "beginner",
    type: "strength",
    defaultSets: 3,
    defaultReps: "15",
    estMinutes: 6,
  },
  {
    id: "bench-press",
    name: "Bench Press",
    muscles: ["chest", "triceps", "shoulders"],
    equipment: ["barbell", "bench"],
    difficulty: "intermediate",
    type: "strength",
    defaultSets: 4,
    defaultReps: "8–10",
    estMinutes: 12,
  },
  {
    id: "pull-up",
    name: "Pull-up",
    muscles: ["back", "biceps"],
    equipment: ["pull-up bar"],
    difficulty: "intermediate",
    type: "strength",
    defaultSets: 3,
    defaultReps: "6–10",
    estMinutes: 8,
  },
];

export const EXERCISE_BY_ID: Record<string, ExerciseItem> = Object.fromEntries(
  EXERCISE_CATALOG.map((e) => [e.id, e]),
);

export const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  {
    id: "leg-day",
    title: "Leg Day",
    subtitle: "Strength · ~45 min",
    focus: "Build lower-body strength without rushing.",
    exerciseIds: ["barbell-squat", "romanian-deadlift", "leg-press", "calf-raises", "leg-extension"],
    targetMinutes: 45,
  },
  {
    id: "upper-push",
    title: "Upper Push",
    subtitle: "Strength · ~40 min",
    focus: "Chest and shoulders with controlled volume.",
    exerciseIds: ["bench-press", "leg-extension"],
    targetMinutes: 40,
  },
  {
    id: "upper-pull",
    title: "Upper Pull",
    subtitle: "Strength · ~35 min",
    focus: "Back and biceps for balanced upper-body development.",
    exerciseIds: ["pull-up", "romanian-deadlift"],
    targetMinutes: 35,
  },
];

export const WORKOUT_BY_ID: Record<string, WorkoutTemplate> = Object.fromEntries(
  WORKOUT_TEMPLATES.map((w) => [w.id, w]),
);

/** Maps app goal strings to default workout template for presentation. */
export const GOAL_WORKOUT_TEMPLATE: Record<string, string> = {
  lose: "leg-day",
  muscle: "leg-day",
  fit: "upper-pull",
  health: "upper-pull",
  sport: "upper-push",
  stress: "upper-pull",
  fat_loss: "leg-day",
  muscle_gain: "leg-day",
  maintenance: "upper-pull",
};
