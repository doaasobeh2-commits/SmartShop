/**
 * Safety knowledge rules — keep Fitness Brain within general fitness guidance.
 * Prevents medical claims and directs users to professionals when appropriate.
 */

import type { KnowledgeRule } from "./evidenceLevels";

export const SAFETY_RULES: KnowledgeRule[] = [
  {
    id: "no-disease-diagnosis",
    description: "Fitness Brain must not diagnose medical conditions.",
    evidenceLevel: "strong",
    sourceCategory: "safety_guidance",
    recommendation: "Never state or imply that the user has a disease, disorder, or clinical condition.",
    sourceIds: ["fitness-safety-boundary"],
  },
  {
    id: "no-treatment-advice",
    description: "Fitness Brain must not prescribe medical treatment.",
    evidenceLevel: "strong",
    sourceCategory: "safety_guidance",
    recommendation: "Do not recommend medication, supplements as treatment, or clinical interventions.",
    sourceIds: ["fitness-safety-boundary"],
  },
  {
    id: "seek-help-pain",
    description: "Pain during exercise may indicate injury requiring professional assessment.",
    evidenceLevel: "strong",
    sourceCategory: "safety_guidance",
    recommendation: "If the user reports pain, advise stopping activity and consulting a qualified professional.",
    sourceIds: ["fitness-safety-boundary"],
  },
  {
    id: "seek-help-dizziness",
    description: "Dizziness or fainting during activity requires medical attention.",
    evidenceLevel: "strong",
    sourceCategory: "safety_guidance",
    recommendation: "If dizziness occurs, advise stopping and seeking professional help.",
    sourceIds: ["fitness-safety-boundary"],
  },
  {
    id: "seek-help-severe-fatigue",
    description: "Persistent severe fatigue may have medical causes beyond training load.",
    evidenceLevel: "moderate",
    sourceCategory: "safety_guidance",
    recommendation: "Recommend professional evaluation for unexplained severe or prolonged fatigue.",
    sourceIds: ["fitness-safety-boundary"],
  },
  {
    id: "seek-help-eating-disorder-signs",
    description: "Restrictive eating patterns may require specialist support.",
    evidenceLevel: "strong",
    sourceCategory: "safety_guidance",
    recommendation: "Do not reinforce extreme restriction; encourage professional support when disordered eating is suspected.",
    sourceIds: ["fitness-safety-boundary"],
  },
  {
    id: "seek-help-pregnancy",
    description: "Pregnancy requires individualised medical and exercise guidance.",
    evidenceLevel: "strong",
    sourceCategory: "safety_guidance",
    recommendation: "Direct pregnant users to their healthcare provider for exercise and nutrition plans.",
    sourceIds: ["fitness-safety-boundary"],
  },
  {
    id: "seek-help-chronic-disease",
    description: "Chronic conditions affect safe exercise and nutrition targets.",
    evidenceLevel: "strong",
    sourceCategory: "safety_guidance",
    recommendation: "Recommend medical clearance before structured programmes for chronic disease.",
    sourceIds: ["fitness-safety-boundary"],
  },
  {
    id: "general-fitness-guidance-only",
    description: "All outputs are wellness planning, not personalised medical advice.",
    evidenceLevel: "strong",
    sourceCategory: "safety_guidance",
    recommendation: "Frame every recommendation as general fitness guidance for healthy adults.",
    sourceIds: ["fitness-safety-boundary"],
  },
];

export const SAFETY_DISCLAIMERS = {
  metabolism:
    "General fitness estimate based on published formulas. Not medical advice or a diagnosis.",
  nutrition:
    "General wellness targets for healthy adults. Individual needs vary; not medical nutrition advice.",
  training:
    "General activity guidance. Consult a professional before starting a new exercise program.",
  recovery:
    "General wellness signal only. Not a medical evaluation of recovery or injury risk.",
  brain:
    "General fitness guidance only. Not medical advice, diagnosis, or treatment.",
} as const;

export function getEngineDisclaimer(
  domain: keyof typeof SAFETY_DISCLAIMERS,
): string {
  return SAFETY_DISCLAIMERS[domain];
}

/** Confidence and explainability thresholds — used by explainability layer only. */
export const EXPLAINABILITY_VALUES = {
  confidenceHighMinSignals: 3,
  confidenceMediumMinSignals: 1,
  defaultsHeavyMaxPresentSignals: 3,
  brainCompletenessCoachNoteMax: 70,
} as const;
