/**
 * Lifecycle status for a manual offer.
 * Expired offers are ignored. Sold-out offers are not recommended.
 */
export type ManualOfferStatus =
  | "active"
  | "upcoming"
  | "expired"
  | "sold_out"
  | "unknown";

export const MANUAL_OFFER_STATUSES: readonly ManualOfferStatus[] = [
  "active",
  "upcoming",
  "expired",
  "sold_out",
  "unknown",
] as const;

export type ManualOfferStatusPolicy = {
  ignoreStatuses: readonly Extract<ManualOfferStatus, "expired">[];
  excludeFromRecommendations: readonly Extract<ManualOfferStatus, "expired" | "sold_out">[];
};

export const DEFAULT_MANUAL_OFFER_STATUS_POLICY: ManualOfferStatusPolicy = {
  ignoreStatuses: ["expired"],
  excludeFromRecommendations: ["expired", "sold_out"],
};
