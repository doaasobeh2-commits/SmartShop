/**
 * Cuisine classification for manually entered restaurant offers.
 */
export type RestaurantCuisineType =
  | "arabic"
  | "turkish"
  | "local"
  | "family_restaurant"
  | "bakery"
  | "food_shop"
  | "italian"
  | "asian"
  | "german"
  | "other";

export const RESTAURANT_CUISINE_TYPES: readonly RestaurantCuisineType[] = [
  "arabic",
  "turkish",
  "local",
  "family_restaurant",
  "bakery",
  "food_shop",
  "italian",
  "asian",
  "german",
  "other",
] as const;

export type RestaurantWeekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type RestaurantTimeWindow = {
  /** 24h time, e.g. "11:00" */
  from: string;
  /** 24h time, e.g. "14:00" */
  until: string;
};
