/**
 * Free tier capabilities — rules, algorithms, and manual input only.
 * No OpenAI, LLM, or AI inference.
 */
export const FREE_TIER_FEATURES = [
  "shopping_lists",
  "family_profile",
  "pets",
  "shopping_history",
  "manual_offers",
  "manual_local_offers_database",
  "restaurant_manual_offers",
  "flyer_import",
  "flyer_ocr",
  "brand_preferences",
  "favourite_stores",
  "city_selection",
  "shopping_radius",
  "budget",
  "rule_based_basket",
  "basic_reports",
] as const;

export type FreeTierFeature = (typeof FREE_TIER_FEATURES)[number];

export type RuleBasedBasketInput = {
  familyId: string;
  requestedProducts: string[];
  preferredBrands: string[];
  preferredStoreIds: string[];
  budgetLimit?: number;
  radiusKm: number;
  offerValidFrom?: string;
  offerValidUntil?: string;
};

export type RuleBasedBasketEngine = {
  generate(input: RuleBasedBasketInput): Promise<unknown>;
};
