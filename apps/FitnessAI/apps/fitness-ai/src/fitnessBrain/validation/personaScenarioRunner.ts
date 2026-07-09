/**
 * Runs one golden persona through runBrainPipeline and evaluates expectations.
 */

import { runBrainPipeline } from "../pipeline";
import type { BrainValidationReport } from "./engineValidators";
import {
  checkActivityCaloriesReasonable,
  checkDecisionConsistency,
  checkMetabolismExpectations,
} from "./decisionConsistencyChecks";
import { checkExplainability } from "./explainabilityChecks";
import type { GoldenPersona } from "./goldenPersonas";
import {
  confidenceMeetsMinimum,
  confidenceWithinMaximum,
} from "./personaExpectations";

export type PersonaValidationResult = {
  personaId: string;
  label: string;
  passed: boolean;
  failures: string[];
  warnings: string[];
  dailyActionId: string;
  dailyActionTitle: string;
  confidence: string;
  recoveryLevel: string;
  recoveryScore: number;
  trainingTitle: string;
  rationale: string;
  validation: BrainValidationReport;
};

export function validatePersonaScenario(persona: GoldenPersona): PersonaValidationResult {
  const { state, validation } = runBrainPipeline(persona.userData, {
    activityLogs: persona.activityLogs,
    behaviorLogs: persona.behaviorLogs,
    clock: persona.clock,
  });

  const failures: string[] = [];
  const warnings: string[] = [];
  const expect = persona.expectations;

  if (expect.validationMustPass && !validation.valid) {
    for (const r of validation.engineResults.filter((e) => !e.valid)) {
      failures.push(`Engine ${r.engine}: ${r.issues.join("; ")}`);
    }
  }

  failures.push(...checkDecisionConsistency(state));
  failures.push(...checkMetabolismExpectations(state, expect.metabolism));
  failures.push(
    ...checkActivityCaloriesReasonable(persona.activityLogs, state.userProfile.weightKg),
  );
  failures.push(...checkExplainability(state));

  if (expect.shouldPrioritize?.length) {
    if (!expect.shouldPrioritize.includes(state.dailyAction.id)) {
      failures.push(
        `Expected top action in [${expect.shouldPrioritize.join(", ")}] but got "${state.dailyAction.id}" (${state.dailyAction.title})`,
      );
    }
  }

  if (expect.mustNotRecommend?.includes(state.dailyAction.id)) {
    failures.push(`Must not recommend "${state.dailyAction.id}" for this persona`);
  }

  if (expect.minConfidence && !confidenceMeetsMinimum(state.dailyAction.confidence, expect.minConfidence)) {
    failures.push(
      `Confidence ${state.dailyAction.confidence} below minimum ${expect.minConfidence}`,
    );
  }

  if (expect.maxConfidence && !confidenceWithinMaximum(state.dailyAction.confidence, expect.maxConfidence)) {
    failures.push(
      `Confidence ${state.dailyAction.confidence} above maximum ${expect.maxConfidence}`,
    );
  }

  if (expect.recoveryLevelIn && !expect.recoveryLevelIn.includes(state.recovery.level)) {
    failures.push(
      `Recovery level ${state.recovery.level} not in expected [${expect.recoveryLevelIn.join(", ")}]`,
    );
  }

  if (expect.nutritionFocusIn && !expect.nutritionFocusIn.includes(state.dailyAction.nutritionFocus)) {
    failures.push(
      `Nutrition focus "${state.dailyAction.nutritionFocus}" not in expected [${expect.nutritionFocusIn.join(", ")}]`,
    );
  }

  for (const fragment of expect.trainingMustInclude ?? []) {
    if (!state.training.title.includes(fragment)) {
      failures.push(`Training title "${state.training.title}" should include "${fragment}"`);
    }
  }

  for (const fragment of expect.trainingMustNotInclude ?? []) {
    if (state.training.title.includes(fragment)) {
      failures.push(`Training title "${state.training.title}" must not include "${fragment}"`);
    }
  }

  if (expect.allowLowConfidence && state.dailyAction.confidence !== "low") {
    warnings.push(
      `Expected low confidence for sparse data but got ${state.dailyAction.confidence}`,
    );
  }

  return {
    personaId: persona.id,
    label: persona.label,
    passed: failures.length === 0,
    failures,
    warnings,
    dailyActionId: state.dailyAction.id,
    dailyActionTitle: state.dailyAction.title,
    confidence: state.dailyAction.confidence,
    recoveryLevel: state.recovery.level,
    recoveryScore: state.recovery.score,
    trainingTitle: state.training.title,
    rationale: expect.rationale,
    validation,
  };
}
