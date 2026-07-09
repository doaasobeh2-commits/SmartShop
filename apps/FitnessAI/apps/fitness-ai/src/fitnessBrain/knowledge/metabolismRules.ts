/**
 * Metabolism knowledge — formulas and multipliers.
 * Engines execute; this module owns the science constants.
 * @see scientificSources — mifflin-st-jeor-1990, fao-who-pal-2001
 */

import type { ActivityLevel, NormalizedGender } from "../types";
import type { KnowledgeRule } from "./evidenceLevels";

export const METABOLISM_RULES: KnowledgeRule[] = [
  {
    id: "mifflin-st-jeor",
    description: "Mifflin–St Jeor equation estimates resting metabolic rate from body size and age.",
    evidenceLevel: "moderate",
    sourceCategory: "public_health_guidelines",
    recommendation: "BMR = 10×weight(kg) + 6.25×height(cm) − 5×age + gender offset.",
    sourceIds: ["mifflin-st-jeor-1990"],
  },
  {
    id: "tdee-activity-multiplier",
    description: "Total daily energy expenditure scales BMR by habitual activity level.",
    evidenceLevel: "moderate",
    sourceCategory: "public_health_guidelines",
    recommendation: "Apply FAO/WHO physical activity level (PAL) factors to BMR for TDEE estimation.",
    sourceIds: ["fao-who-pal-2001", "mifflin-st-jeor-1990"],
  },
];

export const METABOLISM_VALUES = {
  /**
   * Mifflin–St Jeor coefficients (Am J Clin Nutr 1990).
   * Male offset +5 kcal; female −161 kcal; other uses midpoint −78 kcal.
   */
  mifflin: {
    weightCoeff: 10,
    heightCoeff: 6.25,
    ageCoeff: 5,
  },
  /** Mifflin–St Jeor gender offsets (kcal/day). @see mifflin-st-jeor-1990 */
  genderOffset: {
    male: 5,
    female: -161,
    other: -78,
  } satisfies Record<NormalizedGender, number>,
  /**
   * PAL multipliers applied to BMR for TDEE.
   * @see fao-who-pal-2001 — commonly used fitness-app PAL table.
   */
  activityMultipliers: {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    athlete: 1.9,
  } satisfies Record<ActivityLevel, number>,
} as const;

export function getActivityMultiplier(level: ActivityLevel): number {
  return METABOLISM_VALUES.activityMultipliers[level];
}

export function getGenderBmrOffset(gender: NormalizedGender): number {
  return METABOLISM_VALUES.genderOffset[gender];
}
