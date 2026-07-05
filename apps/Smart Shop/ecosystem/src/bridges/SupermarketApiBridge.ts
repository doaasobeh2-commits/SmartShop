/**
 * Future supermarket API integrations.
 */
export type SupermarketApiBridge = {
  searchProducts(storeId: string, query: string): Promise<unknown>;
  checkAvailability(storeId: string, productId: string): Promise<unknown>;
  getStoreCatalog(storeId: string): Promise<unknown>;
};

export type SupermarketApiBridgeStatus = {
  connectedStoreIds: string[];
};

export const DEFAULT_SUPERMARKET_API_BRIDGE_STATUS: SupermarketApiBridgeStatus = {
  connectedStoreIds: [],
};
