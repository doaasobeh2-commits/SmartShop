export type Lang = "en" | "ar" | "de";

/** Pre-auth onboarding flow. */
export type FlowScreen = "welcome" | "onboarding" | "auth";

/** Primary daily tabs — one question each. */
export type MainTab = "today" | "nutrition" | "workout" | "coach" | "profile";

/** Full-screen overlays that never interrupt the free tab experience. */
export type OverlayScreen = "premium";

export type AppScreen = MainTab | OverlayScreen;
