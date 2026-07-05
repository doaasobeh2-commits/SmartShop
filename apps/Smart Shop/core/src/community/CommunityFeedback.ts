/**
 * Future community feedback architecture.
 * No runtime implementation in the free-tier pilot.
 */
export type CommunityFeedbackType =
  | "offer_still_available"
  | "offer_finished"
  | "price_changed"
  | "product_unavailable"
  | "incorrect_information";

export const COMMUNITY_FEEDBACK_TYPES: readonly CommunityFeedbackType[] = [
  "offer_still_available",
  "offer_finished",
  "price_changed",
  "product_unavailable",
  "incorrect_information",
] as const;

export type CommunityFeedbackReport = {
  id: string;
  familyId: string;
  offerId: string;
  feedbackType: CommunityFeedbackType;
  reportedAt: string;
  note?: string;
};

export type CommunityFeedbackWriter = {
  submit(report: CommunityFeedbackReport): Promise<void>;
};

export type CommunityFeedbackReader = {
  listByOffer(offerId: string): Promise<CommunityFeedbackReport[]>;
};

export type CommunityFeedbackEngine = CommunityFeedbackWriter & CommunityFeedbackReader;
