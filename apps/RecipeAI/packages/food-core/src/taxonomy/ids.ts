/** ShareYum presentation locales — language controls UI copy only, not cuisine affinity. */
export const SHAREYUM_LOCALES = ["ar", "de", "tr", "en"] as const;
export type ShareYumLocale = (typeof SHAREYUM_LOCALES)[number];

/** Active cuisine families in the initial catalog program. */
export const ACTIVE_CUISINE_FAMILY_IDS = [
  "arab",
  "turkish",
  "central_european",
  "italian",
  "chinese",
  "indian",
  "mexican",
] as const;
export type ActiveCuisineFamilyId = (typeof ACTIVE_CUISINE_FAMILY_IDS)[number];

/** Registered for taxonomy completeness; deferred from first major catalog tranche. */
export const DEFERRED_CUISINE_FAMILY_IDS = ["romanian", "japanese"] as const;
export type DeferredCuisineFamilyId = (typeof DEFERRED_CUISINE_FAMILY_IDS)[number];

export const CUISINE_FAMILY_IDS = [
  ...ACTIVE_CUISINE_FAMILY_IDS,
  ...DEFERRED_CUISINE_FAMILY_IDS,
] as const;
export type CuisineFamilyId = (typeof CUISINE_FAMILY_IDS)[number];

export const ARAB_SUBREGION_IDS = [
  "levantine",
  "gulf",
  "iraqi",
  "egyptian",
  "maghreb",
] as const;
export type ArabSubregionId = (typeof ARAB_SUBREGION_IDS)[number];

export const CENTRAL_EUROPEAN_SUBREGION_IDS = [
  "austrian",
  "german",
  "broader_central_european",
] as const;
export type CentralEuropeanSubregionId =
  (typeof CENTRAL_EUROPEAN_SUBREGION_IDS)[number];

export const CHINESE_SUBREGION_IDS = [
  "cantonese",
  "sichuan",
  "broader_chinese",
] as const;
export type ChineseSubregionId = (typeof CHINESE_SUBREGION_IDS)[number];

export const INDIAN_SUBREGION_IDS = ["north_indian", "south_indian"] as const;
export type IndianSubregionId = (typeof INDIAN_SUBREGION_IDS)[number];

export const CUISINE_SUBREGION_IDS = [
  ...ARAB_SUBREGION_IDS,
  ...CENTRAL_EUROPEAN_SUBREGION_IDS,
  ...CHINESE_SUBREGION_IDS,
  ...INDIAN_SUBREGION_IDS,
] as const;
export type CuisineSubregionId = (typeof CUISINE_SUBREGION_IDS)[number];

/** Nutritional/plating taxonomy — not a nationality or cuisine family. */
export const MEAL_STYLE_IDS = [
  "protein_bowl",
  "balanced_plate",
  "high_protein",
  "lighter_meal",
  "one_pot",
  "soup_meal",
  "salad_meal",
] as const;
export type MealStyleId = (typeof MEAL_STYLE_IDS)[number];

export const ISO_COUNTRY_CODES = [
  "AT",
  "DE",
  "SY",
  "LB",
  "PS",
  "JO",
  "SA",
  "AE",
  "IQ",
  "EG",
  "MA",
  "TR",
  "IT",
  "CN",
  "IN",
  "MX",
  "RO",
  "JP",
] as const;
export type IsoCountryCode = (typeof ISO_COUNTRY_CODES)[number];
