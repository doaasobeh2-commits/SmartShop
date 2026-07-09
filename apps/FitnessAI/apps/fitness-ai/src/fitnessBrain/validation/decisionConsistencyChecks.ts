/**
 * Cross-engine consistency checks for a full Brain state.
 */

import { METABOLISM_VALUES } from "../knowledge";
import type { FitnessBrainState } from "../types";

export function checkDecisionConsistency(state: FitnessBrainState): string[] {
  const issues: string[] = [];
  const { metabolism, nutrition, recovery, dailyAction, training } = state;

  const macroKcal =
    nutrition.proteinG * 4 + nutrition.fatG * 9 + nutrition.carbohydratesG * 4;
  const targetKcal = metabolism.dailyCalorieTarget;
  const macroDelta = Math.abs(macroKcal - targetKcal);
  if (macroDelta > targetKcal * 0.08) {
    issues.push(
      `Macro sum (${macroKcal} kcal) diverges from calorie target (${targetKcal} kcal) by ${Math.round(macroDelta)} kcal`,
    );
  }

  if (metabolism.bmrKcal <= 0) issues.push("BMR must be positive");
  if (metabolism.tdeeKcal < metabolism.bmrKcal) issues.push("TDEE must be >= BMR");
  if (recovery.score < 0 || recovery.score > 100) {
    issues.push(`Recovery score ${recovery.score} outside 0–100`);
  }

  if (
    (recovery.level === "overtraining_risk" || recovery.level === "low_recovery") &&
    dailyAction.id === "complete_workout"
  ) {
    issues.push(
      `Contradiction: recovery is ${recovery.level} but top action is complete_workout`,
    );
  }

  if (dailyAction.trainingFocus === "rest" && dailyAction.id === "complete_workout") {
    issues.push("Contradiction: trainingFocus is rest but action is complete_workout");
  }

  if (
    dailyAction.nutritionFocus === "hydration" &&
    dailyAction.id.startsWith("protein") &&
    dailyAction.id !== "post_activity_protein"
  ) {
    issues.push("Contradiction: hydration nutrition focus with protein-only action id");
  }

  if (training.type === "rest" && dailyAction.id === "complete_workout") {
    issues.push("Contradiction: training recommendation is rest but action pushes complete_workout");
  }

  const pal = metabolism.tdeeKcal / metabolism.bmrKcal;
  const expectedPal = METABOLISM_VALUES.activityMultipliers[state.userProfile.activityLevel];
  if (Math.abs(pal - expectedPal) > 0.01) {
    issues.push(`PAL mismatch: TDEE/BMR=${pal.toFixed(2)} expected ${expectedPal}`);
  }

  return issues;
}

export function checkMetabolismExpectations(
  state: FitnessBrainState,
  expect: import("./personaExpectations").MetabolismExpectations | undefined,
): string[] {
  if (!expect) return [];
  const issues: string[] = [];
  const { metabolism, nutrition, userProfile } = state;

  if (expect.dailyTargetBelowTdee && metabolism.dailyCalorieTarget >= metabolism.tdeeKcal) {
    issues.push(
      `Expected daily target below TDEE (${metabolism.dailyCalorieTarget} vs ${metabolism.tdeeKcal})`,
    );
  }
  if (expect.dailyTargetAboveTdee && metabolism.dailyCalorieTarget <= metabolism.tdeeKcal) {
    issues.push(
      `Expected daily target above TDEE (${metabolism.dailyCalorieTarget} vs ${metabolism.tdeeKcal})`,
    );
  }
  if (
    expect.goalAdjustmentNearZero &&
    Math.abs(metabolism.goalAdjustmentKcal) > 50
  ) {
    issues.push(`Expected near-zero goal adjustment, got ${metabolism.goalAdjustmentKcal}`);
  }
  if (expect.minProteinPerKg) {
    const gPerKg = nutrition.proteinG / userProfile.weightKg;
    if (gPerKg < expect.minProteinPerKg - 0.05) {
      issues.push(`Protein ${gPerKg.toFixed(2)} g/kg below minimum ${expect.minProteinPerKg}`);
    }
  }
  if (expect.maxActivityMultiplier) {
    const pal = metabolism.tdeeKcal / metabolism.bmrKcal;
    if (pal > expect.maxActivityMultiplier + 0.01) {
      issues.push(`PAL ${pal.toFixed(2)} exceeds max ${expect.maxActivityMultiplier}`);
    }
  }
  if (expect.minActivityMultiplier) {
    const pal = metabolism.tdeeKcal / metabolism.bmrKcal;
    if (pal < expect.minActivityMultiplier - 0.01) {
      issues.push(`PAL ${pal.toFixed(2)} below min ${expect.minActivityMultiplier}`);
    }
  }

  return issues;
}

export function checkActivityCaloriesReasonable(
  activityLogs: import("../activity/types").ActivityLogEntry[] | undefined,
  weightKg: number,
): string[] {
  if (!activityLogs?.length) return [];
  const issues: string[] = [];
  for (const log of activityLogs) {
    const expected = log.estimatedMET * weightKg * (log.durationMinutes / 60);
    const delta = Math.abs(log.estimatedCalories - expected);
    if (delta > expected * 0.05 + 1) {
      issues.push(
        `Activity ${log.activityId} kcal ${log.estimatedCalories} diverges from MET formula (${Math.round(expected)})`,
      );
    }
    if (log.estimatedCalories < 0 || log.estimatedCalories > weightKg * log.durationMinutes) {
      issues.push(`Activity ${log.activityId} kcal ${log.estimatedCalories} outside reasonable range`);
    }
  }
  return issues;
}
