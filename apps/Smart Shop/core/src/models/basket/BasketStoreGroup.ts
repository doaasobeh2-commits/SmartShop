import type { Store } from "../store/Store";
import type { StoreBranch } from "../store/StoreBranch";
import type { BasketItem } from "./BasketItem";

/**
 * Basket items grouped by store branch with per-store cost estimate.
 */
export type BasketStoreGroup = {
  store: Store;
  branch: StoreBranch;
  items: BasketItem[];
  subtotal: number;
  currency: string;
  estimatedTravelKm?: number;
};
