export type FlowScreen =
  | "welcome"
  | "auth"
  | "language-location"
  | "food-preferences"
  | "weekly-plan-opt-in"
  | "tonight"
  | "recipe-preview"
  | "cook-mode"
  | "weekly-plan"
  | "feedback"
  | "cook-with-what-i-have";

export type MealFeedbackRating = "loved" | "good" | "not-for-us";

export type ScreenAtmosphere =
  | "kitchen-morning"
  | "kitchen-ingredients"
  | "vegetables-fresh"
  | "meal-evening"
  | "meal-preview"
  | "cookbook-dark"
  | "planning-light"
  | "dinner-complete";

export type InventoryStatus = "have" | "need";

export type InventoryItem = {
  id: string;
  name: string;
  detail: string;
  status: InventoryStatus;
  freshness?: string;
};

export type RecipeStep = {
  order: number;
  instruction: string;
  timerMinutes?: number;
};

export type MealRecommendation = {
  id: string;
  title: string;
  reason: string;
  prepMinutes: number;
  imageUrl?: string;
  cuisine: string;
  ingredients: InventoryItem[];
  steps: RecipeStep[];
  tips: string[];
  storageTip: string;
};

export type WeekDayPlan = {
  day: string;
  mealTitle: string;
};

export type AppPreferences = {
  onboardingComplete: boolean;
  foodPreferencesComplete: boolean;

  email?: string;
  language?: string;
  country?: string;
  city?: string;
  familySize?: string;
  dietType?: string;

  favoriteCuisines: string[];
  favoriteRestaurants: string[];

  allergies: string[];
  weeklyPlanningEnabled: boolean;
  weeklyPlanOptInAsked: boolean;
  feedbackGivenRecipeIds: string[];
};

export const ALLERGY_OPTIONS = [
  "Gluten",
  "Dairy",
  "Eggs",
  "Nuts",
  "Peanuts",
  "Fish",
  "Shellfish",
  "Soy",
  "Sesame",
] as const;

export const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;