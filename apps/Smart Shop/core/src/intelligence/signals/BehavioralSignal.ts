/**
 * Raw behavioral observations contributed by platform applications.
 * Signals are inputs to inference — never shown to users and never stored as facts.
 */
export type BehavioralSignalSource =
  | "smart_shop"
  | "recipe_ai"
  | "fitness_ai"
  | "system";

export type BehavioralSignalCategory =
  | "purchase"
  | "ingredient_repeat"
  | "recipe_accepted"
  | "recipe_rejected"
  | "meal_cooked"
  | "store_visit"
  | "budget_event"
  | "locale_context"
  | "seasonal_purchase"
  | "offer_accepted"
  | "offer_ignored";

export type BehavioralSignal = {
  id: string;
  householdId: string;
  source: BehavioralSignalSource;
  category: BehavioralSignalCategory;
  observedAt: string;
  /** Normalized key-value payload (e.g. productName, ingredient, cuisineTag). */
  payload: Record<string, string | number | boolean>;
  /** Relative importance when multiple signals compete. Default 1. */
  weight: number;
};

export type BehavioralSignalBatch = {
  householdId: string;
  signals: BehavioralSignal[];
  contributedAt: string;
};
