import type { PurchaseLine } from "../../plan/WeeklyHouseholdPlan";
import type { BehavioralSignal } from "./BehavioralSignal";

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeProductName(name: string): string {
  return name.trim().toLowerCase();
}

export function extractPurchaseSignals(
  householdId: string,
  lines: PurchaseLine[],
  observedAt = new Date().toISOString(),
): BehavioralSignal[] {
  const signals: BehavioralSignal[] = [];

  for (const line of lines.filter((item) => item.purchased)) {
    const productName = normalizeProductName(line.productName);

    signals.push({
      id: createId("sig"),
      householdId,
      source: "smart_shop",
      category: "purchase",
      observedAt,
      payload: {
        productName,
        category: line.category,
        storeName: line.storeName,
        price: line.price,
      },
      weight: 1,
    });

    signals.push({
      id: createId("sig"),
      householdId,
      source: "smart_shop",
      category: "ingredient_repeat",
      observedAt,
      payload: {
        ingredient: productName,
      },
      weight: 1,
    });
  }

  return signals;
}
