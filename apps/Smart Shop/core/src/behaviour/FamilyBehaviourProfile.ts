import type { InventoryConfidenceScore } from "../models/inventory/InventoryConfidenceLevel";

/**
 * Learned household behaviour profile.
 * Populated over time from timeline events — no runtime implementation in v1.
 */
export type FamilyBehaviourProfile = {
  familyId: string;
  preferredShoppingDay?: string;
  preferredSupermarketIds: string[];
  preferredBrandIds: string[];
  budgetHabits?: BudgetHabitProfile;
  seasonalShoppingPatterns: SeasonalShoppingPattern[];
  frequentlyForgottenProducts: string[];
  frequentlyWastedProducts: string[];
  shoppingFrequencyPerWeek?: number;
  mealFrequencyPerWeek?: number;
  familyHabits: FamilyHabit[];
  confidence: InventoryConfidenceScore;
  updatedAt: string;
};

export type BudgetHabitProfile = {
  averageWeeklySpend?: number;
  currency?: string;
  typicalBudgetLimit?: number;
  overspendFrequency?: number;
};

export type SeasonalShoppingPattern = {
  season: "spring" | "summer" | "autumn" | "winter";
  categoryPreferences: string[];
  note?: string;
};

export type FamilyHabit = {
  code: string;
  description: string;
  frequency?: "daily" | "weekly" | "monthly" | "seasonal";
};

export type FamilyBehaviourEngine = {
  getProfile(familyId: string): Promise<FamilyBehaviourProfile>;
  updateFromTimeline(familyId: string, eventIds: string[]): Promise<FamilyBehaviourProfile>;
};
