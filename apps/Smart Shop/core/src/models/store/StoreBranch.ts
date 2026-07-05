import type { GeoCoordinates } from "../location/FamilyHomeLocation";

/**
 * A specific retail branch within a store chain.
 * Offers and basket grouping are anchored to branches, not abstract chains.
 */
export type StoreBranch = {
  id: string;
  storeId: string;
  branchName?: string;
  city: string;
  districtArea: string;
  postalCode: string;
  streetAddress?: string;
  coordinates?: GeoCoordinates;
  /** Distance from family home in km — populated by future geo services. */
  distanceKmFromHome?: number;
};
