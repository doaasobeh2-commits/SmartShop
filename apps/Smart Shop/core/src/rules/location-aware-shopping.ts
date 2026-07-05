/**
 * Location-aware shopping rules for SmartShop AI.
 *
 * These rules are product requirements. UI, services, and ecosystem adapters
 * must comply before recommending stores, offers, or products.
 */
export const LOCATION_AWARE_SHOPPING_RULES = {
  /**
   * Rule 1 — Every family profile must define a complete home location:
   * country, city, district/area, postal code, and optional coordinates.
   */
  REQUIRE_FAMILY_HOME_LOCATION: "require_family_home_location",

  /**
   * Rule 2 — Recommendations are filtered by same city, selected radius (km),
   * delivery availability, store type, and opening hours (opening hours later).
   */
  FILTER_BY_LOCAL_CONTEXT: "filter_by_local_context",

  /**
   * Rule 3 — Never recommend products from stores outside the active shopping range.
   */
  NEVER_RECOMMEND_OUT_OF_RANGE: "never_recommend_out_of_range",

  /**
   * Rule 4 — Recipe AI and Fitness AI may later consume the same home location
   * and nutrition preferences through ecosystem models.
   */
  SHARED_HOME_LOCATION_FOR_ECOSYSTEM: "shared_home_location_for_ecosystem",

  /**
   * Rule 5 — SmartShop UI must later show only local supermarkets and shops
   * relevant to the family location.
   */
  UI_SHOWS_ONLY_LOCAL_STORES: "ui_shows_only_local_stores",
} as const;

export type LocationAwareShoppingRule =
  (typeof LOCATION_AWARE_SHOPPING_RULES)[keyof typeof LOCATION_AWARE_SHOPPING_RULES];

export type LocationAwareShoppingRuleSet = {
  rules: readonly LocationAwareShoppingRule[];
  description: string;
};

export const LOCATION_AWARE_SHOPPING_RULE_SET: LocationAwareShoppingRuleSet = {
  rules: Object.values(LOCATION_AWARE_SHOPPING_RULES),
  description:
    "SmartShop AI is location-aware. The family home city/area defines the shopping range. Supermarkets, shops, restaurants, offers, prices, and recommendations from another city or outside the allowed range must never be shown.",
};

export type ShoppingRecommendationFilterCriteria = {
  sameCity: boolean;
  radiusKm: number;
  deliveryAvailabilityRequired: boolean;
  storeTypes: string[];
  openingHoursEnforced: boolean;
};

export const DEFAULT_RECOMMENDATION_FILTER_CRITERIA: ShoppingRecommendationFilterCriteria =
  {
    sameCity: true,
    radiusKm: 10,
    deliveryAvailabilityRequired: false,
    storeTypes: ["supermarket", "grocery", "discount", "organic"],
    openingHoursEnforced: false,
  };
