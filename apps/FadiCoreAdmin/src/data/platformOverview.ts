import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Cpu,
  ShoppingCart,
  UtensilsCrossed,
  Users,
  Zap,
} from "lucide-react";

export type KpiTone = "blue" | "purple" | "green" | "yellow";

export type KpiStat = {
  id: string;
  value: string;
  label: string;
  footer?: string;
  footerTone?: "green" | "purple" | "muted";
  icon: LucideIcon;
  tone: KpiTone;
};

export const kpiStats: KpiStat[] = [
  {
    id: "households",
    value: "2,847",
    label: "Total Households",
    footer: "+23 this week",
    footerTone: "green",
    icon: Users,
    tone: "blue",
  },
  {
    id: "signals",
    value: "1.24M",
    label: "Signals (24h)",
    footer: "↑ 8% from yesterday",
    footerTone: "green",
    icon: Zap,
    tone: "purple",
  },
  {
    id: "engines",
    value: "6 / 6",
    label: "Active Engines",
    footer: "All systems nominal",
    footerTone: "green",
    icon: Cpu,
    tone: "green",
  },
  {
    id: "uptime",
    value: "99.7%",
    label: "System Uptime",
    footer: "7-day rolling average",
    footerTone: "muted",
    icon: Activity,
    tone: "yellow",
  },
];

export type AppStatus = {
  id: string;
  name: string;
  description: string;
  badge: "CONNECTED" | "BETA";
  icon: LucideIcon;
  tone: "blue" | "green" | "purple";
  signalsPerHour: string;
  lastSync: string;
  households: string;
};

export const connectedApps: AppStatus[] = [
  {
    id: "smartshop",
    name: "SmartShop AI",
    description: "Purchase & shopping intelligence",
    badge: "CONNECTED",
    icon: ShoppingCart,
    tone: "blue",
    signalsPerHour: "847",
    lastSync: "2m ago",
    households: "2,847",
  },
  {
    id: "recipe",
    name: "Recipe AI",
    description: "Recipe & nutrition recommendations",
    badge: "CONNECTED",
    icon: UtensilsCrossed,
    tone: "green",
    signalsPerHour: "312",
    lastSync: "5m ago",
    households: "1,923",
  },
  {
    id: "fitness",
    name: "Fitness AI",
    description: "Activity & fitness tracking",
    badge: "BETA",
    icon: Activity,
    tone: "purple",
    signalsPerHour: "198",
    lastSync: "12m ago",
    households: "741",
  },
];

export type SignalPoint = {
  day: string;
  value: number;
};

export const signalVolume: SignalPoint[] = [
  { day: "Mon", value: 620 },
  { day: "Tue", value: 780 },
  { day: "Wed", value: 910 },
  { day: "Thu", value: 1040 },
  { day: "Fri", value: 1180 },
  { day: "Sat", value: 1320 },
  { day: "Sun", value: 1380 },
];

export type AlertTone = "info" | "warning";

export type AlertItem = {
  id: string;
  message: string;
  time: string;
  tone: AlertTone;
};

export const recentAlerts: AlertItem[] = [
  {
    id: "1",
    message: "Recipe AI batch processed successfully",
    time: "2m ago",
    tone: "info",
  },
  {
    id: "2",
    message: "Fitness AI sync latency elevated (287ms)",
    time: "15m ago",
    tone: "warning",
  },
  {
    id: "3",
    message: "HH-7823 taste profile updated",
    time: "28m ago",
    tone: "info",
  },
  {
    id: "4",
    message: "SmartShop purchase signal batch completed",
    time: "1h ago",
    tone: "info",
  },
  {
    id: "5",
    message: "Nutrition engine confidence below target",
    time: "2h ago",
    tone: "warning",
  },
  {
    id: "6",
    message: "GDPR export REQ-0480 initiated",
    time: "3h ago",
    tone: "info",
  },
];
