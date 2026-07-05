/**
 * Future flyer scraper integrations.
 */
export type FlyerScraperBridge = {
  scrapeStoreFlyers(storeId: string): Promise<unknown>;
  importScrapedFlyer(flyerId: string): Promise<unknown>;
};

export type FlyerScraperBridgeStatus = {
  enabled: boolean;
};

export const DEFAULT_FLYER_SCRAPER_BRIDGE_STATUS: FlyerScraperBridgeStatus = {
  enabled: false,
};
