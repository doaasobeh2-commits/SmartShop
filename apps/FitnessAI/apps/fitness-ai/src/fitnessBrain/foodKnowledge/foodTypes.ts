/**
 * Food Knowledge types — normalized, source-aware nutrition records.
 * General fitness guidance only — not medical advice or clinical nutrition.
 */

/** Where nutrition data originated — drives confidence and attribution. */
export type FoodSourceCategory =
  | "verified_database"
  | "open_food_database"
  | "user_custom_food"
  | "estimated_food"
  | "manual_entry";

export type FoodConfidenceLevel = "high" | "medium" | "low";

/** Canonical food record used across Fitness Brain nutrition layers. */
export type FoodKnowledgeItem = {
  id: string;
  name: string;
  brand?: string;
  source: FoodSourceCategory;
  sourceFoodId: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  salt?: number;
  confidence: FoodConfidenceLevel;
  lastUpdated: string;
  sourceAttribution: string;
};

/** Nutrients normalized per 100 g/ml — internal interchange format. */
export type NormalizedNutritionPer100 = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  salt?: number;
};

export type FoodSearchQuery = {
  query: string;
  locale?: "de" | "en";
  limit?: number;
  sources?: FoodSourceCategory[];
};

export type FoodSearchResult = {
  item: FoodKnowledgeItem;
  matchScore: number;
};

export type BarcodeLookupResult = {
  barcode: string;
  item: FoodKnowledgeItem | null;
  /** True when a future Open Food Facts adapter would be invoked. */
  adapterReady: boolean;
};

/** User-created food — always tagged user_custom_food. */
export type UserCustomFoodInput = {
  name: string;
  brand?: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  salt?: number;
};

/** Rough portion estimate — always tagged estimated_food with low confidence. */
export type EstimatedFoodInput = {
  name: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  salt?: number;
  reason?: string;
};

/** Minimal manual log entry — user typed values without a database match. */
export type ManualFoodEntryInput = {
  name: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

/** Persisted food log — installation-scoped, no personal identity. */
export type FoodLogEntry = {
  id: string;
  foodKnowledgeId: string;
  name: string;
  source: FoodSourceCategory;
  confidence: FoodConfidenceLevel;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string;
  time: string;
  localInstallationId: string;
  loggedAt: string;
};

export type ScalePortionInput = {
  item: FoodKnowledgeItem;
  servingSize: number;
  servingUnit?: string;
};

export type ScaledFoodPortion = {
  item: FoodKnowledgeItem;
  factor: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  salt?: number;
};
