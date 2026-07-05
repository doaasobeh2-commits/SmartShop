import type { PurchaseLine } from "../plan/WeeklyHouseholdPlan";
import type { PlanLine } from "../plan/WeeklyHouseholdPlan";

export type InventoryProjectionItem = {
  id: string;
  productName: string;
  category: string;
  estimatedDaysRemaining: number;
  lastPurchasedAt: string;
};

export type HiddenInventoryProjection = {
  householdId: string;
  items: InventoryProjectionItem[];
  lastUpdatedAt?: string;
};

const DEFAULT_DAYS_BY_CATEGORY: Record<string, number> = {
  Milch: 5,
  Backwaren: 3,
  Obst: 7,
  Fleisch: 4,
  Haushalt: 21,
  Haustier: 14,
  Getränke: 10,
  Gemüse: 5,
  Grundnahrungsmittel: 14,
};

const STAPLE_KEYWORDS = ["milch", "brot", "hundefutter", "katzenfutter"];

function defaultDays(category: string): number {
  return DEFAULT_DAYS_BY_CATEGORY[category] ?? 7;
}

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/\s*\(.*\)/, "").trim();
}

export function emptyInventoryProjection(householdId: string): HiddenInventoryProjection {
  return { householdId, items: [] };
}

export function applyPurchasesToProjection(
  projection: HiddenInventoryProjection,
  purchasedLines: PurchaseLine[],
): HiddenInventoryProjection {
  const now = new Date().toISOString();
  let items = [...projection.items];

  for (const line of purchasedLines.filter((item) => item.purchased)) {
    const key = normalizeName(line.productName);
    const existing = items.find((item) => normalizeName(item.productName) === key);

    if (existing) {
      items = items.map((item) =>
        item.id === existing.id
          ? {
              ...item,
              category: line.category !== "Einkauf" ? line.category : item.category,
              estimatedDaysRemaining: defaultDays(item.category),
              lastPurchasedAt: now,
            }
          : item,
      );
      continue;
    }

    items.push({
      id: `inv-${key.replace(/\s+/g, "-")}`,
      productName: line.productName.replace(/\s*\(\d+\/\d+\)/, ""),
      category: line.category === "Einkauf" ? "Grundnahrungsmittel" : line.category,
      estimatedDaysRemaining: defaultDays(line.category),
      lastPurchasedAt: now,
    });
  }

  return {
    ...projection,
    items,
    lastUpdatedAt: now,
  };
}

export function decayInventoryProjection(
  projection: HiddenInventoryProjection,
): HiddenInventoryProjection {
  const now = Date.now();
  const items = projection.items
    .map((item) => {
      const daysSincePurchase =
        (now - new Date(item.lastPurchasedAt).getTime()) / (1000 * 60 * 60 * 24);
      const remaining = Math.max(
        0,
        Math.round(item.estimatedDaysRemaining - daysSincePurchase),
      );
      return { ...item, estimatedDaysRemaining: remaining };
    })
    .filter((item) => item.estimatedDaysRemaining >= 0);

  return {
    ...projection,
    items,
    lastUpdatedAt: new Date().toISOString(),
  };
}

export function getRunningLowLabels(
  projection: HiddenInventoryProjection,
  planLines: PlanLine[],
  maxItems = 3,
): string[] {
  const decayed = decayInventoryProjection(projection);
  const lowFromInventory = decayed.items
    .filter((item) => item.estimatedDaysRemaining <= 3)
    .sort((a, b) => a.estimatedDaysRemaining - b.estimatedDaysRemaining)
    .map((item) => item.productName);

  if (lowFromInventory.length >= maxItems) {
    return lowFromInventory.slice(0, maxItems);
  }

  const fallback = planLines
    .filter((line) => !line.checked)
    .filter((line) =>
      STAPLE_KEYWORDS.some((keyword) => line.name.toLowerCase().includes(keyword)),
    )
    .map((line) => line.name.replace(/\s*\(\d+\/\d+\)/, ""));

  const combined = [...new Set([...lowFromInventory, ...fallback])];
  return combined.slice(0, maxItems);
}
