import type { CuisineFamilyId } from "@recipe-ai/core/types";
import type { DishCatalogEntry } from "../types";
import type { DecisionContext, DecisionPolicy } from "./types";

export function weekdayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

export function resolvePolicy(ctx: DecisionContext): DecisionPolicy {
  if (ctx.mode === "pantry" || ctx.pantryQuery?.trim()) {
    return "PANTRY_MODE";
  }

  const { occasion, intent } = ctx.tonight;

  if (occasion === "guests") {
    if (intent === "surprise") return "GUESTS_SURPRISE";
    if (intent === "special") return "GUESTS_SPECIAL";
    return "GUESTS_EASY";
  }

  // Someone Special stays algorithmically distinct — cuisine is an input, not a mode switch.
  if (occasion === "friend") {
    return "SOMEONE_SPECIAL";
  }

  // Us
  if (ctx.weeklyPlanningEnabled && ctx.weeklyPlan.length > 0) {
    return "US_WITH_WEEKLY_PLAN";
  }
  return "US_WITHOUT_PLAN";
}

function byCuisine(
  dishes: DishCatalogEntry[],
  cuisineIds: CuisineFamilyId[],
): DishCatalogEntry[] {
  if (!cuisineIds.length) return [];
  const set = new Set(cuisineIds);
  return dishes.filter((d) => set.has(d.cuisineFamilyId));
}

function guestCuisines(ctx: DecisionContext): CuisineFamilyId[] {
  const ids = [
    ...(ctx.tonight.guestPrimaryCuisineId
      ? [ctx.tonight.guestPrimaryCuisineId]
      : []),
    ...(ctx.tonight.guestPreferredCuisineIds ?? []),
  ];
  return ids.filter((id, i, all) => all.indexOf(id) === i);
}

function hasBridge(
  dish: DishCatalogEntry,
  host: CuisineFamilyId[],
  guest: CuisineFamilyId[],
): boolean {
  if (!host.length || !guest.length) return false;
  return (
    dish.bridges?.some(
      (b) => host.includes(b.hostCuisineId) && guest.includes(b.guestCuisineId),
    ) ?? false
  );
}

function easyFamiliar(d: DishCatalogEntry): boolean {
  return (
    d.difficulty === "easy" &&
    d.prepMinutes <= 50 &&
    (d.suitability.includes("guest_friendly") ||
      d.suitability.includes("everyday_host") ||
      d.familiarity <= 2)
  );
}

function uniqueDishes(dishes: DishCatalogEntry[]): DishCatalogEntry[] {
  const seen = new Set<string>();
  const out: DishCatalogEntry[] = [];
  for (const d of dishes) {
    if (seen.has(d.id)) continue;
    seen.add(d.id);
    out.push(d);
  }
  return out;
}

/**
 * Policy shapes the candidate universe BEFORE scoring.
 * Safety must already be applied to `safeDishes`.
 */
export function candidateUniverse(
  policy: DecisionPolicy,
  safeDishes: DishCatalogEntry[],
  ctx: DecisionContext,
): DishCatalogEntry[] {
  const hostPool = byCuisine(safeDishes, ctx.hostCuisineIds);
  const hostOrAll = hostPool.length > 0 ? hostPool : safeDishes;
  const guests = guestCuisines(ctx);

  switch (policy) {
    case "PANTRY_MODE":
      return safeDishes;

    case "US_WITH_WEEKLY_PLAN":
    case "US_WITHOUT_PLAN":
      return safeDishes;

    case "GUESTS_EASY": {
      // Easy & familiar = host achievability + guest familiarity — not host-only.
      const hostEasy = hostOrAll.filter(easyFamiliar);
      const guestEasy = byCuisine(safeDishes, guests).filter(easyFamiliar);
      const merged = uniqueDishes([...hostEasy, ...guestEasy]);
      return merged.length > 0 ? merged : hostOrAll.filter(easyFamiliar);
    }

    case "GUESTS_SPECIAL": {
      const bridged = safeDishes.filter((d) =>
        hasBridge(d, ctx.hostCuisineIds, guests),
      );
      if (bridged.length > 0) return bridged;
      const special = hostOrAll.filter(
        (d) =>
          d.suitability.includes("guest_friendly") &&
          (d.specialness >= 2 || d.moods.includes("special")),
      );
      return special.length > 0
        ? special
        : hostOrAll.filter((d) => d.difficulty === "easy");
    }

    case "GUESTS_SURPRISE": {
      const primary = ctx.tonight.guestPrimaryCuisineId
        ? byCuisine(safeDishes, [ctx.tonight.guestPrimaryCuisineId])
        : [];
      if (primary.length > 0) return primary;
      return byCuisine(safeDishes, guests);
    }

    case "SOMEONE_SPECIAL": {
      const elevated = hostOrAll.filter(
        (d) =>
          d.specialness >= 2 ||
          d.moods.includes("special") ||
          d.suitability.includes("celebration_light") ||
          d.suitability.includes("shareable"),
      );
      const base = elevated.length > 0 ? elevated : hostOrAll;
      // Optional explicit cuisine influences universe softly — not a Guests mode switch.
      const preferred = ctx.tonight.guestPrimaryCuisineId
        ? byCuisine(safeDishes, [ctx.tonight.guestPrimaryCuisineId])
        : [];
      if (preferred.length === 0) return base;
      return uniqueDishes([
        ...base,
        ...preferred.filter((d) => d.specialness >= 1),
      ]);
    }

    default:
      return safeDishes;
  }
}

export { byCuisine, guestCuisines, hasBridge };
