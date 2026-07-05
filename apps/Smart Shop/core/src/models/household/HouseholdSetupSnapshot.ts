export type HouseholdSetupSnapshot = {
  familySize: number;
  childrenCount: number;
  hasPets: boolean;
  city: string;
  favouriteSupermarkets: string[];
  favouriteRestaurants: string[];
  monthlyBudget?: number;
};

export const DEFAULT_HOUSEHOLD_SETUP: HouseholdSetupSnapshot = {
  familySize: 2,
  childrenCount: 0,
  hasPets: false,
  city: "St. Pölten",
  favouriteSupermarkets: ["Billa"],
  favouriteRestaurants: [],
};
