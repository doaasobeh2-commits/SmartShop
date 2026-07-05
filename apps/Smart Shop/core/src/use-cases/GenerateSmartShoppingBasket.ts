import type { FamilyProfileLocation } from "../models/family/FamilyProfileLocation";
import type { FamilyPreferenceProfile } from "../models/preference/FamilyPreferenceProfile";
import type { ShoppingBasket } from "../models/basket/ShoppingBasket";
import type { SmartBasketPolicy } from "../models/basket/SmartBasketPolicy";

export type GenerateSmartShoppingBasketInput = {
  familyLocation: FamilyProfileLocation;
  preferences: FamilyPreferenceProfile;
  requestedProducts: string[];
  policy: SmartBasketPolicy;
  /** Optional recipe or nutrition context from Recipe AI / Fitness AI later. */
  nutritionContextRef?: string;
};

export type GenerateSmartShoppingBasketResult = {
  basket: ShoppingBasket;
};

/**
 * Orchestrates local offer search, preference ranking, and basket assembly.
 */
export type GenerateSmartShoppingBasket = {
  execute(
    input: GenerateSmartShoppingBasketInput,
  ): GenerateSmartShoppingBasketResult;
};
