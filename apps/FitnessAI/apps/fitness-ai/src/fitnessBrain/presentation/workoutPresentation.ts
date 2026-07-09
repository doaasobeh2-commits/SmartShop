/**
 * Workout presentation — maps Brain training output to DailyPlan workout section.
 * No fixed workout templates — session comes from sport knowledge via trainingEngine.
 */

import type { DailyWorkout, WorkoutExercise } from "../../domain/models";
import type { TrainingRecommendation } from "../types";

function sportSubtitle(training: TrainingRecommendation): string {
  if (!training.sportId) {
    return "Lifestyle · light movement";
  }
  const sport = training.sportId.replace(/_/g, " ");
  const minutes = training.durationMin ?? 0;
  if (minutes <= 0) return `${sport} · recovery`;
  return `${sport} · ~${minutes} min`;
}

export function buildDailyWorkoutPresentation(
  training: TrainingRecommendation,
  loggedExercises: WorkoutExercise[],
): DailyWorkout {
  const brainExercises: WorkoutExercise[] = (training.exercises ?? []).map((ex) => {
    const logged = loggedExercises.find((l) => l.id === ex.id);
    return {
      id: ex.id,
      name: ex.name,
      detail: ex.detail,
      done: logged?.done ?? false,
    };
  });

  const completedCount = brainExercises.filter((e) => e.done).length;

  return {
    id: training.sessionId ?? training.sportId ?? "brain-session",
    title: training.title,
    subtitle: sportSubtitle(training),
    durationMin: training.durationMin ?? 0,
    exerciseCount: brainExercises.length,
    completedCount,
    focus: training.detail,
    exercises: brainExercises,
    sportId: training.sportId,
    sessionId: training.sessionId,
  };
}
