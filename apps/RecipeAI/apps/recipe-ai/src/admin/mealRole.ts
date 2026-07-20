/**
 * Recipe Studio meal-role model (admin-only).
 *
 * Deliberately minimal: two fields express exactly three practical states.
 *   1. defaultRole=main, canServeAsMain=false → "Main"
 *   2. defaultRole=side, canServeAsMain=false → "Side"
 *   3. defaultRole=side, canServeAsMain=true  → "Side · Can be main"
 *
 * Meal role describes the normal identity/use of a recipe. It must NOT try to
 * encode per-household preference (that is future household intelligence, not
 * implemented here). Kept separate from intent/dietary attribute tags.
 */

import type { AppLocale } from "../i18n/types";
import type { DishCatalogEntry } from "../data/catalog/types";
import type { QaWarning } from "./recipeQaAudit";

export type DefaultMealRole = "main" | "side";

export type MealRoleModel = {
  defaultRole: DefaultMealRole;
  canServeAsMain: boolean;
};

/** Explicit, possibly-partial role stored on a draft/override. */
export type MealRoleInput = {
  defaultRole?: DefaultMealRole;
  canServeAsMain?: boolean;
};

/** Safe fallback for legacy canonical recipes lacking explicit role fields. */
export function deriveMealRoleFromDish(dish: DishCatalogEntry): MealRoleModel {
  const isMain =
    dish.mealSlotRole === "dinner_complete" || dish.mealTypes.includes("main");
  return { defaultRole: isMain ? "main" : "side", canServeAsMain: false };
}

/**
 * Resolve the effective role for display. Explicit fields win; otherwise fall
 * back from existing catalog metadata. Normalizes the redundant combination
 * (main can never also be "can serve as main").
 */
export function resolveMealRole(options: {
  explicit?: MealRoleInput;
  dish: DishCatalogEntry;
}): MealRoleModel {
  const fallback = deriveMealRoleFromDish(options.dish);
  const defaultRole = options.explicit?.defaultRole ?? fallback.defaultRole;
  const canServeAsMain =
    defaultRole === "main"
      ? false
      : options.explicit?.canServeAsMain ?? fallback.canServeAsMain;
  return { defaultRole, canServeAsMain };
}

const SHORT_LABELS: Record<AppLocale, { main: string; side: string; sideCanMain: string }> = {
  en: { main: "Main", side: "Side", sideCanMain: "Side · Can be main" },
  de: {
    main: "Hauptgericht",
    side: "Beilage",
    sideCanMain: "Beilage · auch Hauptgericht",
  },
  ar: {
    main: "طبق رئيسي",
    side: "طبق جانبي",
    sideCanMain: "طبق جانبي · يمكن أن يكون رئيسيًا",
  },
  tr: { main: "Ana yemek", side: "Yan/meze", sideCanMain: "Yan · ana da olur" },
};

/** Short consumer-facing label. No long explanation on normal recipe cards. */
export function mealRoleShortLabel(
  role: MealRoleModel,
  locale: AppLocale = "en",
): string {
  const labels = SHORT_LABELS[locale] ?? SHORT_LABELS.en;
  if (role.defaultRole === "main") return labels.main;
  return role.canServeAsMain ? labels.sideCanMain : labels.side;
}

/**
 * QA validation for role metadata. Warns on the redundant main+canServeAsMain
 * combination and on a draft missing an explicit role. Does not touch the
 * consumer catalog.
 */
export function auditMealRole(
  explicit: MealRoleInput | undefined,
  options: { isDraft: boolean },
): QaWarning[] {
  const warnings: QaWarning[] = [];
  if (explicit?.defaultRole === "main" && explicit.canServeAsMain === true) {
    warnings.push({
      code: "meal_role_redundant_can_serve_as_main",
      severity: "warn",
      message:
        'defaultRole=main with canServeAsMain=true is redundant — a main dish is already a main. Normalize canServeAsMain to false.',
    });
  }
  if (options.isDraft && explicit?.defaultRole == null) {
    warnings.push({
      code: "meal_role_missing_on_draft",
      severity: "warn",
      message:
        "Meal role is not set on this draft. Set Default role (main/side) and Can serve as main before approval.",
    });
  }
  return warnings;
}
