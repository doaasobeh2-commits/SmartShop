import { useCallback, useEffect, useState } from "react";
import type { WorkoutExercise } from "../domain/models";
import { workoutRepository } from "../data/repositories/mockRepositories";

export function useTodayWorkout() {
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    workoutRepository.getTodayExercises().then((data) => {
      if (active) {
        setExercises(data);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const toggleExercise = useCallback(async (id: string, done: boolean) => {
    await workoutRepository.toggleExercise(id, done);
    setExercises(await workoutRepository.getTodayExercises());
  }, []);

  const completed = exercises.filter((e) => e.done).length;

  return { exercises, completed, toggleExercise, loading };
}
