/**
 * Deterministic smart basket algorithm inputs.
 * Applies to both free (rule-based) and premium (AI-enhanced) tiers.
 */
export const DETERMINISTIC_BASKET_FACTORS = [
  "preferred_brands",
  "preferred_stores",
  "budget",
  "shopping_radius",
  "offer_dates",
  "offer_expiration",
  "availability",
  "manual_offers",
  "manual_local_offers_database",
  "restaurant_manual_offers",
  "compact_shopping_basket",
  "merchant_profile_references",
  "ocr_offers",
  "future_local_offers",
] as const;

export type DeterministicBasketFactor = (typeof DETERMINISTIC_BASKET_FACTORS)[number];

export type DeterministicBasketPolicy = {
  factors: readonly DeterministicBasketFactor[];
  requiresLocalOnly: true;
  usesAi: false;
};

export const FREE_DETERMINISTIC_BASKET_POLICY: DeterministicBasketPolicy = {
  factors: DETERMINISTIC_BASKET_FACTORS,
  requiresLocalOnly: true,
  usesAi: false,
};
