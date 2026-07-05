import type { MerchantProfileRegistry } from "../models/merchant/MerchantProfileRegistry";
import type { ManualOffer } from "./ManualOffer";

/**
 * Per-family local offers database built entirely from manual user input.
 * Offers reference merchant profiles — no duplicated store or restaurant data.
 */
export type ManualOffersDatabase = {
  familyId: string;
  merchantProfiles: MerchantProfileRegistry;
  offers: ManualOffer[];
  lastUpdatedAt: string;
};

export type ManualOffersDatabaseReader = {
  list(familyId: string): Promise<ManualOffer[]>;
  getById(familyId: string, offerId: string): Promise<ManualOffer | null>;
  getMerchantProfiles(familyId: string): Promise<MerchantProfileRegistry>;
};

export type ManualOffersDatabaseWriter = {
  add(offer: ManualOffer): Promise<void>;
  update(offer: ManualOffer): Promise<void>;
  remove(familyId: string, offerId: string): Promise<void>;
};

export type ManualOfferFilterCriteria = {
  familyCountry: string;
  familyCity: string;
  shoppingRadiusKm: number;
  /** ISO date used to exclude expired offers when dates are provided. */
  asOfDate?: string;
};

/**
 * Deterministic filter for basket and recommendation eligibility.
 * Expired and sold-out offers must be excluded.
 */
export type ManualOfferFilter = {
  filterActive(
    offers: ManualOffer[],
    criteria: ManualOfferFilterCriteria,
  ): ManualOffer[];
};
