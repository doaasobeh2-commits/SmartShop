/**
 * Merchant reference for compact basket items.
 * No duplicated merchant data inside basket items.
 */
export type BasketMerchantRef = {
  storeId?: string;
  restaurantId?: string;
  branchId?: string;
};

export type CompactBasketStatusIndicator =
  | "active"
  | "upcoming"
  | "expires_soon"
  | "sold_out"
  | "unknown";

/**
 * Compact basket line — display only essential shopping information.
 * Never includes address, phone, opening hours, website, or social media.
 */
export type CompactBasketItem = {
  id: string;
  offerId: string;
  merchantRef: BasketMerchantRef;
  /** Resolved display name from StoreProfile or RestaurantProfile. */
  merchantName: string;
  /** Product name or meal name. */
  itemLabel: string;
  offerPrice: number;
  currency: string;
  /** Compact validity label, e.g. "bis 12.07." */
  validityLabel: string;
  status: CompactBasketStatusIndicator;
};

/**
 * Expandable merchant details shown when the user selects a merchant name.
 * Future UI only — not rendered inline in the compact basket list.
 */
export type MerchantDetailsCard = {
  merchantRef: BasketMerchantRef;
  address?: string;
  phone?: string;
  openingHours?: string;
  deliverySupported: boolean;
  pickupSupported: boolean;
  website?: string;
  facebook?: string;
  instagram?: string;
  notes?: string;
};

export type MerchantDetailsResolver = {
  resolve(merchantRef: BasketMerchantRef, familyId: string): Promise<MerchantDetailsCard | null>;
};

/**
 * Clean, compact shopping basket for the free tier.
 */
export type CompactShoppingBasket = {
  id: string;
  familyId: string;
  items: CompactBasketItem[];
  grandTotal: number;
  currency: string;
  itemCount: number;
  generatedAt: string;
};
