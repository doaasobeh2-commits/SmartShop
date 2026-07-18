import type { CuisineFamilyId, CuisineSubregionId, IsoCountryCode } from "./ids";

export type CuisineSubregionDefinition = {
  id: CuisineSubregionId;
  familyId: CuisineFamilyId;
  originCountries: readonly IsoCountryCode[];
};

export const CUISINE_SUBREGIONS: readonly CuisineSubregionDefinition[] = [
  {
    id: "levantine",
    familyId: "arab",
    originCountries: ["SY", "LB", "PS", "JO"],
  },
  {
    id: "gulf",
    familyId: "arab",
    originCountries: ["SA", "AE"],
  },
  {
    id: "iraqi",
    familyId: "arab",
    originCountries: ["IQ"],
  },
  {
    id: "egyptian",
    familyId: "arab",
    originCountries: ["EG"],
  },
  {
    id: "maghreb",
    familyId: "arab",
    originCountries: ["MA"],
  },
  {
    id: "austrian",
    familyId: "central_european",
    originCountries: ["AT"],
  },
  {
    id: "german",
    familyId: "central_european",
    originCountries: ["DE"],
  },
  {
    id: "broader_central_european",
    familyId: "central_european",
    originCountries: ["AT", "DE"],
  },
  {
    id: "cantonese",
    familyId: "chinese",
    originCountries: ["CN"],
  },
  {
    id: "sichuan",
    familyId: "chinese",
    originCountries: ["CN"],
  },
  {
    id: "broader_chinese",
    familyId: "chinese",
    originCountries: ["CN"],
  },
  {
    id: "north_indian",
    familyId: "indian",
    originCountries: ["IN"],
  },
  {
    id: "south_indian",
    familyId: "indian",
    originCountries: ["IN"],
  },
] as const;

export function getSubregionsForFamily(
  familyId: CuisineFamilyId,
): readonly CuisineSubregionDefinition[] {
  return CUISINE_SUBREGIONS.filter((entry) => entry.familyId === familyId);
}
