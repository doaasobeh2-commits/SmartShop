import type { HiddenInventoryItem } from "./HiddenInventoryItem";
import type { InventoryAdjustment } from "./InventoryAdjustment";
import type { LearnedConsumptionPattern } from "./LearnedConsumptionPattern";
import type { ManualInventoryCorrection } from "./ManualInventoryCorrection";
import type {
  InventoryHistoryEntry,
  InventorySnapshot,
} from "./InventoryIntelligence";

/**
 * Private per-family inventory memory store.
 * Every family will later have its own isolated inventory database.
 */
export type FamilyInventoryMemory = {
  familyId: string;
  items: HiddenInventoryItem[];
  adjustments: InventoryAdjustment[];
  manualCorrections: ManualInventoryCorrection[];
  learnedPatterns: LearnedConsumptionPattern[];
  snapshots: InventorySnapshot[];
  history: InventoryHistoryEntry[];
  lastSyncedAt: string;
};
