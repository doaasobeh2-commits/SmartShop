import type { LocalOffer } from "../offer/LocalOffer";
import type { OfferValidity } from "../offer/OfferValidity";
import type { BasketRecommendationReason } from "./BasketRecommendationReason";

export type BasketItemStatus = "active" | "upcoming" | "unavailable" | "alternative";

/**
 * A single product line in an AI-generated shopping basket.
 */
export type BasketItem = {
  id: string;
  offer: LocalOffer;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  status: BasketItemStatus;
  validity: OfferValidity;
  recommendationReasons: BasketRecommendationReason[];
  expiryWarning?: string;
  /** Set when the primary product was unavailable and a local alternative was chosen. */
  replacedUnavailableOfferId?: string;
};
