import { describe, expect, it } from "vitest";
import { runBrainQualityValidation } from "./qualityValidation";
import { runBrainPipeline } from "../pipeline";
import {
  getTodayTrainingExercises,
  syncBrainTrainingSession,
  toggleTrainingExercise,
} from "../storage/trainingSessionStorage";
import { installValidationStorage } from "./testSetup";

describe("Fitness Brain — golden persona quality validation", () => {
  const report = runBrainQualityValidation();

  it("all knowledge source linkages valid", () => {
    expect(report.personas.every((p) => p.validation.sourceValidation.valid)).toBe(true);
  });

  for (const persona of report.personas) {
    it(`${persona.personaId}: ${persona.label}`, () => {
      if (!persona.passed) {
        console.error(`Failures for ${persona.personaId}:`, persona.failures);
      }
      expect(persona.failures, persona.failures.join("\n")).toEqual([]);
    });
  }

  it("launch readiness gate", () => {
    expect(report.launchReady).toBe(true);
  });
});

describe("Fitness Brain — training session persistence", () => {
  it("preserves exercise completion across Brain recalculation", () => {
    installValidationStorage();
    const userData = {
      age: 28,
      gender: "male",
      heightCm: 180,
      weightKg: 78,
      goal: "muscle",
      activityLevel: "active",
      experienceLevel: "intermediate" as const,
      primarySportId: "bodybuilding",
      trainingDays: [1, 3, 5],
      caloriesEaten: 2000,
      proteinEatenG: 120,
      waterLitersConsumed: 2,
      sleepHours: 7,
    };
    const { state } = runBrainPipeline(userData, { clock: { hour: 10, dayOfWeek: 1 } });
    syncBrainTrainingSession(state.training);
    const firstId = state.training.exercises?.[0]?.id;
    expect(firstId).toBeTruthy();
    toggleTrainingExercise(firstId!, true);

    const { state: state2 } = runBrainPipeline(userData, { clock: { hour: 11, dayOfWeek: 1 } });
    syncBrainTrainingSession(state2.training);
    const exercises = getTodayTrainingExercises();
    const done = exercises.find((e) => e.id === firstId)?.done;
    expect(done).toBe(true);
  });
});
