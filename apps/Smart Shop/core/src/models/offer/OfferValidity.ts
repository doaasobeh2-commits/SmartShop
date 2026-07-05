export type OfferValidityStatus = "active" | "expired" | "upcoming";

/**
 * Temporal window for a local offer.
 * Expired and not-yet-started offers must not appear as active basket items.
 */
export type OfferValidity = {
  validFrom: string;
  validUntil: string;
  status: OfferValidityStatus;
  /** True when the offer ends within the policy warning threshold. */
  expiresSoon?: boolean;
  daysUntilExpiry?: number;
};
