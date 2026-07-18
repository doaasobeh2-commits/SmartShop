import type { CuisineFamilyId, IsoCountryCode } from "./ids";

export type ResidenceExposureBoost = {
  cuisineFamilyId: CuisineFamilyId;
  /** Additive prior delta applied on top of neutral baseline — not a hard rule. */
  delta: number;
};

export type ResidenceExposurePrior = {
  residenceCountry: IsoCountryCode;
  boosts: readonly ResidenceExposureBoost[];
};

/**
 * Exposure priors by residence — familiarity from local context, not stereotypes.
 * Language is intentionally excluded.
 */
export const RESIDENCE_EXPOSURE_PRIORS: readonly ResidenceExposurePrior[] = [
  {
    residenceCountry: "AT",
    boosts: [
      { cuisineFamilyId: "central_european", delta: 0.25 },
      { cuisineFamilyId: "italian", delta: 0.15 },
      { cuisineFamilyId: "turkish", delta: 0.1 },
      { cuisineFamilyId: "arab", delta: 0.05 },
      { cuisineFamilyId: "chinese", delta: 0.05 },
    ],
  },
  {
    residenceCountry: "DE",
    boosts: [
      { cuisineFamilyId: "central_european", delta: 0.22 },
      { cuisineFamilyId: "italian", delta: 0.14 },
      { cuisineFamilyId: "turkish", delta: 0.12 },
      { cuisineFamilyId: "arab", delta: 0.06 },
      { cuisineFamilyId: "chinese", delta: 0.05 },
    ],
  },
] as const;

export function getResidenceExposurePrior(
  residenceCountry: IsoCountryCode,
): ResidenceExposurePrior | undefined {
  return RESIDENCE_EXPOSURE_PRIORS.find(
    (entry) => entry.residenceCountry === residenceCountry,
  );
}
