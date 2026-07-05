import type { GeoCoordinates } from "../location/FamilyHomeLocation";
import type { RestaurantCuisineType } from "../../manual-offers/RestaurantCuisine";

export type RestaurantSocialMedia = {
  facebook?: string;
  instagram?: string;
  other?: string;
};

export type RestaurantOpeningHours = {
  label: string;
  details?: string;
};

/**
 * Reusable profile for restaurants and small food shops.
 * Restaurant offers reference this by restaurantId — no duplicated merchant data on offers.
 */
export type RestaurantProfile = {
  restaurantId: string;
  familyId: string;
  name: string;
  cuisineType: RestaurantCuisineType;
  country: string;
  city: string;
  district: string;
  address?: string;
  phone: string;
  website?: string;
  socialMedia?: RestaurantSocialMedia;
  openingHours?: RestaurantOpeningHours;
  pickupSupported: boolean;
  deliverySupported: boolean;
  /** Reserved for future maps integration. */
  futureCoordinates?: GeoCoordinates;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type RestaurantProfileDraft = Omit<
  RestaurantProfile,
  "restaurantId" | "createdAt" | "updatedAt"
>;
