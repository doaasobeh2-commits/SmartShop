/**
 * Canonical SmartShop screen identifiers.
 * Single source of truth for apps, ecosystem, and core.
 */
export type ScreenId =
  | "00-welcome"
  | "01-onboarding-ai"
  | "02-onboarding-save"
  | "03-onboarding-family"
  | "04-register"
  | "05-dashboard"
  | "06-profile"
  | "07-family-pets"
  | "08-notifications"
  | "09-ai-assistant"
  | "10-analytics"
  | "11-shopping-list"
  | "12-premium-subscription"
  | "13-admin"
  | "14-shopping-basket";

export type ScreenRoute = {
  id: ScreenId;
  path: string;
};

/** Figma-aligned consumer screens (v1 UI complete). */
export type FigmaScreenId = Exclude<
  ScreenId,
  "12-premium-subscription" | "13-admin" | "14-shopping-basket"
>;
