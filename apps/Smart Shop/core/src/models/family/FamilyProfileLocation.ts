import type { FamilyHomeLocation } from "../location/FamilyHomeLocation";
import type { ShoppingRange } from "../location/ShoppingRange";
import type { FamilyPreferenceProfile } from "../preference/FamilyPreferenceProfile";

/**
 * Location binding for a family profile.
 * SmartShop recommendations are always scoped to this home anchor.
 */
export type FamilyProfileLocation = {
  familyId: string;
  homeLocation: FamilyHomeLocation;
  activeShoppingRange: ShoppingRange;
};

/**
 * Full family shopping context used by basket generation use cases.
 */
export type FamilyShoppingContext = {
  location: FamilyProfileLocation;
  preferences: FamilyPreferenceProfile;
};
