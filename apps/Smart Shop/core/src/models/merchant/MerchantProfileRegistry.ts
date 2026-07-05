import type { RestaurantProfile } from "./RestaurantProfile";
import type { StoreProfile } from "./StoreProfile";

/**
 * Per-family registry of merchant profiles referenced by manual offers and baskets.
 */
export type MerchantProfileRegistry = {
  familyId: string;
  stores: StoreProfile[];
  restaurants: RestaurantProfile[];
  lastUpdatedAt: string;
};

export type MerchantProfileRegistryReader = {
  getStore(familyId: string, storeId: string): Promise<StoreProfile | null>;
  getRestaurant(familyId: string, restaurantId: string): Promise<RestaurantProfile | null>;
  listStores(familyId: string): Promise<StoreProfile[]>;
  listRestaurants(familyId: string): Promise<RestaurantProfile[]>;
};

export type MerchantProfileRegistryWriter = {
  upsertStore(profile: StoreProfile): Promise<void>;
  upsertRestaurant(profile: RestaurantProfile): Promise<void>;
  removeStore(familyId: string, storeId: string): Promise<void>;
  removeRestaurant(familyId: string, restaurantId: string): Promise<void>;
};
