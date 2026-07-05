export type DashboardCardAction = "plan" | "details" | "none";

export type DashboardCardType =
  | "weekly_plan"
  | "running_low"
  | "best_offer"
  | "budget"
  | "restaurant_offer";

export type DashboardCard = {
  id: string;
  type: DashboardCardType;
  title: string;
  lines: string[];
  primaryValue?: string;
  secondaryValue?: string;
  offerId?: string;
  actionLabel: string;
  action: DashboardCardAction;
};

export type NotificationView = {
  id: string;
  title: string;
  description: string;
  timeLabel: string;
  unread: boolean;
  target: "plan" | "details" | "analytics" | "none";
  offerId?: string;
};

export type AnalyticsMetrics = {
  monthlySpending: number;
  savings: number;
  favouriteSupermarket: string;
  topCategory: string;
};
