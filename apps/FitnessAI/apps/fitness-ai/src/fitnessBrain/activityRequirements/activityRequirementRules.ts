/**
 * Structured activity requirement rules — explainable, evidence-tagged.
 * @see scientificSources — compendium-met-2011, acsm-endurance-fueling, issn-protein-2017
 */

import type { ActivityRequirementRule } from "../activityRequirements/activityRequirementTypes";

export const ACTIVITY_REQUIREMENT_RULES: ActivityRequirementRule[] = [
  {
    id: "energy-demand-met-duration",
    description: "Energy demand scales with estimated MET, session duration, and perceived intensity.",
    evidenceLevel: "moderate",
    sourceCategory: "sports_nutrition_guidelines",
    recommendation: "Longer and harder sessions increase total energy cost and refueling needs.",
    sourceIds: ["compendium-met-2011", "compendium-met-formula"],
  },
  {
    id: "carb-focused-endurance",
    description: "Aerobic sessions over ~45 minutes benefit from carbohydrate availability.",
    evidenceLevel: "moderate",
    sourceCategory: "sports_nutrition_guidelines",
    recommendation: "Prioritise easily digestible carbs before or after sustained cardio.",
    sourceIds: ["acsm-endurance-fueling"],
  },
  {
    id: "protein-strength-priority",
    description: "Resistance and combat activities create higher muscle protein turnover needs.",
    evidenceLevel: "strong",
    sourceCategory: "resistance_training_guidelines",
    recommendation: "Spread protein across meals after strength-dominant sessions.",
    sourceIds: ["issn-protein-2017"],
  },
  {
    id: "hydration-endurance-sports",
    description: "Running, cycling, swimming, and team sports increase fluid loss through sweat.",
    evidenceLevel: "moderate",
    sourceCategory: "sports_nutrition_guidelines",
    recommendation: "Increase hydration before, during, and after sweaty or long sessions.",
    sourceIds: ["acsm-hydration-exercise", "efsa-water-2010"],
  },
  {
    id: "recovery-high-load",
    description: "Long or intense sessions and high library recovery priority increase recovery need.",
    evidenceLevel: "moderate",
    sourceCategory: "resistance_training_guidelines",
    recommendation: "Allow easier movement or rest before repeating the same hard pattern.",
    sourceIds: ["acsm-recovery-training"],
  },
  {
    id: "activity-consecutive-training-load",
    description: "Multiple consecutive training days reduce readiness for repeated high load.",
    evidenceLevel: "moderate",
    sourceCategory: "behavioral_science",
    recommendation: "Alternate hard days with lighter movement when training days stack up.",
    sourceIds: ["acsm-recovery-training"],
  },
  {
    id: "muscle-group-recovery",
    description: "Strength-dominant work stresses primary muscle groups that need spacing.",
    evidenceLevel: "moderate",
    sourceCategory: "resistance_training_guidelines",
    recommendation: "Avoid repeating the same muscle-group emphasis on consecutive low-recovery days.",
    sourceIds: ["acsm-recovery-training"],
  },
  {
    id: "light-session-minimal-fuel",
    description: "Short, easy sessions rarely need dedicated fuelling beyond normal meals.",
    evidenceLevel: "limited",
    sourceCategory: "public_health_guidelines",
    recommendation: "Keep normal meal timing for brief low-intensity movement.",
    sourceIds: ["compendium-met-2011"],
  },
  {
    id: "balanced-meal-strength-goal",
    description: "Muscle-gain goals pair well with balanced meals after strength sessions.",
    evidenceLevel: "moderate",
    sourceCategory: "sports_nutrition_guidelines",
    recommendation: "Combine protein and carbohydrates after resistance training when building muscle.",
    sourceIds: ["issn-protein-2017", "acsm-endurance-fueling"],
  },
  {
    id: "next-day-light-after-hard-cardio",
    description: "Hard lower-body cardio can warrant lighter movement the following day.",
    evidenceLevel: "heuristic",
    sourceCategory: "public_health_guidelines",
    recommendation: "Prefer walking, mobility, or upper-body work after long hard runs or cycles.",
    sourceIds: ["acsm-recovery-training", "product-decision-heuristics"],
  },
  {
    id: "general-fitness-guidance-only",
    description: "Activity requirements support general wellness — not clinical prescriptions.",
    evidenceLevel: "strong",
    sourceCategory: "safety_guidance",
    recommendation: "Use requirements for everyday fitness guidance only.",
    sourceIds: ["fitness-safety-boundary"],
  },
];

export const ACTIVITY_REQUIREMENT_RULES_BY_ID = new Map(
  ACTIVITY_REQUIREMENT_RULES.map((r) => [r.id, r]),
);

export function getActivityRequirementRule(id: string): ActivityRequirementRule | undefined {
  return ACTIVITY_REQUIREMENT_RULES_BY_ID.get(id);
}
