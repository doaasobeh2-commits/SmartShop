/**
 * Premium tier capabilities — real AI and Household Intelligence Engine.
 */
export const PREMIUM_TIER_FEATURES = [
  "automatic_local_offer_search",
  "automatic_supermarket_comparison",
  "availability_checking",
  "best_shopping_time",
  "ai_basket_optimisation",
  "family_learning",
  "hidden_inventory_intelligence",
  "consumption_prediction",
  "shopping_prediction",
  "weekly_inventory_reports",
  "recipe_ai_integration",
  "fitness_ai_integration",
  "household_intelligence_engine",
  "decision_support",
  "recommendation_engine",
] as const;

export type PremiumTierFeature = (typeof PREMIUM_TIER_FEATURES)[number];

export type PremiumFeatureGate = {
  feature: PremiumTierFeature;
  requiresPremium: true;
  requiresAi: true;
};
