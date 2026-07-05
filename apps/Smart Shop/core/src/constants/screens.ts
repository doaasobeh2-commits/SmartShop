import type { ScreenId, ScreenRoute } from "../types/screens";

export const APP_NAME = "SmartShop AI" as const;

export const SCREEN_ORDER: readonly ScreenId[] = [
  "00-welcome",
  "01-onboarding-ai",
  "02-onboarding-save",
  "03-onboarding-family",
  "04-register",
  "05-dashboard",
  "06-profile",
  "07-family-pets",
  "08-notifications",
  "09-ai-assistant",
  "10-analytics",
  "11-shopping-list",
  "12-premium-subscription",
  "13-admin",
  "14-shopping-basket",
] as const;

export const FIGMA_SCREEN_ORDER: readonly ScreenId[] = SCREEN_ORDER.slice(0, 12);

export const SCREEN_ROUTES: readonly ScreenRoute[] = [
  { id: "00-welcome", path: "/welcome" },
  { id: "01-onboarding-ai", path: "/onboarding/ai" },
  { id: "02-onboarding-save", path: "/onboarding/save" },
  { id: "03-onboarding-family", path: "/onboarding/family" },
  { id: "04-register", path: "/register" },
  { id: "05-dashboard", path: "/" },
  { id: "06-profile", path: "/profile" },
  { id: "07-family-pets", path: "/family-pets" },
  { id: "08-notifications", path: "/notifications" },
  { id: "09-ai-assistant", path: "/ai-assistant" },
  { id: "10-analytics", path: "/analytics" },
  { id: "11-shopping-list", path: "/shopping-list" },
  { id: "12-premium-subscription", path: "/premium" },
  { id: "13-admin", path: "/admin" },
  { id: "14-shopping-basket", path: "/shopping-basket" },
] as const;

export const SCREEN_PATH_BY_ID: Record<ScreenId, string> = Object.fromEntries(
  SCREEN_ROUTES.map((route) => [route.id, route.path]),
) as Record<ScreenId, string>;
