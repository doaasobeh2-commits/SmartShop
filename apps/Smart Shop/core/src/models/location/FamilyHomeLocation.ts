/**
 * Canonical home anchor for a family profile.
 * Every family must define where local shopping applies.
 */
export type GeoCoordinates = {
  latitude: number;
  longitude: number;
};

export type FamilyHomeLocation = {
  country: string;
  city: string;
  /** District or neighbourhood within the city. */
  districtArea: string;
  postalCode: string;
  coordinates?: GeoCoordinates;
};

export type FamilyHomeLocationInput = FamilyHomeLocation;

export function isFamilyHomeLocationComplete(
  location: Partial<FamilyHomeLocation>,
): location is FamilyHomeLocation {
  return Boolean(
    location.country?.trim() &&
      location.city?.trim() &&
      location.districtArea?.trim() &&
      location.postalCode?.trim(),
  );
}
