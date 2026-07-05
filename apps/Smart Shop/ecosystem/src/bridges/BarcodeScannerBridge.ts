/**
 * Future barcode scanner bridge.
 */
export type BarcodeScannerBridge = {
  lookupProduct(barcode: string): Promise<unknown>;
  addToBasket(familyId: string, barcode: string): Promise<unknown>;
};

export type BarcodeScannerBridgeStatus = {
  available: boolean;
};

export const DEFAULT_BARCODE_SCANNER_BRIDGE_STATUS: BarcodeScannerBridgeStatus = {
  available: false,
};
