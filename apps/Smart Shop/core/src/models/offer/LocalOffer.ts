import type { Store } from "../store/Store";
import type { StoreBranch } from "../store/StoreBranch";
import type { ShoppingRange } from "../location/ShoppingRange";
import type { StoreDistancePolicy } from "../store/StoreDistancePolicy";
import type { OfferValidity } from "./OfferValidity";
import type { ProductAvailability } from "./ProductAvailability";

/**
 * Local promotion from a nearby store branch.
 * Ready for future integration with supermarket APIs and flyer/offer scraping.
 */
export type LocalOffer = {
  id: string;
  storeId: string;
  storeBranchId: string;
  productName: string;
  brand: string;
  category?: string;
  currency: string;
  normalPrice: number;
  offerPrice: number;
  discountPercentage: number;
  validity: OfferValidity;
  availability: ProductAvailability;
  /** Barcode or external product id for future product-database lookup. */
  externalProductRef?: string;
  isRecommendationEligible: boolean;
};

export type LocalOfferWithContext = LocalOffer & {
  store: Store;
  branch: StoreBranch;
};

/**
 * Contract for filtering offers by location policy.
 * Implementation must exclude offers from out-of-range stores.
 */
export type LocalOfferRangeFilter = {
  filterOffers(
    offers: LocalOfferWithContext[],
    range: ShoppingRange,
    policy: StoreDistancePolicy,
  ): LocalOfferWithContext[];
};
