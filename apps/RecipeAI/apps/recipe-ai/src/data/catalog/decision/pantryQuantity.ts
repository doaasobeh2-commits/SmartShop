/**
 * Quantity-aware pantry readiness foundation.
 *
 * Honesty: only claim "enough / not enough" when both user quantity and a
 * parseable recipe quantity exist in comparable units. Otherwise fall back to
 * presence matching and status `unknown` — never invent precision.
 *
 * SmartShop inventory quantities can later feed the same ParsedPantryItem shape
 * without FadiCore contract changes.
 */
import type { DishCatalogEntry, PantryIngredient } from "../types";
import { canonicalizeToken } from "./pantry";

export type QuantityUnit = "g" | "kg" | "ml" | "l" | "piece" | "unknown";

export type ParsedPantryItem = {
  token: string;
  quantity?: number;
  unit?: QuantityUnit;
  /** Whether a numeric quantity was provided for this token */
  evidence: "quantity" | "presence_only";
};

export type QuantityReadinessStatus = "enough" | "insufficient" | "unknown";

export type IngredientQuantityAssessment = {
  canonicalId: string;
  role: PantryIngredient["role"];
  present: boolean;
  readiness: QuantityReadinessStatus;
  /**
   * `compared` = both sides had reliable quantities.
   * Other reasons must not claim “you have enough”.
   */
  reason:
    | "compared"
    | "missing_user_qty"
    | "missing_recipe_qty"
    | "incompatible_units"
    | "presence_only"
    | "absent";
};

export type DishQuantityAssessment = {
  ingredients: IngredientQuantityAssessment[];
  /** True only when at least one critical ingredient is insufficient with compared evidence */
  hasReliableInsufficiency: boolean;
  /** True when every critical is present; quantity may still be unknown */
  allCriticalPresent: boolean;
};

const UNIT_TO_BASE: Record<Exclude<QuantityUnit, "unknown" | "piece">, number> =
  {
    g: 1,
    kg: 1000,
    ml: 1,
    l: 1000,
  };

function normalizeUnit(raw: string): QuantityUnit {
  const u = raw.toLowerCase();
  if (u === "g" || u === "gram" || u === "grams" || u === "gr") return "g";
  if (u === "kg" || u === "kilo" || u === "kilos") return "kg";
  if (u === "ml" || u === "milliliter" || u === "milliliters") return "ml";
  if (u === "l" || u === "liter" || u === "liters" || u === "litre") return "l";
  if (
    u === "pc" ||
    u === "pcs" ||
    u === "piece" ||
    u === "pieces" ||
    u === "clove" ||
    u === "cloves"
  ) {
    return "piece";
  }
  return "unknown";
}

function toBase(quantity: number, unit: QuantityUnit): number | null {
  if (unit === "piece") return quantity;
  if (unit === "unknown") return null;
  const factor = UNIT_TO_BASE[unit];
  return quantity * factor;
}

function unitsCompatible(a: QuantityUnit, b: QuantityUnit): boolean {
  if (a === "unknown" || b === "unknown") return false;
  if (a === "piece" || b === "piece") return a === b;
  const mass = new Set(["g", "kg"]);
  const vol = new Set(["ml", "l"]);
  return (mass.has(a) && mass.has(b)) || (vol.has(a) && vol.has(b));
}

/**
 * Parse pantry free-text into tokens with optional quantities.
 * Examples: "500g chicken", "500 g chicken", "2 onions", "rice"
 */
export function parsePantryItems(query: string): ParsedPantryItem[] {
  const cleaned = query.toLowerCase().replace(/[^\p{L}\p{N}\s,./-]/gu, " ");
  const chunks = cleaned.split(/[,]+/).map((c) => c.trim()).filter(Boolean);
  const items: ParsedPantryItem[] = [];
  const seen = new Set<string>();

  const push = (token: string, quantity?: number, unit?: QuantityUnit) => {
    const t = canonicalizeToken(token);
    if (!t || t.length < 2 || seen.has(t)) return;
    seen.add(t);
    items.push({
      token: t,
      quantity,
      unit,
      evidence:
        quantity != null && unit && unit !== "unknown"
          ? "quantity"
          : "presence_only",
    });
  };

  for (const chunk of chunks.length ? chunks : [cleaned]) {
    // "500g chicken" / "500 g chicken" / "2 onions"
    const qtyFirst = chunk.match(
      /^(\d+(?:\.\d+)?)\s*(g|kg|ml|l|grams?|kilos?|pcs?|pieces?|cloves?)?\s+([\p{L}][\p{L}\s-]{1,40})$/u,
    );
    if (qtyFirst) {
      const quantity = Number(qtyFirst[1]);
      const unit = qtyFirst[2] ? normalizeUnit(qtyFirst[2]) : "piece";
      push(qtyFirst[3]!.trim(), quantity, unit);
      continue;
    }
    // "chicken 500g"
    const qtyLast = chunk.match(
      /^([\p{L}][\p{L}\s-]{1,40}?)\s+(\d+(?:\.\d+)?)\s*(g|kg|ml|l|grams?|kilos?|pcs?|pieces?)?$/u,
    );
    if (qtyLast) {
      const quantity = Number(qtyLast[2]);
      const unit = qtyLast[3] ? normalizeUnit(qtyLast[3]) : "piece";
      push(qtyLast[1]!.trim(), quantity, unit);
      continue;
    }
    // Fall back: presence tokens (skip bare numbers / headcount words handled elsewhere)
    for (const raw of chunk.split(/\s+/)) {
      if (/^\d/.test(raw)) continue;
      if (
        /^(persons?|people|servings?|personen|kiş|kişi|أشخاص|شخص)$/i.test(raw)
      ) {
        continue;
      }
      push(raw);
    }
  }

  return items;
}

/** Best-effort parse of catalog detail strings like "500 g", "3 cloves", "400 g cooked". */
export function parseRecipeQuantityHint(
  detail: string | undefined,
): { quantity: number; unit: QuantityUnit } | null {
  if (!detail) return null;
  const m = detail
    .toLowerCase()
    .match(
      /(\d+(?:\.\d+)?)\s*(g|kg|ml|l|grams?|kilos?|pcs?|pieces?|cloves?)\b/,
    );
  if (!m) return null;
  return { quantity: Number(m[1]), unit: normalizeUnit(m[2]!) };
}

function findUserItem(
  items: ParsedPantryItem[],
  ing: PantryIngredient,
): ParsedPantryItem | undefined {
  return items.find((item) =>
    ing.tokens.some((t) => {
      const ct = canonicalizeToken(t);
      return ct.includes(item.token) || item.token.includes(ct);
    }),
  );
}

/**
 * Assess quantity readiness for a dish against parsed pantry items.
 * Scales recipe quantity by headcount / dish.servings when both are known.
 */
export function assessDishQuantityReadiness(
  dish: DishCatalogEntry,
  pantryItems: ParsedPantryItem[],
  headcount?: number,
): DishQuantityAssessment {
  const scale =
    headcount && dish.servings > 0 ? headcount / dish.servings : 1;
  const ingredients: IngredientQuantityAssessment[] = [];

  for (const ing of dish.pantryIngredients) {
    if (ing.role === "garnish") continue;
    const user = findUserItem(pantryItems, ing);
    if (!user) {
      ingredients.push({
        canonicalId: ing.canonicalId,
        role: ing.role,
        present: false,
        readiness: "unknown",
        reason: "absent",
      });
      continue;
    }

    const recipeHint = parseRecipeQuantityHint(
      // Prefer EN detail when present on localized content
      dish.content.en.ingredients.find(
        (i) =>
          canonicalizeToken(i.id) === canonicalizeToken(ing.canonicalId) ||
          ing.tokens.some((t) => canonicalizeToken(i.name).includes(canonicalizeToken(t))),
      )?.detail,
    );

    if (user.evidence !== "quantity" || user.quantity == null || !user.unit) {
      ingredients.push({
        canonicalId: ing.canonicalId,
        role: ing.role,
        present: true,
        readiness: "unknown",
        reason: "presence_only",
      });
      continue;
    }

    if (!recipeHint) {
      ingredients.push({
        canonicalId: ing.canonicalId,
        role: ing.role,
        present: true,
        readiness: "unknown",
        reason: "missing_recipe_qty",
      });
      continue;
    }

    if (!unitsCompatible(user.unit, recipeHint.unit)) {
      ingredients.push({
        canonicalId: ing.canonicalId,
        role: ing.role,
        present: true,
        readiness: "unknown",
        reason: "incompatible_units",
      });
      continue;
    }

    const have = toBase(user.quantity, user.unit);
    const need = toBase(recipeHint.quantity * scale, recipeHint.unit);
    if (have == null || need == null) {
      ingredients.push({
        canonicalId: ing.canonicalId,
        role: ing.role,
        present: true,
        readiness: "unknown",
        reason: "incompatible_units",
      });
      continue;
    }

    ingredients.push({
      canonicalId: ing.canonicalId,
      role: ing.role,
      present: true,
      readiness: have + 1e-6 >= need ? "enough" : "insufficient",
      reason: "compared",
    });
  }

  const criticals = ingredients.filter((i) => i.role === "critical");
  const allCriticalPresent = criticals.every((i) => i.present);
  const hasReliableInsufficiency = criticals.some(
    (i) => i.readiness === "insufficient" && i.reason === "compared",
  );

  return { ingredients, hasReliableInsufficiency, allCriticalPresent };
}

/** Tokens for presence matching — ignores quantity numbers. */
export function pantryItemsToTokens(items: ParsedPantryItem[]): string[] {
  return items.map((i) => i.token);
}
