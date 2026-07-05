export const BOTTOM_NAV_TARGETS = {
  home: "05-dashboard",
  plan: "11-shopping-list",
  analytics: "10-analytics",
  profile: "06-profile",
} as const satisfies Record<string, import("@smart-shop/core/types").ScreenId>;

export const SHOPPING_FLOW_TARGETS = {
  basket: "14-shopping-basket",
  completed: "16-shopping-complete",
} as const satisfies Record<string, import("@smart-shop/core/types").ScreenId>;

export type AppScreenId = import("@smart-shop/core/types").ScreenId;

export type ScreenNavigationProps = {
  onNavigate?: (screen: AppScreenId) => void;
  onNavigateRoot?: (screen: AppScreenId) => void;
  onBack?: () => void;
};

export type MainNavId = keyof typeof BOTTOM_NAV_TARGETS;
