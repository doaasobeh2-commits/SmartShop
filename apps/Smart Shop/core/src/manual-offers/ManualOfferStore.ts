/**
 * Store classification for manually entered local offers.
 */
export type ManualOfferStoreType =
  | "supermarket"
  | "grocery"
  | "bakery"
  | "butcher"
  | "restaurant"
  | "pet_store"
  | "pharmacy"
  | "farmers_market"
  | "discount"
  | "other";

export const MANUAL_OFFER_STORE_TYPES: readonly ManualOfferStoreType[] = [
  "supermarket",
  "grocery",
  "bakery",
  "butcher",
  "restaurant",
  "pet_store",
  "pharmacy",
  "farmers_market",
  "discount",
  "other",
] as const;
