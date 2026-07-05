export type OfferMerchantType = "store" | "restaurant";

/**
 * Unified offer surface for Dashboard, Details and future browse.
 * UI never depends on offer source (admin, manual, OCR, API, community).
 */
export type OfferView = {
  id: string;
  merchantType: OfferMerchantType;
  merchantId: string;
  merchantName: string;
  productName: string;
  offerPrice: number;
  normalPrice?: number;
  currency: string;
  validUntilLabel: string;
  validUntilIso: string;
};

export type MerchantDetailsView = {
  merchantId: string;
  merchantType: OfferMerchantType;
  merchantName: string;
  productName?: string;
  offerPrice?: number;
  normalPrice?: number;
  currency?: string;
  validUntilLabel?: string;
  address?: string;
  phone?: string;
  openingHours?: string;
  website?: string;
  imageUrl?: string;
};

export function offerSavings(offer: OfferView): number {
  if (!offer.normalPrice || offer.normalPrice <= offer.offerPrice) {
    return 0;
  }
  return Math.round((offer.normalPrice - offer.offerPrice) * 100) / 100;
}

export function formatValidUntil(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }
  return date.toLocaleDateString("de-AT", { day: "2-digit", month: "2-digit" });
}
