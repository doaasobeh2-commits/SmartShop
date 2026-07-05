/**
 * Future offer provider integrations.
 */
export type OfferProviderBridge = {
  fetchLocalOffers(familyId: string): Promise<unknown>;
  subscribeToStoreOffers(storeId: string): Promise<unknown>;
};

export type OfferProviderBridgeStatus = {
  providerCount: number;
};

export const DEFAULT_OFFER_PROVIDER_BRIDGE_STATUS: OfferProviderBridgeStatus = {
  providerCount: 0,
};
