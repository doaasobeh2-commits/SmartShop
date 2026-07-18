import type { HouseholdCuisineAffinity } from "../affinity/types";
import type { CuisineFamilyId } from "../taxonomy/ids";

export type CuisineAffinityGraphDto = Pick<
  HouseholdCuisineAffinity,
  | "householdId"
  | "familyScores"
  | "subregionScores"
  | "explicitPreferences"
  | "explorationWillingness"
  | "updatedAt"
>;

export type UpsertExplicitCuisinePreferencesRequest = {
  liked: CuisineFamilyId[];
  disliked: CuisineFamilyId[];
};

export type CuisineFamilyPreferenceOptionDto = {
  familyId: CuisineFamilyId;
  name: string;
  recognitionIcon?: string;
  catalogPhase: "active" | "deferred";
};
