import { validateBatch1Plan } from "./batch1Plan";
import { CUISINE_FAMILIES } from "./families";
import { CUISINE_SUBREGIONS } from "./subregions";
import { MEAL_STYLES } from "./mealStyles";
import { CUISINE_FAMILY_LOCALIZATIONS } from "./localizations";
import { SHAREYUM_LOCALES, type CuisineFamilyId } from "./ids";

export type TaxonomyValidationResult = {
  ok: boolean;
  errors: string[];
};

export function validateTaxonomyRegistry(): TaxonomyValidationResult {
  const errors: string[] = [];

  const familyIds = CUISINE_FAMILIES.map((entry) => entry.id);
  if (new Set(familyIds).size !== familyIds.length) {
    errors.push("Duplicate cuisine family IDs detected");
  }

  const subregionIds = CUISINE_SUBREGIONS.map((entry) => entry.id);
  if (new Set(subregionIds).size !== subregionIds.length) {
    errors.push("Duplicate cuisine subregion IDs detected");
  }

  for (const subregion of CUISINE_SUBREGIONS) {
    if (!familyIds.includes(subregion.familyId)) {
      errors.push(`Subregion ${subregion.id} references unknown family ${subregion.familyId}`);
    }
  }

  const mealStyleIds = MEAL_STYLES.map((entry) => entry.id);
  if (new Set(mealStyleIds).size !== mealStyleIds.length) {
    errors.push("Duplicate meal style IDs detected");
  }

  for (const style of MEAL_STYLES) {
    for (const locale of SHAREYUM_LOCALES) {
      if (!style.localizations[locale]?.name) {
        errors.push(`Meal style ${style.id} missing ${locale} localization`);
      }
    }
  }

  const localizationKeys = new Set<string>();
  for (const row of CUISINE_FAMILY_LOCALIZATIONS) {
    const key = `${row.familyId}:${row.locale}`;
    if (localizationKeys.has(key)) {
      errors.push(`Duplicate family localization: ${key}`);
    }
    localizationKeys.add(key);
    if (!familyIds.includes(row.familyId)) {
      errors.push(`Localization references unknown family ${row.familyId}`);
    }
  }

  for (const familyId of familyIds as CuisineFamilyId[]) {
    for (const locale of SHAREYUM_LOCALES) {
      const key = `${familyId}:${locale}`;
      if (!localizationKeys.has(key)) {
        errors.push(`Missing family localization: ${key}`);
      }
    }
  }

  const batch1 = validateBatch1Plan();
  if (!batch1.ok) {
    errors.push(...batch1.errors);
  }

  return { ok: errors.length === 0, errors };
}
