/**
 * Engine validation utilities — independent checks for Brain outputs.
 * Used in brainPipeline knowledge_validation stage and automated test suites.
 */

import { NUTRITION_VALUES, RECOVERY_VALUES } from "../knowledge";
import type { FitnessBrainState, MetabolismResult, NutritionTargets, RecoveryAssessment } from "../types";
import {
  validateKnowledgeSources,
  type KnowledgeSourceValidationResult,
} from "./knowledgeSourceValidation";

export type EngineValidationResult = {
  engine: string;
  valid: boolean;
  issues: string[];
};

export function validateMetabolism(metabolism: MetabolismResult): EngineValidationResult {
  const issues: string[] = [];
  if (metabolism.bmrKcal <= 0) issues.push("BMR must be positive");
  if (metabolism.tdeeKcal < metabolism.bmrKcal) issues.push("TDEE must be >= BMR");
  if (metabolism.dailyCalorieTarget < NUTRITION_VALUES.minDailyKcal) {
    issues.push(`Daily target below minimum (${NUTRITION_VALUES.minDailyKcal} kcal)`);
  }
  if (metabolism.formula !== "mifflin-st-jeor") {
    issues.push("Metabolism must use mifflin-st-jeor formula");
  }
  return { engine: "metabolism", valid: issues.length === 0, issues };
}

export function validateNutrition(
  nutrition: NutritionTargets,
  metabolism: MetabolismResult,
): EngineValidationResult {
  const issues: string[] = [];
  if (nutrition.proteinG <= 0) issues.push("Protein target must be positive");
  if (nutrition.waterLiters <= 0) issues.push("Water target must be positive");
  if (nutrition.fiberG < 0) issues.push("Fiber target must be non-negative");
  if (nutrition.fatG <= 0) issues.push("Fat target must be positive");
  if (nutrition.carbohydratesG < 0) issues.push("Carbohydrate target must be non-negative");

  const macroKcal = nutrition.proteinG * 4 + nutrition.fatG * 9 + nutrition.carbohydratesG * 4;
  const targetKcal = metabolism.dailyCalorieTarget;
  const delta = Math.abs(macroKcal - targetKcal);
  if (delta > targetKcal * 0.08) {
    issues.push(
      `Macro calories (${macroKcal}) diverge from daily target (${targetKcal}) by more than 8%`,
    );
  }
  return { engine: "nutrition", valid: issues.length === 0, issues };
}

export function validateRecovery(recovery: RecoveryAssessment): EngineValidationResult {
  const issues: string[] = [];
  if (recovery.score < RECOVERY_VALUES.scoreMin || recovery.score > RECOVERY_VALUES.scoreMax) {
    issues.push(`Recovery score out of range (${RECOVERY_VALUES.scoreMin}–${RECOVERY_VALUES.scoreMax})`);
  }
  if (!recovery.disclaimer) issues.push("Recovery disclaimer required");
  return { engine: "recovery", valid: issues.length === 0, issues };
}

export function validateBodyState(state: FitnessBrainState): EngineValidationResult {
  const issues: string[] = [];
  if (state.bodyState.readinessScore < 0 || state.bodyState.readinessScore > 100) {
    issues.push("Body readiness score must be 0–100");
  }
  if (state.bodyState.supportingRuleIds.length === 0) {
    issues.push("Body state must reference supporting knowledge rules");
  }
  return { engine: "body", valid: issues.length === 0, issues };
}

export type BrainValidationReport = {
  engineResults: EngineValidationResult[];
  sourceValidation: KnowledgeSourceValidationResult;
  valid: boolean;
};

/** Runs all engine validators and knowledge source linkage checks against a full Brain state. */
export function validateBrainState(state: FitnessBrainState): BrainValidationReport {
  const sourceValidation = validateKnowledgeSources();
  const engineResults: EngineValidationResult[] = [
    validateMetabolism(state.metabolism),
    validateNutrition(state.nutrition, state.metabolism),
    validateRecovery(state.recovery),
    validateBodyState(state),
  ];
  const valid =
    sourceValidation.valid && engineResults.every((r) => r.valid);
  return { engineResults, sourceValidation, valid };
}

export function assertBrainStateValid(state: FitnessBrainState): void {
  const report = validateBrainState(state);
  if (!report.valid) {
    const engineFailures = report.engineResults
      .filter((r) => !r.valid)
      .map((f) => `${f.engine}: ${f.issues.join("; ")}`);
    const all = [...engineFailures, ...report.sourceValidation.issues];
    throw new Error(`Brain validation failed — ${all.join(" | ")}`);
  }
}
