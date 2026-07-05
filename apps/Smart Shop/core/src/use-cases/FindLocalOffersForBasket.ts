import type { FamilyProfileLocation } from "../models/family/FamilyProfileLocation";
import type { FamilyPreferenceProfile } from "../models/preference/FamilyPreferenceProfile";
import type { LocalOfferWithContext } from "../models/offer/LocalOffer";
import type { SmartBasketPolicy } from "../models/basket/SmartBasketPolicy";

export type FindLocalOffersForBasketInput = {
  familyLocation: FamilyProfileLocation;
  preferences: FamilyPreferenceProfile;
  /** Product names or categories the basket should source offers for. */
  requestedProducts: string[];
  policy: SmartBasketPolicy;
};

export type FindLocalOffersForBasketResult = {
  offers: LocalOfferWithContext[];
  excludedCount: number;
};

/**
 * Searches nearby offers scoped to family home location and shopping range.
 * Future adapters: supermarket APIs, flyer scraping, barcode/product databases.
 */
export type FindLocalOffersForBasket = {
  execute(input: FindLocalOffersForBasketInput): FindLocalOffersForBasketResult;
};
