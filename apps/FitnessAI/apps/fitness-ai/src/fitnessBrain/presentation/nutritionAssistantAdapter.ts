/**

 * Nutrition Assistant view — Eat tab data from Fitness Brain.

 * Quiet evaluation of protein, timing, training support, hydration, recovery.

 * Unknown ≠ zero — progress values omitted when evidence is missing.

 */



import type { MealEntry } from "../../domain/models";

import { NUTRITION_VALUES } from "../knowledge";

import {

  caloriesEatenValue,

  hydrationValue,

  isHydrationKnown,

  isNutritionKnown,

  proteinEatenValue,

} from "../explainability/evidenceSignals";

import type { FitnessBrainState, UserDataInput } from "../types";



export type NutritionMacroKnown = {

  known: boolean;

  eaten?: number;

  goal: number;

  remaining?: number;

};



export type NutritionAssistantView = {

  focusTitle: string;

  focusHint: string;

  quietHint?: string;

  gapMessages: string[];

  calories: NutritionMacroKnown;

  protein: NutritionMacroKnown;

  carbs: { goal: number };

  fat: { goal: number };

  water: { known: boolean; consumed?: number; goal: number };

};



function focusFromAction(state: FitnessBrainState): { title: string; hint: string } {

  const focus = state.dailyAction.nutritionFocus;

  const map: Record<string, { title: string; hint: string }> = {

    protein: {

      title: "Protein is today's nutrition focus",

      hint: "Spread protein across meals — it supports recovery and your goal.",

    },

    hydration: {

      title: "Hydration is today's nutrition focus",

      hint: "Steady water intake supports energy and training quality.",

    },

    calorie_balance: {

      title: "Calorie balance matters today",

      hint: "Choose satisfying, nutrient-dense meals within your target.",

    },

    post_activity_protein: {

      title: "Post-activity protein",

      hint: "After training, protein helps muscle repair within the next few hours.",

    },

    post_activity_hydration: {

      title: "Rehydrate after activity",

      hint: "Replace fluids lost during your session before the day ends.",

    },

    post_activity_fuel: {

      title: "Refuel after activity",

      hint: "A balanced meal supports recovery from today's load.",

    },

    meal_timing: {

      title: "Meal timing supports your day",

      hint: "Align main meals with training and energy needs.",

    },

    consistency: {

      title: "Log to enable analysis",

      hint: "Fitness Brain needs logged meals and water before nutrition progress can be shown.",

    },

  };

  return (

    map[focus] ?? {

      title: "Today's nutrition focus",

      hint: "Log main meals — targets come from your profile and metabolism rules.",

    }

  );

}



function quietEvaluation(state: FitnessBrainState, userData: UserDataInput): string | undefined {

  const hints: string[] = [];

  const hour = new Date().getHours();

  const nutritionKnown = isNutritionKnown(userData);

  const hydrationKnown = isHydrationKnown(userData);



  if (!nutritionKnown && hour >= NUTRITION_VALUES.hydrationLowAfterHour) {

    hints.push("Today's nutrition cannot be evaluated — log meals to enable analysis.");

  }

  if (!hydrationKnown && hour >= NUTRITION_VALUES.hydrationCriticalAfterHour) {

    hints.push("Hydration is unknown — log water before Fitness Brain assesses intake.");

  }



  const proteinEaten = proteinEatenValue(userData);

  const proteinRemaining =

    proteinEaten !== undefined ? state.nutrition.proteinG - proteinEaten : undefined;



  if (

    nutritionKnown &&

    proteinRemaining !== undefined &&

    proteinRemaining > NUTRITION_VALUES.proteinFocusRemainingG &&

    hour >= NUTRITION_VALUES.proteinLowAfterHour

  ) {

    hints.push("Protein is still open — a protein-forward meal would help.");

  }

  if (hydrationKnown && state.bodyState.hydrationStatus === "low") {

    hints.push("Hydration is low — water supports recovery and focus.");

  }

  if (state.recovery.level === "low_recovery" || state.recovery.level === "overtraining_risk") {

    hints.push("Recovery is limited — prioritize quality nutrition over restriction.");

  }

  if (state.activityRequirements.todayPrimary?.proteinPriority === "high" && nutritionKnown) {

    hints.push("Today's activity increases protein needs.");

  }

  return hints.length > 0 ? hints[0] : undefined;

}



export function buildNutritionAssistantView(

  state: FitnessBrainState,

  userData: UserDataInput,

  _meals: MealEntry[],

): NutritionAssistantView {

  const nutritionKnown = isNutritionKnown(userData);

  const hydrationKnown = isHydrationKnown(userData);

  const eatenKcal = caloriesEatenValue(userData);

  const proteinEaten = proteinEatenValue(userData);

  const goalKcal = state.metabolism.dailyCalorieTarget;

  const proteinGoal = state.nutrition.proteinG;

  const waterConsumed = hydrationValue(userData);

  const waterGoal = state.nutrition.waterLiters;

  const focus = focusFromAction(state);



  const gapMessages: string[] = [];

  if (!nutritionKnown) {

    gapMessages.push("Meal data incomplete — calorie and protein progress cannot be calculated.");

  }

  if (!hydrationKnown) {

    gapMessages.push("Water not logged — hydration progress is unknown (not 0%).");

  }



  return {

    focusTitle: focus.title,

    focusHint: focus.hint,

    quietHint: quietEvaluation(state, userData),

    gapMessages,

    calories: {

      known: nutritionKnown,

      eaten: nutritionKnown && eatenKcal !== undefined ? eatenKcal : undefined,

      goal: goalKcal,

      remaining:

        nutritionKnown && eatenKcal !== undefined

          ? Math.max(goalKcal - eatenKcal, 0)

          : undefined,

    },

    protein: {

      known: nutritionKnown,

      eaten:

        nutritionKnown && proteinEaten !== undefined ? Math.round(proteinEaten) : undefined,

      goal: proteinGoal,

      remaining:

        nutritionKnown && proteinEaten !== undefined

          ? Math.max(Math.round(proteinGoal - proteinEaten), 0)

          : undefined,

    },

    carbs: { goal: state.nutrition.carbohydratesG },

    fat: { goal: state.nutrition.fatG },

    water: {

      known: hydrationKnown,

      consumed: hydrationKnown && waterConsumed !== undefined ? waterConsumed : undefined,

      goal: waterGoal,

    },

  };

}


