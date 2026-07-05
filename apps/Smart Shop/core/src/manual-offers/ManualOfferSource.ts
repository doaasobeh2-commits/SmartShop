/**
 * Where a free-tier user discovered the offer.
 * Manual input only — no automatic internet search or crawling.
 */
export type ManualOfferSourceType =
  | "supermarket_flyer"
  | "printed_newspaper"
  | "small_grocery_store"
  | "bakery"
  | "butcher_shop"
  | "restaurant"
  | "pet_store"
  | "pharmacy"
  | "farmers_market"
  | "social_media_ad"
  | "store_poster"
  | "word_of_mouth";

export const MANUAL_OFFER_SOURCE_TYPES: readonly ManualOfferSourceType[] = [
  "supermarket_flyer",
  "printed_newspaper",
  "small_grocery_store",
  "bakery",
  "butcher_shop",
  "restaurant",
  "pet_store",
  "pharmacy",
  "farmers_market",
  "social_media_ad",
  "store_poster",
  "word_of_mouth",
] as const;
