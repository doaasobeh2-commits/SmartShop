import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ShoppingCart,
  UtensilsCrossed,
} from "lucide-react";

export type IntegrationHealth = "HEALTHY" | "DEGRADED";

export type IntegrationAppId = "smartshop" | "recipe" | "fitness";

export type IntegrationApp = {
  id: IntegrationAppId;
  name: string;
  shortName: string;
  icon: LucideIcon;
  tone: "blue" | "green" | "purple";
  health: IntegrationHealth;
  lastSync: string;
  signalsInPerHour: number;
  predictionsOutPerHour: number;
  errors24h: number;
};

export const integrationApps: IntegrationApp[] = [
  {
    id: "smartshop",
    name: "SmartShop AI",
    shortName: "SmartShop",
    icon: ShoppingCart,
    tone: "blue",
    health: "HEALTHY",
    lastSync: "2m ago",
    signalsInPerHour: 847,
    predictionsOutPerHour: 312,
    errors24h: 0,
  },
  {
    id: "recipe",
    name: "Recipe AI",
    shortName: "Recipe AI",
    icon: UtensilsCrossed,
    tone: "green",
    health: "HEALTHY",
    lastSync: "5m ago",
    signalsInPerHour: 312,
    predictionsOutPerHour: 198,
    errors24h: 0,
  },
  {
    id: "fitness",
    name: "Fitness AI",
    shortName: "Fitness AI",
    icon: Activity,
    tone: "purple",
    health: "DEGRADED",
    lastSync: "12m ago",
    signalsInPerHour: 198,
    predictionsOutPerHour: 87,
    errors24h: 3,
  },
];

export type EndpointStatus = "OK" | "SLOW" | "WARNING";

export type ApiEndpoint = {
  id: string;
  endpoint: string;
  appId: IntegrationAppId | "core";
  appLabel: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  status: EndpointStatus;
  latencyMs: number;
  lastCalled: string;
  errors24h: number;
};

export const apiEndpoints: ApiEndpoint[] = [
  {
    id: "ingest-smartshop",
    endpoint: "/api/v1/signals/ingest",
    appId: "smartshop",
    appLabel: "SmartShop",
    method: "POST",
    status: "OK",
    latencyMs: 42,
    lastCalled: "2s ago",
    errors24h: 0,
  },
  {
    id: "ingest-recipe",
    endpoint: "/api/v1/signals/ingest",
    appId: "recipe",
    appLabel: "Recipe AI",
    method: "POST",
    status: "OK",
    latencyMs: 38,
    lastCalled: "5s ago",
    errors24h: 0,
  },
  {
    id: "ingest-fitness",
    endpoint: "/api/v1/signals/ingest",
    appId: "fitness",
    appLabel: "Fitness AI",
    method: "POST",
    status: "SLOW",
    latencyMs: 287,
    lastCalled: "12s ago",
    errors24h: 3,
  },
  {
    id: "proj-shop",
    endpoint: "/api/v1/projections/shop",
    appId: "smartshop",
    appLabel: "SmartShop",
    method: "GET",
    status: "OK",
    latencyMs: 61,
    lastCalled: "8s ago",
    errors24h: 0,
  },
  {
    id: "proj-recipe",
    endpoint: "/api/v1/projections/recipe",
    appId: "recipe",
    appLabel: "Recipe AI",
    method: "GET",
    status: "OK",
    latencyMs: 54,
    lastCalled: "11s ago",
    errors24h: 0,
  },
  {
    id: "proj-fitness",
    endpoint: "/api/v1/projections/fitness",
    appId: "fitness",
    appLabel: "Fitness AI",
    method: "GET",
    status: "SLOW",
    latencyMs: 312,
    lastCalled: "18s ago",
    errors24h: 3,
  },
  {
    id: "household-profile",
    endpoint: "/api/v1/household/profile",
    appId: "core",
    appLabel: "Core",
    method: "GET",
    status: "OK",
    latencyMs: 29,
    lastCalled: "4s ago",
    errors24h: 0,
  },
  {
    id: "bridge-warnings",
    endpoint: "/api/v1/bridges/fitness/health",
    appId: "fitness",
    appLabel: "Fitness AI",
    method: "GET",
    status: "WARNING",
    latencyMs: 198,
    lastCalled: "41s ago",
    errors24h: 1,
  },
];

export const toneBorder: Record<IntegrationApp["tone"], string> = {
  blue: "border-[#8FB0E8] text-navy",
  green: "border-[#7BC9A0] text-success",
  purple: "border-[#B8A0D4] text-accent-purple",
};

export const toneIconBg: Record<IntegrationApp["tone"], string> = {
  blue: "bg-navy text-white",
  green: "bg-success text-white",
  purple: "bg-accent-purple text-white",
};
