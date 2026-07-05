import type { ManualLocalOffer } from "./ManualLocalOffer";
import type { ManualRestaurantOffer } from "./ManualRestaurantOffer";

/**
 * Union of all manually entered local offers in the family database.
 */
export type ManualOffer = ManualLocalOffer | ManualRestaurantOffer;

export type ManualOfferKind = "retail" | "restaurant";

export function isManualRestaurantOffer(offer: ManualOffer): offer is ManualRestaurantOffer {
  return "offerKind" in offer && offer.offerKind === "restaurant";
}

export function isManualRetailOffer(offer: ManualOffer): offer is ManualLocalOffer {
  return !("offerKind" in offer);
}
