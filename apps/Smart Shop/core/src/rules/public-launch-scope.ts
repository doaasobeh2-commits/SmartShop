/**
 * Public v1 scope for SmartShop AI.
 * Recipe AI and Fitness AI must not appear in UI yet.
 */
export const PUBLIC_LAUNCH_FEATURES = {
  SMART_SHOPPING: "smart_shopping",
  LOCAL_OFFERS: "local_offers",
  AI_SHOPPING_BASKET: "ai_shopping_basket",
  FAMILY_PREFERENCES: "family_preferences",
  SAVED_SHOPPING_HISTORY: "saved_shopping_history",
} as const;

export type PublicLaunchFeature =
  (typeof PUBLIC_LAUNCH_FEATURES)[keyof typeof PUBLIC_LAUNCH_FEATURES];

export const HIDDEN_UNTIL_LATER_FEATURES = {
  RECIPE_AI: "recipe_ai",
  FITNESS_AI: "fitness_ai",
  INVENTORY_UI: "inventory_ui",
  MEAL_UI: "meal_ui",
  WEEKLY_INVENTORY_REPORT_UI: "weekly_inventory_report_ui",
} as const;

export type HiddenUntilLaterFeature =
  (typeof HIDDEN_UNTIL_LATER_FEATURES)[keyof typeof HIDDEN_UNTIL_LATER_FEATURES];

export const PUBLIC_LAUNCH_SCOPE = {
  visibleFeatures: Object.values(PUBLIC_LAUNCH_FEATURES),
  hiddenFeatures: Object.values(HIDDEN_UNTIL_LATER_FEATURES),
  description:
    "SmartShop launches first as a shopping app: smart shopping, local offers, AI shopping basket, family preferences, and saved shopping history. Inventory intelligence and Recipe/Fitness AI remain hidden.",
} as const;
