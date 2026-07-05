import type { ManualOfferConfidence } from "./ManualOfferConfidence";
import type { ManualOfferInputMethod } from "./ManualOfferInput";
import type { ManualOfferStatus } from "./ManualOfferStatus";
import type {
  RestaurantTimeWindow,
  RestaurantWeekday,
} from "./RestaurantCuisine";
import type { RestaurantOfferSourceType } from "./RestaurantOfferSource";

/**
 * A restaurant offer entered manually or via photo import.
 * References RestaurantProfile by restaurantId — merchant data is not duplicated here.
 */
export type ManualRestaurantOffer = {
  offerKind: "restaurant";
  id: string;
  familyId: string;
  restaurantId: string;
  inputMethod: ManualOfferInputMethod;
  sourceType: RestaurantOfferSourceType;
  offerTitle: string;
  mealName: string;
  normalPrice?: number;
  offerPrice: number;
  currency: string;
  offerStartDate?: string;
  offerEndDate?: string;
  availableDays?: RestaurantWeekday[];
  availableTimeWindow?: RestaurantTimeWindow;
  confidence: ManualOfferConfidence;
  status: ManualOfferStatus;
  notes?: string;
  photoRef?: string;
  flyerImportId?: string;
  createdAt: string;
  updatedAt: string;
};

export type ManualRestaurantOfferDraft = Omit<
  ManualRestaurantOffer,
  "id" | "createdAt" | "updatedAt"
>;
