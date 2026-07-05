import type { FamilyPreferenceProfile } from "../models/preference/FamilyPreferenceProfile";
import type { ShoppingBasket } from "../models/basket/ShoppingBasket";
import type { SmartBasketPolicy } from "../models/basket/SmartBasketPolicy";

export type RankedBasketCandidate = {
  basket: ShoppingBasket;
  score: number;
  estimatedSavings: number;
  storeCount: number;
  estimatedTravelKm: number;
};

export type RankBasketBySavingsDistancePreferenceInput = {
  candidates: ShoppingBasket[];
  preferences: FamilyPreferenceProfile;
  policy: SmartBasketPolicy;
};

export type RankBasketBySavingsDistancePreferenceResult = {
  ranked: RankedBasketCandidate[];
  recommended: RankedBasketCandidate;
};

/**
 * Ranks basket candidates by savings, travel distance, and family preferences.
 * Prefers fewer nearby stores unless multi-store savings are meaningful.
 */
export type RankBasketBySavingsDistancePreference = {
  execute(
    input: RankBasketBySavingsDistancePreferenceInput,
  ): RankBasketBySavingsDistancePreferenceResult;
};
