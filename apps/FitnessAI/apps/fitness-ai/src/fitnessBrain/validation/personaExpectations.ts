/**
 * Expected decision behavior per golden persona.
 */

import type { RecoveryLevel } from "../types";

export type MetabolismExpectations = {
  goal?: "fat_loss" | "maintenance" | "muscle_gain";
  dailyTargetBelowTdee?: boolean;
  dailyTargetAboveTdee?: boolean;
  goalAdjustmentNearZero?: boolean;
  minProteinPerKg?: number;
  maxActivityMultiplier?: number;
  minActivityMultiplier?: number;
};

export type PersonaExpectations = {
  rationale: string;
  /** Acceptable daily action IDs (top recommendation must be one of these). */
  shouldPrioritize?: string[];
  /** Daily action IDs that must NOT be selected as top recommendation. */
  mustNotRecommend?: string[];
  minConfidence?: "high" | "medium" | "low";
  maxConfidence?: "high" | "medium" | "low";
  trainingMustInclude?: string[];
  trainingMustNotInclude?: string[];
  recoveryLevelIn?: RecoveryLevel[];
  nutritionFocusIn?: string[];
  metabolism?: MetabolismExpectations;
  validationMustPass?: boolean;
  allowLowConfidence?: boolean;
};

const CONFIDENCE_RANK = { low: 1, medium: 2, high: 3 } as const;

export function confidenceMeetsMinimum(
  actual: "high" | "medium" | "low",
  minimum: "high" | "medium" | "low",
): boolean {
  return CONFIDENCE_RANK[actual] >= CONFIDENCE_RANK[minimum];
}

export function confidenceWithinMaximum(
  actual: "high" | "medium" | "low",
  maximum: "high" | "medium" | "low",
): boolean {
  return CONFIDENCE_RANK[actual] <= CONFIDENCE_RANK[maximum];
}
