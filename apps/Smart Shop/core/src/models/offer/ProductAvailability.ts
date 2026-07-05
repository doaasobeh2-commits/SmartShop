import type { DeliveryAvailability } from "../delivery/DeliveryAvailability";

export type FulfillmentMode = "delivery" | "pickup";

export type FulfillmentAvailability = {
  deliveryAvailable: boolean;
  pickupAvailable: boolean;
  modes: FulfillmentMode[];
  delivery?: DeliveryAvailability;
};

/**
 * Stock and purchase constraints for an offered product at a branch.
 */
export type ProductAvailability = {
  isAvailable: boolean;
  quantityLimit?: number;
  /** Suggested local alternative when the primary product is unavailable. */
  alternativeOfferId?: string;
  fulfillment: FulfillmentAvailability;
};
