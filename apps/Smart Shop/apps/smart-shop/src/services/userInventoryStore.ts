import type { StarterInventoryEntry } from "@smart-shop/core";
import { mergeStarterInventory } from "@smart-shop/core";

const STORAGE_KEY = "smartshop.starterInventory";

function readJson<T>(fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(value: StarterInventoryEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

export function loadStarterInventory(): StarterInventoryEntry[] {
  const stored = readJson<StarterInventoryEntry[] | null>(null);
  return mergeStarterInventory(stored);
}

export function saveStarterInventory(entries: StarterInventoryEntry[]): void {
  writeJson(entries);
}

export function slugItemName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9äöüß]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function createCustomInventoryItem(name: string, category: string): StarterInventoryEntry {
  return {
    id: `custom-${slugItemName(name)}-${Date.now()}`,
    name: name.trim(),
    category,
    quantity: 1,
    unit: "Stück",
    isEmpty: false,
    isCustom: true,
  };
}
