export type {
  InventoryProjectionItem,
  HiddenInventoryProjection,
} from "./HiddenInventoryProjection";
export {
  emptyInventoryProjection,
  applyPurchasesToProjection,
  decayInventoryProjection,
  getRunningLowLabels,
} from "./HiddenInventoryProjection";
export {
  STARTER_INVENTORY_CATALOG,
  STARTER_INVENTORY_UNITS,
  createDefaultStarterInventory,
  mergeStarterInventory,
  syncStarterInventoryToProjection,
} from "./starterInventory";
export type {
  StarterInventoryCatalogItem,
  StarterInventoryCategory,
  StarterInventoryEntry,
} from "./starterInventory";
