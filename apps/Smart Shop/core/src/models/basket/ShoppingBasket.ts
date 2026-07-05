import type { BasketStoreGroup } from "./BasketStoreGroup";
import type { SmartBasketPolicy } from "./SmartBasketPolicy";

export type ShoppingBasketWarningCode =
  | "offer_expires_soon"
  | "upcoming_offer"
  | "unavailable_replaced_with_alternative"
  | "multi_store_split"
  | "budget_exceeded";

export type ShoppingBasketWarning = {
  code: ShoppingBasketWarningCode;
  message: string;
  relatedItemId?: string;
  relatedStoreBranchId?: string;
};

/**
 * AI-generated, local, family-aware, offer-aware shopping basket.
 */
export type ShoppingBasket = {
  id: string;
  familyId: string;
  storeGroups: BasketStoreGroup[];
  grandTotal: number;
  currency: string;
  storeCount: number;
  generatedAt: string;
  policy: SmartBasketPolicy;
  warnings: ShoppingBasketWarning[];
  /** Total estimated savings versus normal prices across selected offers. */
  estimatedSavings?: number;
};
