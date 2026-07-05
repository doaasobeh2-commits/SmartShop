/**
 * Explains why SmartShop AI selected a basket item.
 */
export type BasketRecommendationReasonCode =
  | "cheapest_nearby_offer"
  | "preferred_brand"
  | "healthier_choice"
  | "family_preference"
  | "recipe_nutrition_need"
  | "local_available_alternative"
  | "meaningful_multi_store_saving";

export type BasketRecommendationReason = {
  code: BasketRecommendationReasonCode;
  /** Human-readable explanation shown in the basket summary. */
  explanation: string;
};
