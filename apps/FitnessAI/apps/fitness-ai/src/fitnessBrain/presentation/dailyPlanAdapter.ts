/**

 * Maps canonical Fitness Brain state → DailyPlan domain model.

 * Preserves legacy UI output shape without legacy brain engines.

 * Unknown ≠ zero — nutrition presentation respects evidence signals.

 */



import type { DailyPlan, MealEntry, UserProfile, WorkoutExercise } from "../../domain/models";

import type { FitnessBrainState, UserDataInput } from "../types";

import { buildNutritionPresentation } from "./nutritionPresentation";

import { buildDailyWorkoutPresentation } from "./workoutPresentation";



export type DailyPlanComposeInput = {

  profile: UserProfile;

  meals: MealEntry[];

  exercises: WorkoutExercise[];

  waterLiters?: number;

  userData?: UserDataInput;

};



export function composeDailyPlan(

  state: FitnessBrainState,

  input: DailyPlanComposeInput,

): DailyPlan {

  const nutrition = buildNutritionPresentation(input.userData, {
      goalKcal: state.metabolism.dailyCalorieTarget,
      proteinGoalG: state.nutrition.proteinG,
      waterGoalLiters: state.nutrition.waterLiters,
    });



  const workout = buildDailyWorkoutPresentation(state.training, input.exercises);



  const primaryInsight = {

    id: state.dailyAction.id,

    title: state.dailyAction.title,

    body: state.dailyAction.message,

    tone: mapNutritionFocusToTone(state.dailyAction.nutritionFocus),

    ruleId: state.dailyAction.explanation.supportingRuleIds[0],

    explanation: {

      id: `explain-${state.dailyAction.id}`,

      engine: "daily_decision",

      title: state.dailyAction.title,

      summary: state.dailyAction.reason,

      steps: state.dailyAction.explanation.selectedBecause.map((reason, i) => ({

        label: `Reason ${i + 1}`,

        value: reason,

      })),

      references: state.dailyAction.explanation.supportingRuleIds,

    },

  };



  const recoveryNote =

    state.recovery.level === "low_recovery" || state.recovery.level === "overtraining_risk"

      ? state.recovery.summary

      : state.training.type === "rest" || state.training.type === "walking"

        ? "Rest day — light movement and hydration still help."

        : undefined;



  return {

    date: new Date().toISOString().slice(0, 10),

    greeting: "Good morning",

    nutrition,

    workout,

    coachInsight: primaryInsight,

    recoveryNote,

  };

}



function mapNutritionFocusToTone(

  focus: string,

): "motivation" | "nutrition" | "recovery" | "workout" {

  if (focus.includes("hydration") || focus.includes("recovery")) return "recovery";

  if (focus.includes("protein") || focus.includes("calorie") || focus.includes("meal") || focus.includes("fuel")) {

    return "nutrition";

  }

  if (focus.includes("workout") || focus.includes("training")) return "workout";

  return "motivation";

}


