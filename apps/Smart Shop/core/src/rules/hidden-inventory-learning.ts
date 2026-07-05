/**
 * Hidden inventory learning rules.
 * Architecture only — no inventory UI, meal UI, or Recipe/Fitness screens in v1.
 */
export const HIDDEN_INVENTORY_LEARNING_RULES = {
  PRIVATE_FAMILY_INVENTORY_DB: "private_family_inventory_db",
  PURCHASES_BECOME_INVENTORY_INPUTS: "purchases_become_inventory_inputs",
  REMEMBER_FAMILY_PURCHASES: "remember_family_purchases",
  ALLOW_MANUAL_QUANTITY_CORRECTIONS: "allow_manual_quantity_corrections",
  LEARN_CONSUMPTION_OVER_TIME: "learn_consumption_over_time",
  MEAL_DEDUCTIONS_AFTER_RECIPE_AI: "meal_deductions_after_recipe_ai",
  WEEKLY_REPORTS_LATER: "weekly_reports_later",
  REMAIN_HIDDEN_IN_V1: "remain_hidden_in_v1",
} as const;

export type HiddenInventoryLearningRule =
  (typeof HIDDEN_INVENTORY_LEARNING_RULES)[keyof typeof HIDDEN_INVENTORY_LEARNING_RULES];

export const HIDDEN_INVENTORY_LEARNING_RULE_SET = {
  rules: Object.values(HIDDEN_INVENTORY_LEARNING_RULES),
  description:
    "SmartShop records hidden inventory memory from purchases and manual corrections, learns consumption over time, and will later connect to Recipe AI for meal deductions and weekly inventory reports. None of this is visible in v1 UI.",
} as const;
