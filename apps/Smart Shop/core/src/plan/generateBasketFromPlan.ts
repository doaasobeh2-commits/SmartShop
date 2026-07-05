import type { HouseholdSetupSnapshot } from "../models/household/HouseholdSetupSnapshot";
import type { PlanLine, PurchaseLine } from "./WeeklyHouseholdPlan";

export type BasketLineView = {
  id: string;
  merchantName: string;
  itemLabel: string;
  offerPrice: number;
  validityLabel: string;
  status: "active" | "expires_soon";
  planLineId: string;
};

function primaryStore(setup: HouseholdSetupSnapshot): string {
  return setup.favouriteSupermarkets[0] ?? "Billa";
}

function secondaryStore(setup: HouseholdSetupSnapshot): string {
  return setup.favouriteSupermarkets[1] ?? setup.favouriteSupermarkets[0] ?? "Merkur";
}

export function generateBasketFromPlan(
  lines: PlanLine[],
  setup: HouseholdSetupSnapshot,
): BasketLineView[] {
  const activeLines = lines.filter((line) => !line.checked);
  const primary = primaryStore(setup);
  const secondary = secondaryStore(setup);

  return activeLines.map((line, index) => ({
    id: `basket-${line.id}`,
    merchantName: index % 3 === 2 ? secondary : primary,
    itemLabel: line.name,
    offerPrice: line.price,
    validityLabel: "bis So.",
    status: index === 1 ? "expires_soon" : "active",
    planLineId: line.id,
  }));
}

export function buildPurchaseLines(
  basket: BasketLineView[],
  purchasedIds: Set<string>,
  planLines: PlanLine[] = [],
): PurchaseLine[] {
  const planById = new Map(planLines.map((line) => [line.id, line]));

  return basket.map((item) => {
    const planLine = planById.get(item.planLineId);
    return {
      id: item.id,
      productName: item.itemLabel,
      category: planLine?.category ?? "Einkauf",
      price: item.offerPrice,
      storeName: item.merchantName,
      purchased: purchasedIds.has(item.id),
    };
  });
}
