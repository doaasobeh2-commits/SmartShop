import type { MacroTargets, MacroTotals, Explainable } from "../../types";
import {
  dailyCarbsTargetG,
  dailyFatTargetG,
  dailyFibreTargetG,
  dailyProteinTargetG,
} from "../../science/formulas";
import { SCIENCE_REFERENCES } from "../../science/references";
import { goalEngine } from "../goal/goalEngine";

export type NutritionEngine = {
  macroTargets(profile: { weightKg: number; goal: import("../../../domain/models").UserGoal }, calorieTarget: number): Explainable<MacroTargets>;
  sumMacros(entries: MacroTotals[]): MacroTotals;
};

export const nutritionEngine: NutritionEngine = {
  macroTargets(profile, calorieTarget) {
    const goal = goalEngine.resolve(profile.goal);
    const proteinGoalG = dailyProteinTargetG(profile.weightKg, profile.goal);
    const fatGoalG = dailyFatTargetG(calorieTarget);
    const carbsGoalG = dailyCarbsTargetG(calorieTarget, proteinGoalG, fatGoalG);
    const fibreGoalG = dailyFibreTargetG(calorieTarget);

    return {
      value: { proteinGoalG, carbsGoalG, fatGoalG, fibreGoalG },
      explanation: {
        id: "nutrition-macro-targets",
        engine: "nutrition",
        title: "Macro targets",
        summary: `Protein ${proteinGoalG} g prioritised for your goal; fat and carbs fill remaining energy.`,
        steps: [
          {
            label: "Protein",
            value: `${proteinGoalG} g/day`,
            formula: `${profile.weightKg} kg × ${goal.value.proteinGramsPerKg} g/kg`,
          },
          {
            label: "Fat",
            value: `${fatGoalG} g/day (~28% kcal)`,
            formula: "(kcal × 0.28) ÷ 9",
          },
          {
            label: "Carbohydrates",
            value: `${carbsGoalG} g/day`,
            formula: "remaining kcal ÷ 4",
          },
          {
            label: "Fibre",
            value: `${fibreGoalG} g/day`,
            formula: "14 g per 1000 kcal",
          },
        ],
        references: [
          SCIENCE_REFERENCES.ISSN_PROTEIN_2017,
          SCIENCE_REFERENCES.AMDR_FAT,
          SCIENCE_REFERENCES.FIBRE_PER_1000_KCAL,
        ],
      },
    };
  },

  sumMacros(entries) {
    return entries.reduce(
      (acc, m) => ({
        kcal: acc.kcal + m.kcal,
        proteinG: acc.proteinG + m.proteinG,
        carbsG: acc.carbsG + m.carbsG,
        fatG: acc.fatG + m.fatG,
        fibreG: acc.fibreG + m.fibreG,
      }),
      { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0, fibreG: 0 },
    );
  },
};
