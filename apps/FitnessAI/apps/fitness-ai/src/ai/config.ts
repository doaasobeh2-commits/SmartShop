/**
 * AI layer boundary — communication only.
 *
 * AI MUST NOT:
 * - calculate calories, macros, or workout plans
 * - generate recommendations (Fitness Brain owns rules)
 *
 * AI MAY (when enabled):
 * - explain Brain reasoning in natural language
 * - motivate and educate
 * - personalise tone and copy
 */
export type AiLayerRole = "explain" | "motivate" | "educate" | "personalise";

export type AiLayerConfig = {
  enabled: boolean;
  provider: "placeholder";
  allowedRoles: AiLayerRole[];
  /** Brain remains source of truth for all numeric targets. */
  brainIsSourceOfTruth: true;
};

export const aiLayerConfig: AiLayerConfig = {
  enabled: false,
  provider: "placeholder",
  allowedRoles: ["explain", "motivate", "educate", "personalise"],
  brainIsSourceOfTruth: true,
};
