import { useMemo } from "react";
import {
  generateAnalyticsMetrics,
  generateDashboardCards,
  generateNotifications,
  type AnalyticsMetrics,
  type DashboardCard,
  type NotificationView,
} from "@smart-shop/core";
import { useAppState } from "../state/AppProvider";
import {
  HOUSEHOLD_ID,
  loadInventoryProjection,
  loadKnowledge,
  loadMemory,
} from "../state/localStore";
import { getMerchantDetails, getOfferViews } from "../services/offerService";

export type DecisionLayer = {
  dashboardCards: DashboardCard[];
  notifications: NotificationView[];
  analytics: AnalyticsMetrics;
  openDetails: (offerId: string) => ReturnType<typeof getMerchantDetails>;
};

export function useDecisionLayer(): DecisionLayer {
  const { householdSetup, planLines, decisionVersion } = useAppState();

  return useMemo(() => {
    const memory = loadMemory(HOUSEHOLD_ID);
    const knowledge = loadKnowledge(HOUSEHOLD_ID);
    const inventory = loadInventoryProjection(HOUSEHOLD_ID);
    const offers = getOfferViews();

    const input = {
      setup: householdSetup,
      planLines,
      memory,
      knowledge,
      offers,
      inventory,
    };

    return {
      dashboardCards: generateDashboardCards(input),
      notifications: generateNotifications(input),
      analytics: generateAnalyticsMetrics(memory, knowledge),
      openDetails: getMerchantDetails,
    };
  }, [householdSetup, planLines, decisionVersion]);
}
