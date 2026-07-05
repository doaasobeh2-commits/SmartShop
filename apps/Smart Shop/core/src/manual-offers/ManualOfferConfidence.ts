/**
 * Confidence level for a manual offer.
 * Prepares future learning without AI inference in the free tier.
 */
export type ManualOfferConfidence =
  | "verified"
  | "photo"
  | "manual"
  | "word_of_mouth"
  | "future_verified";

export const MANUAL_OFFER_CONFIDENCE_LEVELS: readonly ManualOfferConfidence[] = [
  "verified",
  "photo",
  "manual",
  "word_of_mouth",
  "future_verified",
] as const;
