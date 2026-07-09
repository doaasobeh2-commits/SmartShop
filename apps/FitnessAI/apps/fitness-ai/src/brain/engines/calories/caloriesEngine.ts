import type { UserProfile } from "../../../domain/models";
import type { CalorieTargets, Explainable } from "../../types";
import {
  ACTIVITY_MULTIPLIERS,
  dailyCalorieTarget,
  estimateTdee,
  mifflinStJeorBmr,
} from "../../science/formulas";
import { SCIENCE_REFERENCES } from "../../science/references";
import { goalEngine } from "../goal/goalEngine";

export type CaloriesEngine = {
  calculate(profile: UserProfile): Explainable<CalorieTargets>;
};

export const caloriesEngine: CaloriesEngine = {
  calculate(profile) {
    const bmrKcal = Math.round(mifflinStJeorBmr(profile));
    const tdeeKcal = estimateTdee(bmrKcal, profile.activityLevel);
    const goal = goalEngine.resolve(profile.goal);
    const dailyTargetKcal = dailyCalorieTarget(tdeeKcal, profile.goal);

    return {
      value: {
        bmrKcal,
        tdeeKcal,
        dailyTargetKcal,
        deficitOrSurplusKcal: dailyTargetKcal - tdeeKcal,
      },
      explanation: {
        id: "calories-daily-target",
        engine: "calories",
        title: "Daily calorie target",
        summary: `Your target is ${dailyTargetKcal} kcal based on resting metabolism, activity, and goal.`,
        steps: [
          {
            label: "BMR (Mifflin–St Jeor)",
            value: `${bmrKcal} kcal/day`,
            formula: "10×kg + 6.25×cm − 5×age ± sex constant",
          },
          {
            label: "Activity multiplier",
            value: `× ${ACTIVITY_MULTIPLIERS[profile.activityLevel]}`,
            formula: "BMR × activity → TDEE",
          },
          { label: "TDEE", value: `${tdeeKcal} kcal/day` },
          {
            label: "Goal adjustment",
            value: `${goal.value.energyAdjustmentKcal >= 0 ? "+" : ""}${goal.value.energyAdjustmentKcal} kcal`,
          },
          { label: "Daily target", value: `${dailyTargetKcal} kcal/day` },
        ],
        references: [SCIENCE_REFERENCES.MIFFLIN_ST_JEOR_1990, ...goal.explanation.references],
      },
    };
  },
};
