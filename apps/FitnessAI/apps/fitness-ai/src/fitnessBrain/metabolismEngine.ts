/**
 * Metabolism Engine — BMR, TDEE, daily calorie target.
 * Formula: Mifflin–St Jeor (1990) × FAO/WHO PAL × goal adjustment.
 * @see knowledge/metabolismRules, knowledge/scientificSources — bmr-mifflin-st-jeor, tdee-pal
 */

import {
  getEngineDisclaimer,
  getGoalCalorieAdjustment,
  getActivityMultiplier,
  getGenderBmrOffset,
  METABOLISM_VALUES,
  NUTRITION_VALUES,
} from "./knowledge";
import type { MetabolismResult, NormalizedUserProfile } from "./types";

function mifflinStJeor(profile: NormalizedUserProfile): number {
  const { weightKg, heightCm, age, gender } = profile;
  const { weightCoeff, heightCoeff, ageCoeff } = METABOLISM_VALUES.mifflin;
  const base = weightCoeff * weightKg + heightCoeff * heightCm - ageCoeff * age;
  return base + getGenderBmrOffset(gender);
}

export function calculateMetabolism(profile: NormalizedUserProfile): MetabolismResult {
  const bmrKcal = Math.round(mifflinStJeor(profile));
  const tdeeKcal = Math.round(bmrKcal * getActivityMultiplier(profile.activityLevel));
  const goalAdjustmentKcal = getGoalCalorieAdjustment(profile.goal);
  const dailyCalorieTarget = Math.max(
    Math.round(tdeeKcal + goalAdjustmentKcal),
    NUTRITION_VALUES.minDailyKcal,
  );

  return {
    bmrKcal,
    tdeeKcal,
    dailyCalorieTarget,
    goalAdjustmentKcal,
    formula: "mifflin-st-jeor",
    disclaimer: getEngineDisclaimer("metabolism"),
  };
}
