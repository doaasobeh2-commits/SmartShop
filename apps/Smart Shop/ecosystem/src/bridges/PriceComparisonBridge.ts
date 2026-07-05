/**
 * Future price comparison integrations.
 */
export type PriceComparisonBridge = {
  compareProduct(productName: string, city: string): Promise<unknown>;
  getBestLocalPrice(productName: string, familyId: string): Promise<unknown>;
};

export type PriceComparisonBridgeStatus = {
  enabled: boolean;
};

export const DEFAULT_PRICE_COMPARISON_BRIDGE_STATUS: PriceComparisonBridgeStatus = {
  enabled: false,
};
