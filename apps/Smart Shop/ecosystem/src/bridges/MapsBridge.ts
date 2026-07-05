/**
 * Future maps integration for local shopping.
 */
export type MapsBridge = {
  geocodeAddress(address: string): Promise<unknown>;
  findNearbyStores(latitude: number, longitude: number, radiusKm: number): Promise<unknown>;
  getRouteToStore(storeId: string): Promise<unknown>;
};

export type MapsBridgeStatus = {
  provider?: string;
};

export const DEFAULT_MAPS_BRIDGE_STATUS: MapsBridgeStatus = {};
