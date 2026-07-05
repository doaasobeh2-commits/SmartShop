import type { ScreenId, ScreenRoute } from "../types/screens";

export const APP_NAME = "SmartShop AI" as const;

export const SCREEN_ORDER: readonly ScreenId[] = [
  "00-splash",
  "00-welcome",
  "03-login",
  "04-register",
  "15-household-wizard",
  "05-dashboard",
  "06-profile",
  "08-notifications",
  "10-analytics",
  "11-shopping-list",
  "14-shopping-basket",
  "16-shopping-complete",
  "12-premium-subscription",
  "13-admin",
] as const;

export const FIGMA_SCREEN_ORDER: readonly ScreenId[] = SCREEN_ORDER.filter(
  (id) =>
    ![
      "00-splash",
      "03-login",
      "15-household-wizard",
      "16-shopping-complete",
      "14-shopping-basket",
      "12-premium-subscription",
      "13-admin",
    ].includes(id),
);

export const SCREEN_ROUTES: readonly ScreenRoute[] = [
  { id: "00-splash", path: "/splash" },
  { id: "00-welcome", path: "/welcome" },
  { id: "03-login", path: "/login" },
  { id: "04-register", path: "/register" },
  { id: "15-household-wizard", path: "/setup" },
  { id: "05-dashboard", path: "/" },
  { id: "06-profile", path: "/profile" },
  { id: "07-family-pets", path: "/family-pets" },
  { id: "08-notifications", path: "/notifications" },
  { id: "09-ai-assistant", path: "/ai-assistant" },
  { id: "10-analytics", path: "/analytics" },
  { id: "11-shopping-list", path: "/shopping-list" },
  { id: "14-shopping-basket", path: "/shopping-basket" },
  { id: "16-shopping-complete", path: "/shopping-complete" },
  { id: "12-premium-subscription", path: "/premium" },
  { id: "13-admin", path: "/admin" },
] as const;

export const SCREEN_PATH_BY_ID: Record<ScreenId, string> = Object.fromEntries(
  SCREEN_ROUTES.map((route) => [route.id, route.path]),
) as Record<ScreenId, string>;
