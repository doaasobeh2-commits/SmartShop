import type { MealFeedbackRatingDto } from "../contracts/feedback";
import type { CuisineFamilyId, CuisineSubregionId, ShareYumLocale } from "../taxonomy/ids";

export type ExplicitCuisinePreferences = {
  liked: readonly CuisineFamilyId[];
  disliked: readonly CuisineFamilyId[];
};

export type SpiceTolerance = "mild" | "medium" | "bold";

export type BudgetIntent = "economy" | "normal" | "flexible";

/** Primary affinity signals — language is not included. */
export type HouseholdCuisineAffinity = {
  householdId: string;
  familyScores: Readonly<Record<string, number>>;
  subregionScores: Readonly<Record<string, number>>;
  explicitPreferences: ExplicitCuisinePreferences;
  explorationWillingness: number;
  updatedAt: string;
};

export type AffinitySignalSource =
  | "explicit_preference"
  | "explicit_dislike"
  | "residence_exposure"
  | "feedback_loved"
  | "feedback_good"
  | "feedback_not_for_us"
  | "cook_history"
  | "tonight_swap"
  | "controlled_exploration"
  | "consent_cultural_prior";

export type AffinityUpdateEvent = {
  householdId: string;
  source: AffinitySignalSource;
  cuisineFamilyId: CuisineFamilyId;
  cuisineSubregionId?: CuisineSubregionId;
  recipeId?: string;
  rating?: MealFeedbackRatingDto;
  occurredAt: string;
};

export type HouseholdMealContext = {
  householdId: string;
  locale: ShareYumLocale;
  residenceCountry: string;
  residenceCity?: string;
  householdSize?: number;
  timeBudgetMinutes?: number;
  budgetIntent?: BudgetIntent;
  spiceTolerance: SpiceTolerance;
};

/** Marketplace boundary — documentation type only; no implementation in A2.2. */
export type KitchenListingBoundary = {
  listingId: string;
  sellerProfileId: string;
  canonicalRecipeId?: string;
  adHocDishName?: string;
  allergenAttestationRequired: true;
};

export type ShareCartIntegrationBoundary = {
  pantrySnapshotId?: string;
  readOnly: true;
};

export type ShareFitIntegrationBoundary = {
  nutritionTargetRefId?: string;
  readOnly: true;
};
