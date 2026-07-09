/**

 * Daily meal and water logs — real user evidence for Fitness Brain.

 */



import type { MealEntry } from "../../domain/models";

import {

  readInstallationScoped,

  writeInstallationScoped,

} from "../privacy/brainInstallationStorage";



export const NUTRITION_MEALS_STORAGE_KEY = "nutrition:daily-meals";

export const NUTRITION_WATER_STORAGE_KEY = "nutrition:daily-water";



type DailyMealsRecord = {

  date: string;

  meals: MealEntry[];

};



type DailyWaterRecord = {

  date: string;

  liters: number;

};



function todayDateStr(): string {

  return new Date().toISOString().slice(0, 10);

}



function formatTimeLabel(): string {

  return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

}



function loadMealsRecord(): DailyMealsRecord | null {

  return readInstallationScoped<DailyMealsRecord>(NUTRITION_MEALS_STORAGE_KEY);

}



function saveMealsRecord(record: DailyMealsRecord): void {

  writeInstallationScoped(NUTRITION_MEALS_STORAGE_KEY, record);

}



function loadWaterRecord(): DailyWaterRecord | null {

  return readInstallationScoped<DailyWaterRecord>(NUTRITION_WATER_STORAGE_KEY);

}



function saveWaterRecord(record: DailyWaterRecord): void {

  writeInstallationScoped(NUTRITION_WATER_STORAGE_KEY, record);

}



export function getTodayMeals(): MealEntry[] {

  const record = loadMealsRecord();

  if (!record || record.date !== todayDateStr()) return [];

  return record.meals;

}



/** Returns logged liters for today, or undefined when not logged (unknown ≠ 0). */

export function getTodayWaterLiters(): number | undefined {

  const record = loadWaterRecord();

  if (!record || record.date !== todayDateStr()) return undefined;

  return record.liters;

}



export function addTodayMeal(meal: Omit<MealEntry, "id" | "timeLabel"> & { timeLabel?: string }): MealEntry {

  const date = todayDateStr();

  const record = loadMealsRecord();

  const meals =

    record?.date === date ? [...record.meals] : [];



  const entry: MealEntry = {

    ...meal,

    id: `meal-${Date.now()}-${meals.length}`,

    timeLabel: meal.timeLabel ?? formatTimeLabel(),

  };



  meals.push(entry);

  saveMealsRecord({ date, meals });

  return entry;

}



export function addTodayWater(litersToAdd: number): number {

  const date = todayDateStr();

  const record = loadWaterRecord();

  const current =

    record?.date === date ? record.liters : 0;

  const next = Math.round((current + litersToAdd) * 100) / 100;

  saveWaterRecord({ date, liters: next });

  return next;

}



export function setTodayWater(liters: number): number {

  const date = todayDateStr();

  const next = Math.max(Math.round(liters * 100) / 100, 0);

  saveWaterRecord({ date, liters: next });

  return next;

}


