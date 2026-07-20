import type {
  AppPreferences,
  CuisineFamilyId,
  DayCuisineSource,
} from "@recipe-ai/core/types";
import type { DishCatalogEntry } from "../types";

export const MAX_PREFERRED_CUISINES = 3;

export type HouseholdCuisineProfile = {
  primaryCuisine?: CuisineFamilyId;
  preferredCuisines: CuisineFamilyId[];
  hostCuisineIds: CuisineFamilyId[];
  hasExplicitPrimary: boolean;
};

/** Resolve explicit primary/preferred profile — never infers from nationality. */
export function resolveHouseholdCuisineProfile(
  prefs: Pick<
    AppPreferences,
    "primaryCuisine" | "preferredCuisines" | "favoriteCuisines"
  >,
): HouseholdCuisineProfile {
  const primary = prefs.primaryCuisine;
  const preferred = (prefs.preferredCuisines ?? []).filter(
    (c) => c !== primary,
  );

  if (primary) {
    return {
      primaryCuisine: primary,
      preferredCuisines: preferred,
      hostCuisineIds: [primary, ...preferred],
      hasExplicitPrimary: true,
    };
  }

  const hostCuisineIds = [
    ...new Set(prefs.favoriteCuisines ?? []),
  ] as CuisineFamilyId[];

  return {
    primaryCuisine: undefined,
    preferredCuisines: [],
    hostCuisineIds,
    hasExplicitPrimary: false,
  };
}

export function syncFavoriteCuisinesMirror(
  primary?: CuisineFamilyId,
  preferred: CuisineFamilyId[] = [],
): CuisineFamilyId[] {
  if (!primary) return [...preferred];
  return [primary, ...preferred.filter((c) => c !== primary)];
}

export function isVegetarianMainDish(dish: DishCatalogEntry): boolean {
  return (
    dish.dietaryTags.includes("vegetarian_ok") &&
    !dish.dietaryTags.includes("contains_meat")
  );
}

/** Soft AUTO balance: primary baseline + controlled secondary variety. */
export function autoCuisineBalanceScore(
  dish: DishCatalogEntry,
  profile: HouseholdCuisineProfile,
  picked: DishCatalogEntry[],
): number {
  if (!profile.hasExplicitPrimary || !profile.primaryCuisine) return 0;

  const primary = profile.primaryCuisine;
  const preferredSet = new Set(profile.preferredCuisines);
  const isPrimary = dish.cuisineFamilyId === primary;
  const isPreferred = preferredSet.has(dish.cuisineFamilyId);

  const primaryCount = picked.filter((p) => p.cuisineFamilyId === primary).length;
  const secondaryCount = picked.filter(
    (p) => p.cuisineFamilyId !== primary,
  ).length;
  const daysFilled = picked.length;
  const primaryTarget = 5;

  if (isPrimary) {
    const wantMorePrimary =
      primaryCount < Math.min(primaryTarget, daysFilled + 1);
    return wantMorePrimary ? 26 : 14;
  }
  if (isPreferred) {
    if (primaryCount >= 4 && secondaryCount < 3) return 10;
    if (primaryCount >= primaryTarget) return 8;
    return -2;
  }
  return -12;
}

export function explicitCuisineSourceScore(
  dish: DishCatalogEntry,
  source: Exclude<DayCuisineSource, "auto">,
  profile: HouseholdCuisineProfile,
): number {
  if (source === "primary") {
    if (!profile.primaryCuisine) return 0;
    return dish.cuisineFamilyId === profile.primaryCuisine ? 24 : -20;
  }

  if (profile.preferredCuisines.includes(dish.cuisineFamilyId)) return 22;
  if (dish.cuisineFamilyId === profile.primaryCuisine) return -10;
  return -16;
}

/** Cuisine preference layer — after safety, before/ alongside intent fit. */
export function cuisinePreferenceScore(
  dish: DishCatalogEntry,
  source: DayCuisineSource,
  profile: HouseholdCuisineProfile,
  picked: DishCatalogEntry[],
  role: import("../types").DayRole,
): number {
  if (source !== "auto") {
    return explicitCuisineSourceScore(dish, source, profile);
  }

  if (profile.hasExplicitPrimary) {
    if (role === "controlled_discovery") {
      const isPrimary = dish.cuisineFamilyId === profile.primaryCuisine;
      const isPreferred = profile.preferredCuisines.includes(
        dish.cuisineFamilyId,
      );
      if (isPreferred) return 8;
      if (isPrimary) return -2;
      return 4;
    }
    return autoCuisineBalanceScore(dish, profile, picked);
  }

  const hostHit = profile.hostCuisineIds.includes(dish.cuisineFamilyId);
  if (role === "controlled_discovery") {
    return hostHit ? -4 : 10;
  }
  return hostHit ? 12 : 2;
}
