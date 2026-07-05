import type { FamilyHomeLocation } from "./FamilyHomeLocation";

/**
 * Active shopping boundary derived from the family home location.
 * Defines how far from home stores and offers may be considered.
 */
export type ShoppingRange = {
  homeLocation: FamilyHomeLocation;
  /** Selected search radius in kilometres from the home location. */
  radiusKm: number;
};

export type ShoppingRangeInput = {
  homeLocation: FamilyHomeLocation;
  radiusKm: number;
};
