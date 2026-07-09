import type { DailyPlan, MealEntry, UserProfile, WorkoutExercise } from "../models";

export type IUserProfileRepository = {
  getProfile(): Promise<UserProfile>;
  saveProfile(patch: Partial<UserProfile>): Promise<UserProfile>;
};

export type INutritionRepository = {
  getTodayMeals(): Promise<MealEntry[]>;
  /** Null when water has not been logged today — unknown ≠ 0. */
  getWaterLiters(): Promise<number | null>;
  addMeal(input: {
    name: string;
    foodId: string;
    servingGrams: number;
    hint?: string;
  }): Promise<MealEntry>;
  addWater(liters: number): Promise<number>;
};

export type IDailyPlanRepository = {
  getTodayPlan(): Promise<DailyPlan>;
};

export type IWorkoutRepository = {
  getTodayExercises(): Promise<WorkoutExercise[]>;
  toggleExercise(id: string, done: boolean): Promise<void>;
};

export type IStorageAdapter = {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
};
