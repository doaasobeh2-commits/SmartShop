import type { GeoCoordinates } from "../location/FamilyHomeLocation";

/**
 * Physical or local retail location that may appear in SmartShop recommendations.
 */
export type StoreType =
  | "supermarket"
  | "grocery"
  | "restaurant"
  | "pharmacy"
  | "discount"
  | "organic"
  | "other";

export type Store = {
  id: string;
  name: string;
  type: StoreType;
  country: string;
  city: string;
  districtArea: string;
  postalCode: string;
  streetAddress?: string;
  coordinates?: GeoCoordinates;
  /** Opening hours to be modelled in a later phase. */
  openingHoursRef?: string;
};
