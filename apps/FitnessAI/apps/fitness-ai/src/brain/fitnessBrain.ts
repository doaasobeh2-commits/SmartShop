/**
 * @deprecated Legacy Brain — use `../fitnessBrain` instead.
 * Compatibility shim only; canonical logic lives in fitnessBrain/.
 */

import type { CoachInsight, DailyPlan, MealEntry, UserProfile, WorkoutExercise } from "../domain/models";
import { buildFitnessBrainUserData } from "../fitnessBrain/buildBrainInput";
import { computePortionFromFoodId } from "../fitnessBrain/foodKnowledge";
import { runBrainPipeline } from "../fitnessBrain/pipeline";
import { composeDailyPlan, generateCoachInsights } from "../fitnessBrain/presentation";
import { mapAppDataToUserData } from "../fitnessBrain/mapUserData";

export type BrainInput = {
  profile: UserProfile;
  meals: MealEntry[];
  exercises: WorkoutExercise[];
  waterLiters: number;
  date?: string;
};

export type FitnessBrain = {
  composeDailyPlan(input: BrainInput): DailyPlan;
  getRecommendations(input: BrainInput): CoachInsight[];
};

/** @deprecated Use runBrainPipeline + composeDailyPlan from fitnessBrain/presentation */
export const fitnessBrain: FitnessBrain = {
  composeDailyPlan(input) {
    const userData = mapAppDataToUserData(input);
    const { state } = runBrainPipeline(userData, { appProfile: input.profile });
    return composeDailyPlan(state, {
      profile: input.profile,
      meals: input.meals,
      exercises: input.exercises,
      waterLiters: input.waterLiters,
      userData,
    });
  },
  getRecommendations(input) {
    const userData = mapAppDataToUserData(input);
    const { state } = runBrainPipeline(userData, { appProfile: input.profile });
    return generateCoachInsights(state, { exercises: input.exercises, userData });
  },
};

/** @deprecated Use computePortionFromFoodId from fitnessBrain/foodKnowledge */
export const foodKnowledgeEngine = {
  computePortion(params: { foodId: string; servingGrams: number }) {
    const portion = computePortionFromFoodId(params);
    if (!portion) {
      return { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0, fibreG: 0 };
    }
    return {
      kcal: Math.round(portion.calories),
      proteinG: Math.round(portion.protein),
      carbsG: Math.round(portion.carbs),
      fatG: Math.round(portion.fat),
      fibreG: Math.round(portion.fiber ?? 0),
    };
  },
};

export type { BrainExplanation, BrainRecommendation, DailyBrainSnapshot, Explainable, EngineId } from "./types";

export { buildFitnessBrainUserData };
