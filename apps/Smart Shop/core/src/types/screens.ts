/**
 * Canonical SmartShop screen identifiers.
 * Single source of truth for apps, ecosystem, and core.
 */
export type ScreenId =
  | "00-splash"
  | "00-welcome"
  | "03-login"
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
  | "14-shopping-basket"
  | "15-household-wizard"
  | "16-shopping-complete";

export type ScreenRoute = {
  id: ScreenId;
  path: string;
};

/** Figma-aligned consumer screens (v1 UI complete). */
export type FigmaScreenId = Exclude<
  ScreenId,
  | "00-splash"
  | "03-login"
  | "12-premium-subscription"
  | "13-admin"
  | "14-shopping-basket"
  | "15-household-wizard"
  | "16-shopping-complete"
>;
