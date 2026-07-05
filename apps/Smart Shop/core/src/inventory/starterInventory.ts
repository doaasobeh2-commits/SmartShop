import type { HiddenInventoryProjection } from "./HiddenInventoryProjection";

export type StarterInventoryCategory =
  | "Grundnahrungsmittel"
  | "Haustier"
  | "Haushalt"
  | "Körperpflege";

export type StarterInventoryCatalogItem = {
  id: string;
  name: string;
  category: StarterInventoryCategory;
  defaultUnit: string;
};

export type StarterInventoryEntry = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  isEmpty: boolean;
  isCustom?: boolean;
};

export const STARTER_INVENTORY_CATALOG: readonly StarterInventoryCatalogItem[] = [
  { id: "milch", name: "Milch", category: "Grundnahrungsmittel", defaultUnit: "l" },
  { id: "brot", name: "Brot", category: "Grundnahrungsmittel", defaultUnit: "Stück" },
  { id: "eier", name: "Eier", category: "Grundnahrungsmittel", defaultUnit: "Stück" },
  { id: "reis", name: "Reis", category: "Grundnahrungsmittel", defaultUnit: "kg" },
  { id: "oel", name: "Öl", category: "Grundnahrungsmittel", defaultUnit: "Flasche" },
  { id: "zucker", name: "Zucker", category: "Grundnahrungsmittel", defaultUnit: "Packung" },
  { id: "kaffee", name: "Kaffee", category: "Grundnahrungsmittel", defaultUnit: "Packung" },
  { id: "tee", name: "Tee", category: "Grundnahrungsmittel", defaultUnit: "Packung" },
  { id: "nudeln", name: "Nudeln", category: "Grundnahrungsmittel", defaultUnit: "Packung" },
  { id: "mehl", name: "Mehl", category: "Grundnahrungsmittel", defaultUnit: "kg" },
  { id: "katzenfutter", name: "Katzenfutter", category: "Haustier", defaultUnit: "Packung" },
  { id: "hundefutter", name: "Hundefutter", category: "Haustier", defaultUnit: "Packung" },
  { id: "vogelfutter", name: "Vogelfutter", category: "Haustier", defaultUnit: "Packung" },
  { id: "fischfutter", name: "Fischfutter", category: "Haustier", defaultUnit: "Packung" },
  { id: "katzenstreu", name: "Katzenstreu", category: "Haustier", defaultUnit: "Packung" },
  { id: "toilettenpapier", name: "Toilettenpapier", category: "Haushalt", defaultUnit: "Packung" },
  { id: "kuechenrolle", name: "Küchenrolle", category: "Haushalt", defaultUnit: "Packung" },
  { id: "spuelmittel", name: "Spülmittel", category: "Haushalt", defaultUnit: "Flasche" },
  { id: "waschmittel", name: "Waschmittel", category: "Haushalt", defaultUnit: "Packung" },
  { id: "shampoo", name: "Shampoo", category: "Haushalt", defaultUnit: "Flasche" },
  { id: "seife", name: "Seife", category: "Körperpflege", defaultUnit: "Stück" },
  { id: "zahnpasta", name: "Zahnpasta", category: "Körperpflege", defaultUnit: "Stück" },
  { id: "deo", name: "Deo", category: "Körperpflege", defaultUnit: "Stück" },
  { id: "hautcreme", name: "Hautcreme", category: "Körperpflege", defaultUnit: "Stück" },
  { id: "parfum", name: "Parfum", category: "Körperpflege", defaultUnit: "Flasche" },
] as const;

export const STARTER_INVENTORY_UNITS = ["Stück", "Packung", "Flasche", "kg", "l"] as const;

function normalizeName(name: string): string {
  return name.toLowerCase().trim();
}

function estimateDaysRemaining(entry: StarterInventoryEntry): number {
  if (entry.isEmpty || entry.quantity <= 0) {
    return 0;
  }
  if (entry.quantity === 1) {
    return 2;
  }
  if (entry.quantity <= 3) {
    return 5;
  }
  return 10;
}

export function createDefaultStarterInventory(): StarterInventoryEntry[] {
  return STARTER_INVENTORY_CATALOG.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    quantity: 1,
    unit: item.defaultUnit,
    isEmpty: false,
  }));
}

export function mergeStarterInventory(
  stored: StarterInventoryEntry[] | null,
): StarterInventoryEntry[] {
  const defaults = createDefaultStarterInventory();
  if (!stored || stored.length === 0) {
    return defaults;
  }

  const storedById = new Map(stored.map((entry) => [entry.id, entry]));
  const merged = defaults.map((entry) => storedById.get(entry.id) ?? entry);
  const custom = stored.filter((entry) => entry.isCustom);
  return [...merged, ...custom];
}

/** Sync user-facing starter stock into the hidden inventory projection. */
export function syncStarterInventoryToProjection(
  projection: HiddenInventoryProjection,
  entries: StarterInventoryEntry[],
): HiddenInventoryProjection {
  const now = new Date().toISOString();
  let items = [...projection.items];

  for (const entry of entries) {
    const key = normalizeName(entry.name);
    const days = estimateDaysRemaining(entry);
    const existing = items.find((item) => normalizeName(item.productName) === key);
    const nextItem = {
      id: existing?.id ?? `inv-starter-${entry.id}`,
      productName: entry.name,
      category: entry.category,
      estimatedDaysRemaining: days,
      lastPurchasedAt: existing?.lastPurchasedAt ?? now,
    };

    if (existing) {
      items = items.map((item) => (item.id === existing.id ? nextItem : item));
    } else {
      items.push(nextItem);
    }
  }

  return {
    ...projection,
    items,
    lastUpdatedAt: now,
  };
}
