/**
 * Free tier rules — deterministic algorithms only.
 * No OpenAI, LLM, or AI inference.
 */
export const FREE_TIER_RULES = {
  NO_AI_INFERENCE: "no_ai_inference",
  RULE_BASED_BASKET_ONLY: "rule_based_basket_only",
  MANUAL_OFFERS_ALLOWED: "manual_offers_allowed",
  MANUAL_LOCAL_OFFERS_DATABASE: "manual_local_offers_database",
  NO_AUTOMATIC_INTERNET_SEARCH: "no_automatic_internet_search",
  NO_SUPERMARKET_CRAWLING: "no_supermarket_crawling",
  NO_EXTERNAL_API: "no_external_api",
  OCR_TEXT_EXTRACTION_NOT_PREMIUM_AI: "ocr_text_extraction_not_premium_ai",
  FLYER_OCR_ALLOWED: "flyer_ocr_allowed",
  PREFERENCES_AND_FILTERS_ONLY: "preferences_and_filters_only",
  BASIC_REPORTS_ONLY: "basic_reports_only",
} as const;

export type FreeTierRule = (typeof FREE_TIER_RULES)[keyof typeof FREE_TIER_RULES];

export type FreeTierRuleSet = {
  rules: readonly FreeTierRule[];
  description: string;
};

export const FREE_TIER_RULE_SET: FreeTierRuleSet = {
  rules: Object.values(FREE_TIER_RULES),
  description:
    "Free SmartShop uses rules, algorithms, mathematics, sorting, filtering, ranking, preferences, dates, and manual user input only.",
};
