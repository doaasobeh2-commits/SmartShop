import {
  syncStarterInventoryToProjection,
  type StarterInventoryEntry,
} from "@smart-shop/core";
import {
  HOUSEHOLD_ID,
  loadInventoryProjection,
  saveInventoryProjection,
} from "../state/localStore";
import { saveStarterInventory } from "./userInventoryStore";

export function persistStarterInventory(entries: StarterInventoryEntry[]): void {
  saveStarterInventory(entries);
  const projection = syncStarterInventoryToProjection(
    loadInventoryProjection(HOUSEHOLD_ID),
    entries,
  );
  saveInventoryProjection(projection);
}
