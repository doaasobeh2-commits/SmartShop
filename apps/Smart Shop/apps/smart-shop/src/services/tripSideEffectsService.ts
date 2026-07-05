import {
  applyPurchasesToProjection,
  offerSavings,
  type HouseholdMemory,
  type OfferView,
  type PurchaseLine,
} from "@smart-shop/core";
import {
  HOUSEHOLD_ID,
  loadInventoryProjection,
  loadMemory,
  saveInventoryProjection,
  saveMemory,
} from "../state/localStore";
import { getOfferViews } from "./offerService";

function estimateTripSavings(purchasedLines: PurchaseLine[], offers: OfferView[]): number {
  let total = 0;
  for (const line of purchasedLines.filter((item) => item.purchased)) {
    const match = offers.find((offer) =>
      line.productName.toLowerCase().includes(offer.productName.toLowerCase().slice(0, 8)),
    );
    if (match) {
      total += offerSavings(match);
    }
  }
  return total;
}

function appendMemoryValue(
  memory: HouseholdMemory,
  type: "estimated_savings",
  key: string,
  delta: number,
): HouseholdMemory {
  const existing = memory.entries.find((entry) => entry.type === type && entry.key === key);
  const now = new Date().toISOString();

  if (existing) {
    return {
      ...memory,
      entries: memory.entries.map((entry) =>
        entry.id === existing.id
          ? {
              ...entry,
              value: Number(entry.value) + delta,
              evidenceCount: entry.evidenceCount + 1,
              lastUpdatedAt: now,
            }
          : entry,
      ),
      lastUpdatedAt: now,
    };
  }

  return {
    ...memory,
    entries: [
      ...memory.entries,
      {
        id: `mem-${type}-${key}`,
        type,
        key,
        value: delta,
        evidenceCount: 1,
        lastUpdatedAt: now,
      },
    ],
    lastUpdatedAt: now,
  };
}

export function applyTripSideEffects(purchasedLines: PurchaseLine[]): void {
  const offers = getOfferViews();
  const savings = estimateTripSavings(purchasedLines, offers);

  const projection = applyPurchasesToProjection(
    loadInventoryProjection(HOUSEHOLD_ID),
    purchasedLines,
  );
  saveInventoryProjection(projection);

  if (savings > 0) {
    let memory = loadMemory(HOUSEHOLD_ID);
    memory = appendMemoryValue(memory, "estimated_savings", "all", savings);
    saveMemory(memory);
  }
}
