import type { HouseholdPet } from "./HouseholdPet";
import { normalizePets } from "./HouseholdPet";

export type ShoppingFrequency = "weekly" | "biweekly" | "monthly";

export type HouseholdSetupSnapshot = {
  familySize: number;
  childrenCount: number;
  hasPets: boolean;
  pets: HouseholdPet[];
  city: string;
  favouriteSupermarkets: string[];
  favouriteRestaurants: string[];
  monthlyBudget?: number;
  shoppingFrequency: ShoppingFrequency;
  /** @deprecated Inferred by Household Intelligence — do not collect via UI. */
  shoppingPreferences: string[];
};

export const DEFAULT_HOUSEHOLD_SETUP: HouseholdSetupSnapshot = {
  familySize: 2,
  childrenCount: 0,
  hasPets: false,
  pets: [],
  city: "St. Pölten",
  favouriteSupermarkets: ["Billa"],
  favouriteRestaurants: [],
  shoppingFrequency: "weekly",
  shoppingPreferences: [],
};

export function normalizeHouseholdSetup(
  setup: Partial<HouseholdSetupSnapshot> & Pick<HouseholdSetupSnapshot, "familySize" | "childrenCount" | "city">,
): HouseholdSetupSnapshot {
  let pets = normalizePets(setup.pets);

  if (setup.hasPets && pets.length === 0) {
    pets = [{ type: "dog", quantity: 1 }];
  }

  const hasPets = pets.length > 0;

  return {
    familySize: setup.familySize,
    childrenCount: setup.childrenCount,
    hasPets,
    pets: hasPets ? pets : [],
    city: setup.city,
    favouriteSupermarkets:
      setup.favouriteSupermarkets?.length ? setup.favouriteSupermarkets : ["Billa"],
    favouriteRestaurants: setup.favouriteRestaurants ?? [],
    monthlyBudget: setup.monthlyBudget,
    shoppingFrequency: setup.shoppingFrequency ?? "weekly",
    shoppingPreferences: setup.shoppingPreferences ?? [],
  };
}

export function finalizeHouseholdSetup(
  input: Omit<HouseholdSetupSnapshot, "hasPets" | "pets"> & {
    hasPets: boolean;
    pets: HouseholdPet[];
  },
): HouseholdSetupSnapshot {
  const pets = input.hasPets ? normalizePets(input.pets) : [];
  return normalizeHouseholdSetup({
    ...input,
    pets,
    hasPets: pets.length > 0,
  });
}
