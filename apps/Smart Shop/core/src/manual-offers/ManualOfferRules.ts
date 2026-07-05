/**
 * Free-tier rules for the manual local offers database.
 * No AI, no external data sources.
 */
export const MANUAL_OFFER_RULES = {
  NO_AI: "no_ai",
  NO_OPENAI: "no_openai",
  NO_LLM: "no_llm",
  NO_AUTOMATIC_INTERNET_SEARCH: "no_automatic_internet_search",
  NO_SUPERMARKET_CRAWLING: "no_supermarket_crawling",
  NO_EXTERNAL_API: "no_external_api",
  MANUAL_INPUT_ONLY: "manual_input_only",
  OCR_TEXT_EXTRACTION_ONLY: "ocr_text_extraction_only",
  OCR_NOT_PREMIUM_AI: "ocr_not_premium_ai",
  RESPECT_FAMILY_CITY: "respect_family_city",
  RESPECT_SHOPPING_RADIUS: "respect_shopping_radius",
  IGNORE_EXPIRED_OFFERS: "ignore_expired_offers",
  IGNORE_EXPIRED_RESTAURANT_OFFERS_IF_DATES_PROVIDED:
    "ignore_expired_restaurant_offers_if_dates_provided",
  EXCLUDE_SOLD_OUT_FROM_RECOMMENDATIONS: "exclude_sold_out_from_recommendations",
  OFFER_CONFIDENCE_TRACKED: "offer_confidence_tracked",
  MERCHANT_PROFILE_REFERENCES_ONLY: "merchant_profile_references_only",
  COMPACT_BASKET_NO_MERCHANT_DETAILS: "compact_basket_no_merchant_details",
  RESTAURANT_OFFERS_MANUAL_OR_PHOTO_ONLY: "restaurant_offers_manual_or_photo_only",
  RESTAURANT_PHONE_NUMBER_IMPORTANT: "restaurant_phone_number_important",
  USABLE_BY_DETERMINISTIC_BASKET: "usable_by_deterministic_basket",
  USABLE_BY_DETERMINISTIC_RECOMMENDATIONS: "usable_by_deterministic_recommendations",
} as const;

export type ManualOfferRule =
  (typeof MANUAL_OFFER_RULES)[keyof typeof MANUAL_OFFER_RULES];

export type ManualOfferRuleSet = {
  rules: readonly ManualOfferRule[];
  description: string;
};

export const MANUAL_OFFER_RULE_SET: ManualOfferRuleSet = {
  rules: Object.values(MANUAL_OFFER_RULES),
  description:
    "Free users build a private local offers database from manual entry and photo import. Includes restaurant street-board offers with phone numbers. Future OCR extracts text only. Offers feed deterministic basket rules and recommendations, respecting family city, shopping radius, and offer validity.",
};
