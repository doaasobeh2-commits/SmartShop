import type { UserGoal } from "../../../domain/models";
import type { BrainExplanation, Explainable } from "../../types";
import { GOAL_ENERGY_ADJUSTMENT, proteinGramsPerKg } from "../../science/formulas";
import { SCIENCE_REFERENCES } from "../../science/references";

export type GoalTargets = {
  goal: UserGoal;
  energyAdjustmentKcal: number;
  proteinGramsPerKg: number;
  intent: string;
};

export type GoalEngine = {
  resolve(goal: UserGoal): Explainable<GoalTargets>;
};

const GOAL_INTENT: Record<UserGoal, string> = {
  lose: "Moderate fat loss while preserving muscle.",
  muscle: "Hypertrophy support with a controlled calorie surplus.",
  fit: "General fitness at maintenance energy.",
  health: "Sustainable health habits at maintenance.",
  sport: "Performance support with a modest energy surplus.",
  stress: "Stable energy and recovery-focused maintenance.",
};

export const goalEngine: GoalEngine = {
  resolve(goal) {
    const energyAdjustmentKcal = GOAL_ENERGY_ADJUSTMENT[goal];
    const proteinPerKg = proteinGramsPerKg(goal);

    const explanation: BrainExplanation = {
      id: `goal-${goal}`,
      engine: "goal",
      title: "Goal-based adjustments",
      summary: GOAL_INTENT[goal],
      steps: [
        {
          label: "Energy adjustment",
          value: `${energyAdjustmentKcal >= 0 ? "+" : ""}${energyAdjustmentKcal} kcal/day`,
          formula: "TDEE + goal adjustment",
        },
        {
          label: "Protein coefficient",
          value: `${proteinPerKg} g/kg body weight`,
          formula: "weight × g/kg → daily protein target",
        },
      ],
      references:
        goal === "lose"
          ? [SCIENCE_REFERENCES.SAFE_WEIGHT_LOSS_RATE, SCIENCE_REFERENCES.ISSN_PROTEIN_2017]
          : [SCIENCE_REFERENCES.ISSN_PROTEIN_2017],
    };

    return {
      value: {
        goal,
        energyAdjustmentKcal,
        proteinGramsPerKg: proteinPerKg,
        intent: GOAL_INTENT[goal],
      },
      explanation,
    };
  },
};
