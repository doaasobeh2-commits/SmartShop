/**
 * Persists Brain-generated daily training sessions and completion state.
 * Same installation scope as behavior logs — survives refresh and Brain recalculation.
 */

import type { WorkoutExercise } from "../../domain/models";
import type { TrainingRecommendation, TrainingSessionExercise } from "../types";
import {
  readInstallationScoped,
  writeInstallationScoped,
} from "../privacy/brainInstallationStorage";

export const TRAINING_SESSION_STORAGE_KEY = "training:daily-session";

export type StoredDailyTrainingSession = {
  date: string;
  sessionId: string;
  sportId?: string;
  title: string;
  exercises: WorkoutExercise[];
};

function todayDateStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadSession(): StoredDailyTrainingSession | null {
  return readInstallationScoped<StoredDailyTrainingSession>(TRAINING_SESSION_STORAGE_KEY);
}

function saveSession(session: StoredDailyTrainingSession): void {
  writeInstallationScoped(TRAINING_SESSION_STORAGE_KEY, session);
}

function toWorkoutExercise(
  item: TrainingSessionExercise,
  done: boolean,
): WorkoutExercise {
  return {
    id: item.id,
    name: item.name,
    detail: item.detail,
    done,
  };
}

/** Upsert today's session from Brain output; preserve completion by exercise id when session unchanged. */
export function syncBrainTrainingSession(
  training: TrainingRecommendation,
  date: string = todayDateStr(),
): StoredDailyTrainingSession {
  const existing = loadSession();
  const prevDone = new Map(
    existing?.date === date ? existing.exercises.map((e) => [e.id, e.done]) : [],
  );

  const brainExercises = training.exercises ?? [];
  const sessionId = training.sessionId ?? `lifestyle-${date}`;
  const sameSession =
    existing?.date === date && existing.sessionId === sessionId && existing.sportId === training.sportId;

  const exercises =
    brainExercises.length > 0
      ? brainExercises.map((ex) => toWorkoutExercise(ex, sameSession ? (prevDone.get(ex.id) ?? false) : false))
      : existing?.date === date && existing.exercises.length > 0
        ? existing.exercises
        : [];

  const session: StoredDailyTrainingSession = {
    date,
    sessionId,
    sportId: training.sportId,
    title: training.title,
    exercises,
  };

  saveSession(session);
  return session;
}

export function getTodayTrainingSession(): StoredDailyTrainingSession | null {
  const session = loadSession();
  if (!session || session.date !== todayDateStr()) return null;
  return session;
}

export function getTodayTrainingExercises(): WorkoutExercise[] {
  return getTodayTrainingSession()?.exercises ?? [];
}

export function toggleTrainingExercise(id: string, done: boolean): WorkoutExercise[] {
  const session = getTodayTrainingSession();
  if (!session) return [];

  const exercises = session.exercises.map((e) => (e.id === id ? { ...e, done } : e));
  saveSession({ ...session, exercises });
  return exercises;
}

export function setTodayTrainingExercises(exercises: WorkoutExercise[]): WorkoutExercise[] {
  const session = getTodayTrainingSession();
  if (!session) return exercises;
  saveSession({ ...session, exercises });
  return exercises;
}
