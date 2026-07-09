import type { FlowScreen, MainTab, OverlayScreen } from "../types";

export const FLOW_SCREENS = ["welcome", "onboarding", "auth"] as const satisfies readonly FlowScreen[];

export const MAIN_TABS = ["today", "nutrition", "workout", "coach", "profile"] as const satisfies readonly MainTab[];

export const OVERLAY_SCREENS = ["premium"] as const satisfies readonly OverlayScreen[];

export type FlowRouteName = FlowScreen;
export type MainTabRouteName = MainTab;
export type OverlayRouteName = OverlayScreen;

/** Screen folder mapping for the app layer. */
export const MAIN_TAB_FOLDERS: Record<MainTab, string> = {
  today: "today",
  nutrition: "nutrition",
  workout: "workout",
  coach: "coach",
  profile: "profile",
};

export const OVERLAY_FOLDERS: Record<OverlayScreen, string> = {
  premium: "premium",
};
