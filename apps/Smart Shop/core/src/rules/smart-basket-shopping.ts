/**
 * SmartShop AI basket rules.
 *
 * The value of SmartShop AI is local, family-aware, offer-aware shopping.
 * Basket generation must search for the best nearby offers — not only list products.
 */
export const SMART_BASKET_SHOPPING_RULES = {
  LOCAL_FAMILY_OFFER_AWARE: "local_family_offer_aware",
  NEVER_RECOMMEND_OUT_OF_RANGE: "never_recommend_out_of_range",
  NEVER_RECOMMEND_EXPIRED_OFFERS: "never_recommend_expired_offers",
  NEVER_RECOMMEND_NOT_STARTED_UNLESS_UPCOMING:
    "never_recommend_not_started_unless_upcoming",
  NEVER_RECOMMEND_UNAVAILABLE_AS_ACTIVE: "never_recommend_unavailable_as_active",
  SUGGEST_LOCAL_ALTERNATIVE_WHEN_UNAVAILABLE:
    "suggest_local_alternative_when_unavailable",
  COMPARE_PREFERRED_BRAND_WITH_OFFERS: "compare_preferred_brand_with_offers",
  EXPLAIN_EACH_SELECTION: "explain_each_selection",
  INCLUDE_OFFER_VALIDITY_DATES: "include_offer_validity_dates",
  WARN_WHEN_OFFER_EXPIRES_SOON: "warn_when_offer_expires_soon",
  GROUP_BY_STORE_WITH_PER_STORE_TOTAL: "group_by_store_with_per_store_total",
  PREFER_FEWER_NEARBY_STORES: "prefer_fewer_nearby_stores",
  SPLIT_ACROSS_STORES_ONLY_FOR_MEANINGFUL_SAVINGS:
    "split_across_stores_only_for_meaningful_savings",
} as const;

export type SmartBasketShoppingRule =
  (typeof SMART_BASKET_SHOPPING_RULES)[keyof typeof SMART_BASKET_SHOPPING_RULES];

export type SmartBasketShoppingRuleSet = {
  rules: readonly SmartBasketShoppingRule[];
  description: string;
};

export const SMART_BASKET_SHOPPING_RULE_SET: SmartBasketShoppingRuleSet = {
  rules: Object.values(SMART_BASKET_SHOPPING_RULES),
  description:
    "SmartShop AI builds shopping baskets from the best nearby local offers, filtered by family home location, preferences, and offer validity. Baskets explain every selection, warn on soon-to-expire offers, and group items by store with per-store totals.",
};

export type FutureIntegrationSurface =
  | "supermarket_apis"
  | "flyer_offer_scraping"
  | "barcode_product_databases"
  | "recipe_ai"
  | "fitness_ai";

export const SMART_BASKET_FUTURE_INTEGRATIONS: readonly FutureIntegrationSurface[] =
  [
    "supermarket_apis",
    "flyer_offer_scraping",
    "barcode_product_databases",
    "recipe_ai",
    "fitness_ai",
  ];
