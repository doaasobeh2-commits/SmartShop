/**
 * Explainability quality checks for daily recommendations.
 */

import {
  METABOLISM_RULES,
  NUTRITION_RULES,
  RECOVERY_RULES,
  SAFETY_RULES,
  TRAINING_RULES,
} from "../knowledge";
import { BODY_KNOWLEDGE_RULES } from "../body/bodyKnowledge";
import { ACTIVITY_REQUIREMENT_RULES } from "../activityRequirements/activityRequirementRules";
import { getScientificSource } from "../knowledge/scientificSources";
import type { FitnessBrainState } from "../types";

const KNOWN_RULE_IDS = new Set([
  ...METABOLISM_RULES.map((r) => r.id),
  ...NUTRITION_RULES.map((r) => r.id),
  ...RECOVERY_RULES.map((r) => r.id),
  ...SAFETY_RULES.map((r) => r.id),
  ...TRAINING_RULES.map((r) => r.id),
  ...BODY_KNOWLEDGE_RULES.map((r) => r.id),
  ...ACTIVITY_REQUIREMENT_RULES.map((r) => r.id),
  "brain-decision-pipeline",
  "brain-signal-aggregation",
  "brain-completeness",
  "training-recommendation",
  "activity-requirements",
  "recovery-score-bands",
  "body-engine",
  "life-pattern-engine",
]);

export function checkExplainability(state: FitnessBrainState): string[] {
  const issues: string[] = [];
  const { dailyAction } = state;
  const { explanation } = dailyAction;

  if (!dailyAction.reason?.trim()) {
    issues.push("Daily action missing main reason text");
  }
  if (!dailyAction.message?.trim()) {
    issues.push("Daily action missing message text");
  }
  if (!explanation.selectedBecause.length) {
    issues.push("Explanation missing selectedBecause factors");
  }
  if (!explanation.supportingRuleIds.length) {
    issues.push("Explanation missing supportingRuleIds");
  }
  if (!dailyAction.confidence) {
    issues.push("Daily action missing confidence level");
  }

  for (const ruleId of explanation.supportingRuleIds) {
    if (!KNOWN_RULE_IDS.has(ruleId) && !ruleId.includes("-")) {
      issues.push(`Unknown supporting rule id: ${ruleId}`);
    }
  }

  const allRules = [
    ...METABOLISM_RULES,
    ...NUTRITION_RULES,
    ...RECOVERY_RULES,
    ...TRAINING_RULES,
    ...BODY_KNOWLEDGE_RULES,
    ...ACTIVITY_REQUIREMENT_RULES,
  ];
  for (const ruleId of explanation.supportingRuleIds) {
    const rule = allRules.find((r) => r.id === ruleId);
    if (rule && "sourceIds" in rule) {
      const linked = rule.sourceIds.every((sid) => Boolean(getScientificSource(sid)));
      if (!linked) {
        issues.push(`Rule ${ruleId} has unresolved scientific source linkage`);
      }
    }
  }

  return issues;
}
