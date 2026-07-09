import type { UserGoal } from "../../../domain/models";
import type { WorkoutExercise } from "../../../domain/models";
import type { BrainExplanation } from "../../types";
import { EXERCISE_BY_ID, WORKOUT_BY_ID, WORKOUT_TEMPLATES } from "../../knowledge/exercises/catalog";
import type { ExerciseItem, WorkoutTemplate } from "../../knowledge/exercises/types";

export type WorkoutPlan = {
  template: WorkoutTemplate;
  exercises: WorkoutExercise[];
  completedCount: number;
};

export type WorkoutEngine = {
  selectTemplate(goal: UserGoal): WorkoutTemplate;
  buildSession(templateId: string, completionState: Record<string, boolean>): WorkoutPlan;
  explain(template: WorkoutTemplate): BrainExplanation;
};

const GOAL_TEMPLATE: Record<UserGoal, string> = {
  lose: "leg-day",
  muscle: "leg-day",
  fit: "upper-pull",
  health: "upper-pull",
  sport: "upper-push",
  stress: "upper-pull",
};

export const workoutEngine: WorkoutEngine = {
  selectTemplate(goal) {
    const id = GOAL_TEMPLATE[goal] ?? "leg-day";
    return WORKOUT_BY_ID[id] ?? WORKOUT_TEMPLATES[0];
  },

  buildSession(templateId, completionState) {
    const template = WORKOUT_BY_ID[templateId] ?? WORKOUT_TEMPLATES[0];
    const exercises: WorkoutExercise[] = template.exerciseIds.map((exId) => {
      const item: ExerciseItem | undefined = EXERCISE_BY_ID[exId];
      const name = item?.name ?? exId;
      const detail = item ? `${item.defaultSets} × ${item.defaultReps}` : "";
      return {
        id: exId,
        name,
        detail,
        done: Boolean(completionState[exId]),
      };
    });
    const completedCount = exercises.filter((e) => e.done).length;
    return { template, exercises, completedCount };
  },

  explain(template) {
    const muscles = template.exerciseIds
      .flatMap((id) => EXERCISE_BY_ID[id]?.muscles ?? [])
      .filter((m, i, arr) => arr.indexOf(m) === i);

    return {
      id: `workout-${template.id}`,
      engine: "workout",
      title: "Today's workout selection",
      summary: `${template.title} targets ${muscles.join(", ")} aligned with your goal.`,
      steps: [
        { label: "Session", value: template.title },
        { label: "Duration", value: `~${template.targetMinutes} min` },
        { label: "Focus", value: template.focus },
        { label: "Muscle groups", value: muscles.join(", ") || "full body" },
      ],
      references: [],
    };
  },
};
