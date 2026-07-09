/**

 * Maps canonical Fitness Brain state → Coach insight cards.

 * Preserves multi-card Coach UX using Brain outputs only.

 * Unknown ≠ zero — secondary insights gated on evidence signals.

 */



import type { CoachInsight, WorkoutExercise } from "../../domain/models";

import type { FitnessBrainState, UserDataInput } from "../types";

import { NUTRITION_VALUES } from "../knowledge";

import {

  caloriesEatenValue,

  hydrationValue,

  isHydrationKnown,

  isNutritionKnown,

  proteinEatenValue,

} from "../explainability/evidenceSignals";

import { searchFoods } from "../foodKnowledge";



export type CoachInsightsInput = {

  exercises: WorkoutExercise[];

  userData?: UserDataInput;

};



export function generateCoachInsights(

  state: FitnessBrainState,

  input: CoachInsightsInput,

): CoachInsight[] {

  const insights: CoachInsight[] = [];

  const hour = new Date().getHours();

  const userData = input.userData ?? {};

  const nutritionKnown = isNutritionKnown(userData);

  const hydrationKnown = isHydrationKnown(userData);



  const proteinEaten = proteinEatenValue(userData);

  const proteinGoal = state.nutrition.proteinG;

  const proteinRemaining =

    nutritionKnown && proteinEaten !== undefined

      ? Math.max(proteinGoal - proteinEaten, 0)

      : undefined;



  const caloriesEaten = caloriesEatenValue(userData);

  const calorieRemaining =

    nutritionKnown && caloriesEaten !== undefined

      ? state.metabolism.dailyCalorieTarget - caloriesEaten

      : undefined;



  const waterConsumed = hydrationValue(userData);

  const waterGoal = state.nutrition.waterLiters;

  const waterPct =

    hydrationKnown && waterGoal > 0 && waterConsumed !== undefined

      ? waterConsumed / waterGoal

      : undefined;



  const completed = input.exercises.filter((e) => e.done).length;

  const total = input.exercises.length;



  insights.push({

    id: state.dailyAction.id,

    title: state.dailyAction.title,

    body: state.dailyAction.message,

    tone: toneFromAction(state.dailyAction.id),

    ruleId: state.dailyAction.explanation.supportingRuleIds[0],

    explanation: {

      id: `explain-${state.dailyAction.id}`,

      engine: "daily_decision",

      title: state.dailyAction.title,

      summary: state.dailyAction.reason,

      steps: [{ label: "Reason", value: state.dailyAction.reason }],

      references: state.dailyAction.explanation.supportingRuleIds,

    },

  });



  if (

    nutritionKnown &&

    proteinRemaining !== undefined &&

    proteinRemaining >= NUTRITION_VALUES.proteinFocusRemainingG &&

    hour >= NUTRITION_VALUES.proteinFocusAfterHour

  ) {

    insights.push({

      id: "coach-protein-gap",

      title: "Protein check",

      body: `About ${Math.round(proteinRemaining)} g protein remaining today. A lean protein meal supports your goal.`,

      tone: "nutrition",

      ruleId: "protein-focus",

    });

  }



  if (

    hydrationKnown &&

    waterPct !== undefined &&

    waterPct < NUTRITION_VALUES.hydrationLowPct &&

    hour >= NUTRITION_VALUES.hydrationLowAfterHour

  ) {

    insights.push({

      id: "coach-hydration",

      title: "Water check-in",

      body: `You're at ${waterConsumed} L of ${waterGoal} L. A glass of water supports energy and recovery.`,

      tone: "recovery",

      ruleId: "hydration-focus",

    });

  }



  if (

    nutritionKnown &&

    calorieRemaining !== undefined &&

    calorieRemaining <= NUTRITION_VALUES.calorieBalanceRemainingKcal &&

    calorieRemaining > 0

  ) {

    insights.push({

      id: "coach-calories-close",

      title: "Calories running low",

      body: `${Math.round(calorieRemaining)} kcal left today. Choose nutrient-dense, satisfying foods.`,

      tone: "nutrition",

      ruleId: "calorie-balance",

    });

  }



  if (total > 0 && completed < total) {

    const left = total - completed;

    insights.push({

      id: "coach-workout",

      title: "Today's training",

      body:

        left === total

          ? `${state.training.title} is ready — ${total} exercises.`

          : `${left} exercise${left > 1 ? "s" : ""} left in ${state.training.title}.`,

      tone: "workout",

      ruleId: "complete-workout",

    });

  } else if (total > 0 && completed === total) {

    insights.push({

      id: "coach-recovery",

      title: "After training",

      body: "Stretch for five minutes and hydrate. Recovery continues over the next 24 hours.",

      tone: "recovery",

      ruleId: "recovery-post-workout",

    });

  }



  if (

    nutritionKnown &&

    proteinRemaining !== undefined &&

    proteinRemaining >= 15 &&

    hour >= 10 &&

    hour < 16

  ) {

    const foods = searchFoods({ query: "protein", limit: 2 });

    const names = foods.map((f) => f.item.name).join(" or ");

    if (names) {

      insights.push({

        id: "coach-meal-snack",

        title: "Simple protein option",

        body: `Consider ${names} — protein-forward options from the food knowledge base.`,

        tone: "nutrition",

        ruleId: "meal-protein-snack",

      });

    }

  }



  if ((userData.streakDays ?? 0) >= 3) {

    insights.push({

      id: "coach-habit",

      title: "Keep it simple",

      body: "Log one meal at a time. Small consistency beats perfect tracking.",

      tone: "motivation",

      ruleId: "habit-consistency",

    });

  }



  return dedupeById(insights);

}



function toneFromAction(actionId: string): CoachInsight["tone"] {

  if (actionId.includes("hydration") || actionId.includes("recovery")) return "recovery";

  if (actionId.includes("protein") || actionId.includes("calorie") || actionId.includes("fuel")) return "nutrition";

  if (actionId.includes("workout") || actionId.includes("movement")) return "workout";

  return "motivation";

}



function dedupeById(items: CoachInsight[]): CoachInsight[] {

  const seen = new Set<string>();

  return items.filter((item) => {

    if (seen.has(item.id)) return false;

    seen.add(item.id);

    return true;

  });

}


