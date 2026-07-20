/** Living Kitchen onboarding hero imagery — gradients remain fallback in AtmosphereScreen. */
export const ONBOARDING_HERO_IMAGES = {
  language: "/assets/onboarding/hero-kitchen-morning.jpg",
  welcome: "/assets/onboarding/hero-kitchen-morning.jpg",
  auth: "/assets/onboarding/hero-kitchen-morning.jpg",
  householdHub: "/assets/onboarding/hero-kitchen-shared.jpg",
  householdMembers: "/assets/onboarding/hero-family-table.jpg",
  allergies: "/assets/onboarding/hero-fresh-ingredients.jpg",
  cuisine: "/assets/onboarding/hero-ingredients-spread.jpg",
  weeklyPlanOptIn: "/assets/onboarding/hero-planning-notebook.jpg",
} as const;

export type OnboardingHeroKey = keyof typeof ONBOARDING_HERO_IMAGES;
