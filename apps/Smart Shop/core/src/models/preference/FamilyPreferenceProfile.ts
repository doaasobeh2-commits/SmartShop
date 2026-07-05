import type { BrandPreferenceList } from "./BrandPreference";
import type { StoreType } from "../store/Store";

export type DietaryRestriction =
  | "vegetarian"
  | "vegan"
  | "halal"
  | "kosher"
  | "gluten_free"
  | "lactose_free"
  | "nut_free"
  | "low_sugar"
  | "low_salt"
  | "organic";

export type ProductQualityPreference = "budget" | "standard" | "premium" | "organic";

/**
 * Family shopping and nutrition preferences that influence basket generation.
 * Shared with Recipe AI and Fitness AI through ecosystem adapters later.
 */
export type FamilyPreferenceProfile = {
  familyId: string;
  brands: BrandPreferenceList;
  preferredStoreTypes: StoreType[];
  preferredStoreIds: string[];
  avoidedStoreIds: string[];
  dietaryRestrictions: DietaryRestriction[];
  allergies: string[];
  budgetLimit?: number;
  budgetCurrency?: string;
  productQualityPreference: ProductQualityPreference;
  prefersOrganic: boolean;
  prefersHalal: boolean;
  prefersVegetarian: boolean;
  prefersVegan: boolean;
  prefersLowSugar: boolean;
  prefersLowSalt: boolean;
};
