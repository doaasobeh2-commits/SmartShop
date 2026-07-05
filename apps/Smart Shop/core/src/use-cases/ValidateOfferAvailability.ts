import type { LocalOffer } from "../models/offer/LocalOffer";
import type { OfferValidity } from "../models/offer/OfferValidity";
import type { ProductAvailability } from "../models/offer/ProductAvailability";
import type { SmartBasketPolicy } from "../models/basket/SmartBasketPolicy";

export type OfferAvailabilityRejectionReason =
  | "expired"
  | "not_started"
  | "unavailable"
  | "outside_shopping_range"
  | "outside_family_city";

export type ValidateOfferAvailabilityInput = {
  offer: LocalOffer;
  referenceDate: string;
  policy: SmartBasketPolicy;
};

export type ValidateOfferAvailabilityResult = {
  isEligible: boolean;
  validity: OfferValidity;
  availability: ProductAvailability;
  rejectionReasons: OfferAvailabilityRejectionReason[];
  canIncludeAsUpcoming: boolean;
  expiresSoon: boolean;
};

/**
 * Validates temporal and stock eligibility before an offer enters a basket.
 */
export type ValidateOfferAvailability = {
  execute(
    input: ValidateOfferAvailabilityInput,
  ): ValidateOfferAvailabilityResult;
};
