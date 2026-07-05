/**
 * Policy governing how SmartShop AI builds and optimizes shopping baskets.
 */
export type SmartBasketPolicy = {
  /** Minimum savings required before splitting shopping across multiple stores. */
  minSavingsForMultiStoreSplit: number;
  /** Prefer fewer nearby stores when incremental savings are below the threshold. */
  preferFewerStores: boolean;
  /** Never include expired offers as active basket items. */
  rejectExpiredOffers: true;
  /** Upcoming offers may appear only when explicitly marked as upcoming. */
  allowUpcomingOffersWhenMarked: true;
  /** Never include unavailable products as active basket items. */
  rejectUnavailableProducts: true;
  /** Suggest a local available alternative when the preferred product is unavailable. */
  suggestLocalAlternatives: true;
  /** Compare preferred-brand price against similar local offers and cheaper alternatives. */
  comparePreferredBrandWithOffers: true;
  /** Warn when an active offer expires within this many days. */
  offerExpiryWarningDays: number;
  /** Basket items must include selection explanations. */
  requireSelectionExplanation: true;
  /** Basket must include offer validity dates. */
  requireOfferValidityDates: true;
  /** Basket must group products by store and estimate total per store. */
  requireStoreGrouping: true;
};

export const DEFAULT_SMART_BASKET_POLICY: SmartBasketPolicy = {
  minSavingsForMultiStoreSplit: 5,
  preferFewerStores: true,
  rejectExpiredOffers: true,
  allowUpcomingOffersWhenMarked: true,
  rejectUnavailableProducts: true,
  suggestLocalAlternatives: true,
  comparePreferredBrandWithOffers: true,
  offerExpiryWarningDays: 3,
  requireSelectionExplanation: true,
  requireOfferValidityDates: true,
  requireStoreGrouping: true,
};
