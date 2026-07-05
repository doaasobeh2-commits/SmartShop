import type { ManualOfferConfidence } from "./ManualOfferConfidence";
import type { ManualOfferInputMethod } from "./ManualOfferInput";
import type { ManualOfferSourceType } from "./ManualOfferSource";
import type { ManualOfferStatus } from "./ManualOfferStatus";

export type ManualOfferAvailability = {
  isAvailable: boolean;
  quantityLimit?: number;
};

/**
 * A retail offer manually entered or photo-imported by a free-tier family.
 * References StoreProfile by storeId — merchant data is not duplicated here.
 */
export type ManualLocalOffer = {
  id: string;
  familyId: string;
  storeId: string;
  inputMethod: ManualOfferInputMethod;
  sourceType: ManualOfferSourceType;
  productName: string;
  brand?: string;
  category: string;
  normalPrice?: number;
  offerPrice: number;
  currency: string;
  offerStartDate: string;
  offerEndDate: string;
  availability: ManualOfferAvailability;
  quantityLimit?: number;
  confidence: ManualOfferConfidence;
  status: ManualOfferStatus;
  notes?: string;
  photoRef?: string;
  /** Set when the offer originated from a photo import pending OCR review. */
  flyerImportId?: string;
  createdAt: string;
  updatedAt: string;
};

export type ManualLocalOfferDraft = Omit<
  ManualLocalOffer,
  "id" | "createdAt" | "updatedAt"
>;
