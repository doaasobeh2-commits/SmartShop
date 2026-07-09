import type { DecisionTreeNode } from "../types";

/**
 * Registry of explainable decision trees used by Recommendation Engine.
 * Mirrors rule logic — update when rules change.
 */
export const RECOMMENDATION_DECISION_TREES: DecisionTreeNode[] = [
  {
    id: "tree-protein-evening",
    condition: "protein remaining ≥ 25 g AND hour ≥ 16",
    outcome: "Suggest protein-focused dinner",
    ref: "protein-remaining-evening",
  },
  {
    id: "tree-calories-low",
    condition: "calories remaining ≤ 400 AND > 0",
    outcome: "Suggest nutrient-dense choices",
    ref: "calories-near-limit",
  },
  {
    id: "tree-hydration",
    condition: "water < 50% of goal AND hour ≥ 12",
    outcome: "Water reminder",
    ref: "hydration-behind",
  },
  {
    id: "tree-workout",
    condition: "workout exercises incomplete",
    outcome: "Prompt today's session",
    ref: "workout-incomplete",
  },
  {
    id: "tree-recovery",
    condition: "all exercises complete",
    outcome: "Post-workout recovery guidance",
    ref: "recovery-post-workout",
  },
];
