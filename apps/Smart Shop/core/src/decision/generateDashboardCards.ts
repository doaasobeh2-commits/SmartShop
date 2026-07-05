import type { HouseholdKnowledge } from "../knowledge/HouseholdKnowledge";
import type { HouseholdMemory } from "../memory/HouseholdMemory";
import type { HouseholdSetupSnapshot } from "../models/household/HouseholdSetupSnapshot";
import type { HiddenInventoryProjection } from "../inventory/HiddenInventoryProjection";
import { getRunningLowLabels } from "../inventory/HiddenInventoryProjection";
import { offerSavings, rankStoreOffers, type OfferView } from "../offers";
import type { PlanLine } from "../plan/WeeklyHouseholdPlan";
import type { DashboardCard } from "./types";

export type DashboardDecisionInput = {
  setup: HouseholdSetupSnapshot;
  planLines: PlanLine[];
  memory: HouseholdMemory;
  knowledge: HouseholdKnowledge;
  offers: OfferView[];
  inventory: HiddenInventoryProjection;
};

function memoryNumber(memory: HouseholdMemory, type: string, key: string): number {
  const entry = memory.entries.find((item) => item.type === type && item.key === key);
  return entry ? Number(entry.value) : 0;
}

function preferredStoreName(knowledge: HouseholdKnowledge): string | undefined {
  const fact = knowledge.facts.find(
    (item) => item.type === "store_preference" && item.status === "active",
  );
  return fact?.value;
}

export function generateDashboardCards(input: DashboardDecisionInput): DashboardCard[] {
  const { setup, planLines, memory, knowledge, offers, inventory } = input;

  const unchecked = planLines.filter((line) => !line.checked);
  const planTotal = unchecked.reduce((sum, line) => sum + line.price, 0);
  const itemCount = unchecked.length;

  const cards: DashboardCard[] = [
    {
      id: "card-plan",
      type: "weekly_plan",
      title: "Wochenplan",
      lines: [`${itemCount} Artikel`, `Geschätzt €${planTotal.toFixed(2)}`],
      primaryValue: `${itemCount} Artikel`,
      secondaryValue: `€${planTotal.toFixed(2)}`,
      actionLabel: "Plan öffnen",
      action: "plan",
    },
  ];

  const runningLow = getRunningLowLabels(inventory, planLines, 3);
  if (runningLow.length > 0) {
    cards.push({
      id: "card-low",
      type: "running_low",
      title: "Bald leer",
      lines: runningLow,
      actionLabel: "Plan ansehen",
      action: "plan",
    });
  }

  const storeOffers = rankStoreOffers(offers);
  const preferredStore = preferredStoreName(knowledge);
  if (preferredStore) {
    storeOffers.sort((a, b) => {
      if (a.merchantName === preferredStore) {
        return -1;
      }
      if (b.merchantName === preferredStore) {
        return 1;
      }
      return 0;
    });
  }
  const bestOffer = storeOffers[0];
  if (bestOffer) {
    const savings = offerSavings(bestOffer);
    cards.push({
      id: "card-offer",
      type: "best_offer",
      title: "Bestes Angebot heute",
      lines: [
        bestOffer.merchantName,
        bestOffer.productName,
        `€${bestOffer.offerPrice.toFixed(2)}${bestOffer.normalPrice ? ` · statt €${bestOffer.normalPrice.toFixed(2)}` : ""}`,
        bestOffer.validUntilLabel,
      ],
      primaryValue: `€${bestOffer.offerPrice.toFixed(2)}`,
      secondaryValue: savings > 0 ? `Spare €${savings.toFixed(2)}` : undefined,
      offerId: bestOffer.id,
      actionLabel: "Details",
      action: "details",
    });
  }

  const spent = memoryNumber(memory, "purchase_total", "all");
  const budget = setup.monthlyBudget ?? 0;
  const remaining = budget > 0 ? Math.max(0, budget - spent) : 0;
  const estimatedSavings = storeOffers
    .slice(0, 3)
    .reduce((sum, offer) => sum + offerSavings(offer), 0);

  const budgetLines =
    budget > 0
      ? [`Ausgegeben €${spent.toFixed(2)}`, `Übrig €${remaining.toFixed(2)}`]
      : [`Ausgegeben €${spent.toFixed(2)}`];

  if (estimatedSavings > 0) {
    budgetLines.push(`Geschätzte Ersparnis €${estimatedSavings.toFixed(2)}`);
  }

  cards.push({
    id: "card-budget",
    type: "budget",
    title: "Budget",
    lines: budgetLines,
    primaryValue: budget > 0 ? `€${remaining.toFixed(0)} übrig` : undefined,
    actionLabel: "",
    action: "none",
  });

  const restaurantOffer = offers.find((offer) => offer.merchantType === "restaurant");
  if (restaurantOffer && cards.length < 5) {
    cards.push({
      id: "card-restaurant",
      type: "restaurant_offer",
      title: "Restaurant heute",
      lines: [
        restaurantOffer.merchantName,
        restaurantOffer.productName,
        `€${restaurantOffer.offerPrice.toFixed(2)}`,
      ],
      offerId: restaurantOffer.id,
      actionLabel: "Details",
      action: "details",
    });
  }

  return cards.slice(0, 5);
}

export function generateAnalyticsMetrics(
  memory: HouseholdMemory,
  knowledge: HouseholdKnowledge,
): import("./types").AnalyticsMetrics {
  const spent = memory.entries.find(
    (entry) => entry.type === "purchase_total" && entry.key === "all",
  );
  const storeFact = knowledge.facts.find(
    (fact) => fact.type === "store_preference" && fact.status === "active",
  );

  const categoryEntries = memory.entries
    .filter((entry) => entry.type === "category_spend")
    .sort((a, b) => Number(b.value) - Number(a.value));

  const topCategory = categoryEntries[0]?.key ?? "—";
  const favouriteSupermarket = storeFact?.value ?? "—";

  const savingsEntries = memory.entries.filter((entry) => entry.type === "estimated_savings");
  const savings = savingsEntries.reduce((sum, entry) => sum + Number(entry.value), 0);

  return {
    monthlySpending: spent ? Number(spent.value) : 0,
    savings,
    favouriteSupermarket,
    topCategory,
  };
}

export function generateNotifications(input: DashboardDecisionInput): import("./types").NotificationView[] {
  const cards = generateDashboardCards(input);
  const notifications: import("./types").NotificationView[] = [];

  const lowCard = cards.find((card) => card.type === "running_low");
  if (lowCard && lowCard.lines.length > 0) {
    notifications.push({
      id: "notif-low",
      title: "Bald leer",
      description: `${lowCard.lines[0]}${lowCard.lines.length > 1 ? ` und ${lowCard.lines.length - 1} weitere` : ""}`,
      timeLabel: "heute",
      unread: true,
      target: "plan",
    });
  }

  const offerCard = cards.find((card) => card.type === "best_offer");
  if (offerCard?.offerId) {
    notifications.push({
      id: "notif-offer",
      title: "Angebot heute",
      description: offerCard.lines.slice(0, 2).join(" · "),
      timeLabel: "heute",
      unread: true,
      target: "details",
      offerId: offerCard.offerId,
    });
  }

  const budget = input.setup.monthlyBudget ?? 0;
  const spent = input.memory.entries.find(
    (entry) => entry.type === "purchase_total" && entry.key === "all",
  );
  if (budget > 0 && spent && Number(spent.value) >= budget * 0.8) {
    notifications.push({
      id: "notif-budget",
      title: "Budget im Blick",
      description: `€${Number(spent.value).toFixed(0)} von €${budget} ausgegeben`,
      timeLabel: "heute",
      unread: true,
      target: "analytics",
    });
  }

  const restaurantCard = cards.find((card) => card.type === "restaurant_offer");
  if (restaurantCard?.offerId) {
    notifications.push({
      id: "notif-restaurant",
      title: "Restaurant-Angebot",
      description: restaurantCard.lines.slice(0, 2).join(" · "),
      timeLabel: "heute",
      unread: false,
      target: "details",
      offerId: restaurantCard.offerId,
    });
  }

  const planCard = cards.find((card) => card.type === "weekly_plan");
  if (planCard && notifications.length < 5) {
    notifications.push({
      id: "notif-plan",
      title: "Wochenplan bereit",
      description: planCard.lines.join(" · "),
      timeLabel: "diese Woche",
      unread: false,
      target: "plan",
    });
  }

  return notifications.slice(0, 5);
}
