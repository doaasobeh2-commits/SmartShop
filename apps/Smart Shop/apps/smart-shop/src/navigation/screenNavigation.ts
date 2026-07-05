import type { ScreenId } from "@smart-shop/core/types";

export type AppScreenId = ScreenId;

export type ScreenNavigationProps = {
  onNavigate?: (screen: AppScreenId) => void;
  onBack?: () => void;
};

export const BOTTOM_NAV_TARGETS = {
  home: "05-dashboard",
  list: "11-shopping-list",
  analytics: "10-analytics",
  ai: "09-ai-assistant",
  notifications: "08-notifications",
} as const satisfies Record<string, AppScreenId>;
