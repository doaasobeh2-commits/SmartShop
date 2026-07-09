import type { UserProfile } from "../../domain/models";

import type {

  INutritionRepository,

  IUserProfileRepository,

  IWorkoutRepository,

} from "../../domain/interfaces";

import { computePortionFromFoodId } from "../../fitnessBrain/foodKnowledge";

import {

  addTodayMeal,

  addTodayWater,

  getTodayMeals,

  getTodayWaterLiters,

} from "../../fitnessBrain/storage/nutritionLogStorage";

import {

  createEmptyUserProfile,

  loadUserProfile,

  patchUserProfile,

  saveUserProfile,

} from "../../fitnessBrain/storage/userProfileStorage";

import {

  getTodayTrainingExercises,

  toggleTrainingExercise,

} from "../../fitnessBrain/storage/trainingSessionStorage";

import { requestBrainDataRefresh } from "../../hooks/brainDataRefresh";



export type AddMealInput = {

  name: string;

  foodId: string;

  servingGrams: number;

  hint?: string;

};



export const userProfileRepository: IUserProfileRepository = {

  async getProfile() {

    return loadUserProfile() ?? createEmptyUserProfile();

  },

  async saveProfile(patch) {
    const result = patchUserProfile(patch);
    requestBrainDataRefresh();
    return result;
  },

};



export const nutritionRepository: INutritionRepository = {

  async getTodayMeals() {

    return getTodayMeals();

  },

  async getWaterLiters() {

    return getTodayWaterLiters() ?? null;

  },

  async addMeal(input: AddMealInput) {

    const portion = computePortionFromFoodId({

      foodId: input.foodId,

      servingGrams: input.servingGrams,

    });

    const meal = addTodayMeal({

      name: input.name,

      foodId: input.foodId,

      servingGrams: input.servingGrams,

      kcal: portion ? Math.round(portion.calories) : 0,

      proteinG: portion ? Math.round(portion.protein) : 0,

      hint: input.hint,

    });

    requestBrainDataRefresh();

    return meal;

  },

  async addWater(liters: number) {

    const total = addTodayWater(liters);

    requestBrainDataRefresh();

    return total;

  },

};



export const workoutRepository: IWorkoutRepository = {

  async getTodayExercises() {

    return getTodayTrainingExercises();

  },

  async toggleExercise(id, done) {

    toggleTrainingExercise(id, done);

    requestBrainDataRefresh();

  },

};



export async function getBrainInput() {

  const [profile, meals, exerciseList] = await Promise.all([

    userProfileRepository.getProfile(),

    nutritionRepository.getTodayMeals(),

    workoutRepository.getTodayExercises(),

  ]);

  const waterLiters = await nutritionRepository.getWaterLiters();

  return { profile, meals, exercises: exerciseList, waterLiters: waterLiters ?? undefined };

}



/** Ensures profile exists after auth — no demo seeding. */

export function ensureUserProfileFromAuth(email: string, displayName?: string): UserProfile {

  const existing = loadUserProfile();

  if (existing && existing.heightCm > 0) {

    return patchUserProfile({

      email,

      displayName: displayName?.trim() || existing.displayName || email.split("@")[0],

    });

  }

  return saveUserProfile({

    ...(existing ?? createEmptyUserProfile()),

    email,

    displayName: displayName?.trim() || email.split("@")[0],

  });

}


