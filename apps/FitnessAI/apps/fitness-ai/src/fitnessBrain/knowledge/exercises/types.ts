/** Structured exercise knowledge — workout presentation only. */

export type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "quads"
  | "hamstrings"
  | "glutes"
  | "calves"
  | "core";

export type ExerciseType = "strength" | "cardio" | "mobility" | "hybrid";
export type Difficulty = "beginner" | "intermediate" | "advanced";

export type ExerciseItem = {
  id: string;
  name: string;
  muscles: MuscleGroup[];
  equipment: string[];
  difficulty: Difficulty;
  type: ExerciseType;
  defaultSets: number;
  defaultReps: string;
  estMinutes: number;
};

export type WorkoutTemplate = {
  id: string;
  title: string;
  subtitle: string;
  focus: string;
  exerciseIds: string[];
  targetMinutes: number;
};
