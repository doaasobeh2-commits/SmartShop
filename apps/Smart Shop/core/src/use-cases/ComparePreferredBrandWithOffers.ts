import type { BrandPreference } from "../models/preference/BrandPreference";
import type { LocalOfferWithContext } from "../models/offer/LocalOffer";

export type BrandOfferComparisonOption = {
  offer: LocalOfferWithContext;
  label: "preferred_brand" | "similar_local_offer" | "cheaper_alternative";
  price: number;
  savingsVsPreferred?: number;
};

export type ComparePreferredBrandWithOffersInput = {
  preferredBrand: BrandPreference;
  candidateOffers: LocalOfferWithContext[];
  productName: string;
};

export type ComparePreferredBrandWithOffersResult = {
  preferredBrandOption?: BrandOfferComparisonOption;
  similarLocalOffer?: BrandOfferComparisonOption;
  cheaperAlternative?: BrandOfferComparisonOption;
  recommendedOption: BrandOfferComparisonOption;
};

/**
 * Compares preferred-brand pricing against similar local offers and cheaper alternatives.
 */
export type ComparePreferredBrandWithOffers = {
  execute(
    input: ComparePreferredBrandWithOffersInput,
  ): ComparePreferredBrandWithOffersResult;
};
