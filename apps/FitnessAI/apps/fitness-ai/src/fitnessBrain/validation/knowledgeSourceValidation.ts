/**
 * Validates that all knowledge rules and formulas reference entries in scientificSources.
 * Run on every brainPipeline execution (knowledge_validation stage).
 */

import { ACTIVITY_REQUIREMENT_RULES } from "../activityRequirements/activityRequirementRules";
import { BODY_KNOWLEDGE_RULES } from "../body/bodyKnowledge";
import { ACTIVITY_LIBRARY } from "../lifestyle/activityLibrary";
import {
  ACTIVITY_MET_SOURCES_BY_ID,
  type ActivityMetSource,
} from "../knowledge/activityMetSources";
import type { KnowledgeRule } from "../knowledge/evidenceLevels";
import {
  FORMULA_REGISTRY,
  SCIENTIFIC_SOURCES_BY_ID,
  type FormulaRegistryEntry,
} from "../knowledge/scientificSources";
import { SPORT_KNOWLEDGE_RULES } from "../knowledge/sportKnowledge";
import { METABOLISM_RULES } from "../knowledge/metabolismRules";
import { NUTRITION_RULES } from "../knowledge/nutritionRules";
import { RECOVERY_RULES } from "../knowledge/recoveryRules";
import { SAFETY_RULES } from "../knowledge/safetyRules";
import { TRAINING_RULES } from "../knowledge/trainingRules";

export type KnowledgeSourceValidationResult = {
  valid: boolean;
  issues: string[];
};

const ALL_KNOWLEDGE_RULES: KnowledgeRule[] = [
  ...METABOLISM_RULES,
  ...NUTRITION_RULES,
  ...RECOVERY_RULES,
  ...SAFETY_RULES,
  ...TRAINING_RULES,
  ...SPORT_KNOWLEDGE_RULES,
  ...BODY_KNOWLEDGE_RULES,
  ...ACTIVITY_REQUIREMENT_RULES,
];

function validateRuleSources(rules: { id: string; sourceIds: string[] }[]): string[] {
  const issues: string[] = [];
  for (const rule of rules) {
    if (!rule.sourceIds?.length) {
      issues.push(`Rule "${rule.id}" has no sourceIds`);
      continue;
    }
    for (const sourceId of rule.sourceIds) {
      if (!SCIENTIFIC_SOURCES_BY_ID[sourceId]) {
        issues.push(`Rule "${rule.id}" references unknown source "${sourceId}"`);
      }
    }
  }
  return issues;
}

function validateFormulaRegistry(formulas: FormulaRegistryEntry[]): string[] {
  const issues: string[] = [];
  for (const formula of formulas) {
    if (!formula.sourceIds.length) {
      issues.push(`Formula "${formula.id}" has no sourceIds`);
    }
    for (const sourceId of formula.sourceIds) {
      if (!SCIENTIFIC_SOURCES_BY_ID[sourceId]) {
        issues.push(`Formula "${formula.id}" references unknown source "${sourceId}"`);
      }
    }
  }
  return issues;
}

/** Warns when activityLibrary MET range has no overlap with Compendium reference bounds. */
function validateActivityMetAlignment(): string[] {
  const issues: string[] = [];
  for (const activity of ACTIVITY_LIBRARY) {
    const source: ActivityMetSource | undefined = ACTIVITY_MET_SOURCES_BY_ID[activity.id];
    if (!source) {
      issues.push(`Activity "${activity.id}" has no Compendium MET source mapping`);
      continue;
    }
    const { min, max } = source.referenceMetRange;
    const overlaps = activity.metMin <= max && activity.metMax >= min;
    if (!overlaps) {
      issues.push(
        `Activity "${activity.id}" MET range [${activity.metMin}, ${activity.metMax}] does not overlap Compendium reference [${min}, ${max}]`,
      );
    }
  }
  return issues;
}

export function validateKnowledgeSources(): KnowledgeSourceValidationResult {
  const issues: string[] = [
    ...validateRuleSources(ALL_KNOWLEDGE_RULES),
    ...validateFormulaRegistry(FORMULA_REGISTRY),
    ...validateActivityMetAlignment(),
  ];
  return { valid: issues.length === 0, issues };
}

export function assertKnowledgeSourcesValid(): void {
  const result = validateKnowledgeSources();
  if (!result.valid) {
    throw new Error(`Knowledge source validation failed — ${result.issues.join("; ")}`);
  }
}
