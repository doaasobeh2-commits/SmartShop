/**
 * How a free-tier user discovered a restaurant offer.
 * Common for Arabic, Turkish, and local family restaurants with street boards.
 */
export type RestaurantOfferSourceType =
  | "street_board"
  | "phone_call"
  | "social_media"
  | "word_of_mouth"
  | "flyer"
  | "other";

export const RESTAURANT_OFFER_SOURCE_TYPES: readonly RestaurantOfferSourceType[] = [
  "street_board",
  "phone_call",
  "social_media",
  "word_of_mouth",
  "flyer",
  "other",
] as const;
