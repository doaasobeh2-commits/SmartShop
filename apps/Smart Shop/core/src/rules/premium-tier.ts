/**
 * Premium tier rules — activates real AI and Household Intelligence Engine.
 */
export const PREMIUM_TIER_RULES = {
  AI_FEATURES_ENABLED: "ai_features_enabled",
  HOUSEHOLD_INTELLIGENCE_ENABLED: "household_intelligence_enabled",
  LOCAL_OFFER_SEARCH_AUTOMATIC: "local_offer_search_automatic",
  BASKET_AI_OPTIMISATION: "basket_ai_optimisation",
  FAMILY_LEARNING_ENABLED: "family_learning_enabled",
  INVENTORY_INTELLIGENCE_ENABLED: "inventory_intelligence_enabled",
  DECISION_SUPPORT_ENABLED: "decision_support_enabled",
} as const;

export type PremiumTierRule =
  (typeof PREMIUM_TIER_RULES)[keyof typeof PREMIUM_TIER_RULES];

export type PremiumTierRuleSet = {
  rules: readonly PremiumTierRule[];
  description: string;
};

export const PREMIUM_TIER_RULE_SET: PremiumTierRuleSet = {
  rules: Object.values(PREMIUM_TIER_RULES),
  description:
    "Premium SmartShop activates real AI features, Household Intelligence Engine, and advanced learning from the household timeline.",
};
