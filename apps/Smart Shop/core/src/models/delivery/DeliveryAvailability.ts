/**
 * Delivery capability for a store relative to the family home location.
 */
export type DeliveryAvailability = {
  storeId: string;
  isAvailable: boolean;
  deliversToPostalCode?: string;
  deliversToDistrictArea?: string;
  deliveryRadiusKm?: number;
  estimatedMinutesMin?: number;
  estimatedMinutesMax?: number;
};

export type DeliveryAvailabilityInput = Omit<DeliveryAvailability, "storeId"> & {
  storeId: string;
};
