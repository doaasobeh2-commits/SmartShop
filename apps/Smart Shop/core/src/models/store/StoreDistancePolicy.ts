import type { ShoppingRange } from "../location/ShoppingRange";
import type { DeliveryAvailability } from "../delivery/DeliveryAvailability";
import type { Store, StoreType } from "./Store";

/**
 * Rules that determine whether a store is eligible inside the active shopping range.
 */
export type StoreDistancePolicy = {
  requireSameCity: true;
  maxRadiusKm: number;
  allowedStoreTypes: StoreType[];
  requireDeliveryAvailable: boolean;
};

export type StoreDistanceRejectionReason =
  | "outside_radius"
  | "different_city"
  | "store_type_excluded"
  | "delivery_unavailable"
  | "incomplete_home_location";

export type StoreDistanceEvaluation = {
  storeId: string;
  distanceKm: number | null;
  isWithinRange: boolean;
  isSameCity: boolean;
  rejectionReasons: StoreDistanceRejectionReason[];
};

/**
 * Contract for range filtering. Implementation belongs in core services later.
 * Must never return true for stores outside the active shopping range.
 */
export type StoreDistancePolicyEvaluator = {
  evaluate(
    store: Store,
    range: ShoppingRange,
    policy: StoreDistancePolicy,
    delivery?: DeliveryAvailability,
  ): StoreDistanceEvaluation;
};

export const DEFAULT_STORE_DISTANCE_POLICY: StoreDistancePolicy = {
  requireSameCity: true,
  maxRadiusKm: 10,
  allowedStoreTypes: ["supermarket", "grocery", "discount", "organic"],
  requireDeliveryAvailable: false,
};
