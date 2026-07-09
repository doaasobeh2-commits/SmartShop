/**
 * Safety filter — keeps Smart Focus within general fitness guidance.
 */

import type { DailyAction, DailyActionCandidate } from "../types";

const MEDICAL_DIAGNOSIS_PATTERNS = [
  /\bdiagnos/i,
  /\bdisorder\b/i,
  /\bdisease\b/i,
  /\bcondition\b/i,
  /\byou have\b/i,
  /\bclinical\b/i,
];

const TREATMENT_PATTERNS = [
  /\btreat(ment|ing)?\b/i,
  /\bmedication\b/i,
  /\bprescrib/i,
  /\bsupplement as treatment\b/i,
  /\bcure\b/i,
];

const SAFE_FALLBACK_ID = "steady_progress";

const ALWAYS_APPLIED_SAFETY_RULES = ["general-fitness-guidance-only", "no-disease-diagnosis", "no-treatment-advice"];

export type SafetyFilterResult = {
  action: DailyActionCandidate;
  blockedBySafetyRules: string[];
  wasAdjusted: boolean;
};

function textViolatesSafety(text: string): string[] {
  const blocked: string[] = [];
  for (const pattern of MEDICAL_DIAGNOSIS_PATTERNS) {
    if (pattern.test(text)) blocked.push("no-disease-diagnosis");
  }
  for (const pattern of TREATMENT_PATTERNS) {
    if (pattern.test(text)) blocked.push("no-treatment-advice");
  }
  return [...new Set(blocked)];
}

function buildSafeFallback(original: DailyActionCandidate): DailyActionCandidate {
  return {
    id: SAFE_FALLBACK_ID,
    priority: 50,
    nutritionFocus: "consistency",
    trainingFocus: original.trainingFocus,
    params: { streakDays: 0 },
    sortScore: 500,
    selectedBecause: [
      "Original recommendation was adjusted to general fitness guidance for safety.",
      ...original.selectedBecause,
    ],
    supportingRuleIds: ["general-fitness-guidance-only", "high-adherence-support"],
    userSignalsUsed: original.userSignalsUsed,
  };
}

export function applySafetyFilterToCandidate(
  candidate: DailyActionCandidate,
  localizedText: Pick<DailyAction, "title" | "message" | "reason">,
): SafetyFilterResult {
  const violations = [
    ...textViolatesSafety(localizedText.title),
    ...textViolatesSafety(localizedText.message),
    ...textViolatesSafety(localizedText.reason),
  ];

  if (violations.length > 0) {
    return {
      action: buildSafeFallback(candidate),
      blockedBySafetyRules: [...new Set([...violations, ...ALWAYS_APPLIED_SAFETY_RULES])],
      wasAdjusted: true,
    };
  }

  return {
    action: candidate,
    blockedBySafetyRules: [],
    wasAdjusted: false,
  };
}

export function ensureSafetyRulesListed(ruleIds: string[]): string[] {
  const merged = new Set([...ruleIds, "general-fitness-guidance-only"]);
  return [...merged];
}
