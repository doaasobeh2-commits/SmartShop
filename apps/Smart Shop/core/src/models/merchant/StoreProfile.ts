import type { GeoCoordinates } from "../location/FamilyHomeLocation";

/**
 * Classification for local retail merchant profiles.
 */
export type StoreProfileType =
  | "supermarket"
  | "grocery"
  | "bakery"
  | "butcher"
  | "pharmacy"
  | "pet_store"
  | "discount"
  | "other";

export type StoreOpeningHours = {
  /** Human-readable or structured hours reference for a future parser. */
  label: string;
  details?: string;
};

/**
 * Reusable profile for supermarkets, groceries, bakeries, butchers,
 * pharmacies, pet stores, and local shops.
 * Manual offers reference this by storeId — no duplicated merchant data on offers.
 */
export type StoreProfile = {
  storeId: string;
  familyId: string;
  name: string;
  type: StoreProfileType;
  country: string;
  city: string;
  district: string;
  address?: string;
  phone?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  openingHours?: StoreOpeningHours;
  pickupSupported: boolean;
  deliverySupported: boolean;
  /** Reserved for future maps integration. */
  futureCoordinates?: GeoCoordinates;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type StoreProfileDraft = Omit<StoreProfile, "storeId" | "createdAt" | "updatedAt">;
