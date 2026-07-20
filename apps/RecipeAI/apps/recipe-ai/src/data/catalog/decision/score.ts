import type { RecommendationReasonCode } from "@recipe-ai/core/types";
import type { DayRole, DishCatalogEntry } from "../types";
import {
  feedbackScore,
  recentCookPenalty,
  wasRecentlyRejected,
} from "./memory";
import { byCuisine, guestCuisines, hasBridge } from "./policy";
import type { DecisionContext, DecisionPolicy, ScoredCandidate } from "./types";

function hostAffinity(dish: DishCatalogEntry, ctx: DecisionContext): number {
  if (ctx.hostCuisineIds.includes(dish.cuisineFamilyId)) return 10;
  return 0;
}

function discoveryEligible(
  dish: DishCatalogEntry,
  ctx: DecisionContext,
  policy: DecisionPolicy,
): boolean {
  if (policy === "GUESTS_EASY" || policy === "GUESTS_SURPRISE") return false;
  if (ctx.hostCuisineIds.includes(dish.cuisineFamilyId)) return false;
  if (dish.difficulty !== "easy") return false;
  if (wasRecentlyRejected(dish.id, ctx.feedbackEvents)) return false;
  if (dish.prepMinutes > 45) return false;
  return (
    dish.suitability.includes("everyday_host") ||
    dish.suitability.includes("guest_friendly") ||
    dish.familiarity <= 2
  );
}

function proteinToken(dish: DishCatalogEntry): string | undefined {
  const proteins = [
    "chicken",
    "beef",
    "lamb",
    "pork",
    "fish",
    "lentils",
    "beans",
    "egg",
    "eggs",
    "tofu",
  ];
  return dish.ingredientTokens.find((t) => proteins.includes(t));
}

function roleFit(
  dish: DishCatalogEntry,
  role: DayRole,
  ctx?: DecisionContext,
): number {
  switch (role) {
    case "quick":
      return dish.moods.includes("quick") || dish.prepMinutes <= 25 ? 8 : -4;
    case "vegetable_forward":
      return dish.dietaryTags.includes("vegetarian_ok") ||
        dish.mealTypes.includes("salad") ||
        (!dish.dietaryTags.includes("contains_meat") &&
          dish.mealTypes.includes("main"))
        ? 9
        : -3;
    case "comfort":
      return dish.mealTypes.includes("stew") ||
        dish.mealTypes.includes("soup") ||
        dish.specialness >= 2
        ? 7
        : 0;
    case "family_familiar":
      return dish.familiarity <= 2 ? 8 : 0;
    case "protein_shift": {
      // Relational assignment lives in weekly composition; here reward having a protein.
      void ctx;
      return proteinToken(dish) ? 6 : -2;
    }
    case "controlled_discovery":
      return 0;
    case "balanced":
    default:
      return dish.mealTypes.includes("main") || dish.mealTypes.includes("stew")
        ? 3
        : 1;
  }
}

/**
 * Contextual scoring AFTER policy universe + feasibility.
 * Never used to override hard safety (unsafe dishes never reach here).
 */
export function scoreCandidate(
  dish: DishCatalogEntry,
  policy: DecisionPolicy,
  ctx: DecisionContext,
  options?: { dayRole?: DayRole; plannedId?: string },
): ScoredCandidate {
  const signals: Record<string, number> = {};
  const reasons: RecommendationReasonCode[] = [];
  let score = 0;

  const affinity = hostAffinity(dish, ctx);
  signals.hostAffinity = affinity;
  score += affinity;
  if (affinity > 0 && policy !== "GUESTS_SURPRISE") {
    reasons.push("FAMILY_FAMILIAR");
  }

  const fb = feedbackScore(dish.id, ctx.feedbackEvents);
  signals.feedback = fb;
  score += fb;

  const cookPen = recentCookPenalty(dish.id, ctx.cookEvents);
  signals.recentCook = -cookPen;
  score -= cookPen;

  signals.prep = -dish.prepMinutes / 20;
  score += signals.prep;

  if (policy === "US_WITH_WEEKLY_PLAN" && options?.plannedId === dish.id) {
    signals.weeklyPlan = 40;
    score += 40;
    reasons.push("FROM_WEEKLY_PLAN");
  }

  if (options?.dayRole) {
    const fit = roleFit(dish, options.dayRole, ctx);
    signals.dayRole = fit;
    score += fit;
  }

  if (policy === "US_WITHOUT_PLAN" || policy === "US_WITH_WEEKLY_PLAN") {
    if (
      discoveryEligible(dish, ctx, policy) &&
      (options?.dayRole === "controlled_discovery" ||
        (!options?.plannedId && dish.id.charCodeAt(0) % 7 === 0))
    ) {
      signals.discovery = 7;
      score += 7;
      reasons.push("CONTROLLED_DISCOVERY");
    }
  }

  if (policy === "GUESTS_EASY") {
    const guests = guestCuisines(ctx);
    const hostHit = ctx.hostCuisineIds.includes(dish.cuisineFamilyId);
    const guestHit = guests.includes(dish.cuisineFamilyId);

    // Host achievability remains important.
    const easyHost =
      (dish.difficulty === "easy" ? 10 : 0) +
      (hostHit ? 8 : 0) +
      Math.max(0, (50 - dish.prepMinutes) / 10);
    signals.easy = easyHost;
    score += easyHost;
    if (hostHit && dish.difficulty === "easy") reasons.push("EASY_FOR_HOST");

    // Explicit guest cuisine must observably influence ranking.
    if (guestHit) {
      signals.guestOverlap = 16;
      score += 16;
      reasons.push("GUEST_FAMILIAR");
    } else if (guests.length > 0 && hostHit) {
      // Host-only fallback path — do not claim guest cuisine.
      signals.guestOverlap = 0;
    }
  }

  if (policy === "GUESTS_SPECIAL") {
    signals.specialness = dish.specialness * 5;
    score += signals.specialness;
    reasons.push("SPECIAL_OCCASION");
    const guests = guestCuisines(ctx);
    if (hasBridge(dish, ctx.hostCuisineIds, guests)) {
      signals.bridge = 14;
      score += 14;
    } else {
      signals.bridge = 0;
    }
  }

  if (policy === "GUESTS_SURPRISE") {
    const guests = guestCuisines(ctx);
    const primary = ctx.tonight.guestPrimaryCuisineId;
    let authenticity = 0;
    if (primary && dish.cuisineFamilyId === primary) authenticity += 18;
    else if (guests.includes(dish.cuisineFamilyId)) authenticity += 10;
    signals.authenticity = authenticity;
    score += authenticity;

    const achievability =
      (dish.difficulty === "easy" ? 10 : 4) +
      Math.max(0, 8 - dish.familiarity * 2) +
      Math.max(0, (50 - dish.prepMinutes) / 10);
    signals.achievability = achievability;
    score += achievability;

    const failureRisk =
      (dish.difficulty === "medium" ? 6 : 0) + dish.prepMinutes / 15;
    signals.failureRisk = -failureRisk;
    score -= failureRisk;

    if (dish.suitability.includes("shareable")) score += 3;
    if (authenticity > 0) reasons.push("GUEST_SURPRISE");
  }

  if (policy === "SOMEONE_SPECIAL") {
    signals.specialness = dish.specialness * 6;
    score += signals.specialness;
    if (dish.suitability.includes("shareable")) score += 4;
    if (dish.suitability.includes("celebration_light")) score += 4;
    // Conservative risk
    if (dish.difficulty === "medium") score -= 3;
    if (dish.prepMinutes > 55) score -= 4;
    reasons.push("SOMEONE_SPECIAL");

    const explicit = ctx.tonight.guestPrimaryCuisineId;
    if (explicit && dish.cuisineFamilyId === explicit) {
      signals.explicitCuisine = 8;
      score += 8;
      // Do not emit GUEST_FAMILIAR — cuisine is input, not Guests mode.
    }
  }

  // Deterministic tie-break influence (tiny)
  signals.tieBreak =
    dish.id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % 3;
  score += signals.tieBreak / 100;

  // Explanation honesty: only keep codes that reflect real winning signals.
  const uniqueReasons = [...new Set(reasons)].slice(0, 2);

  return { dish, score, reasonCodes: uniqueReasons, signals };
}

export function rankCandidates(
  dishes: DishCatalogEntry[],
  policy: DecisionPolicy,
  ctx: DecisionContext,
  options?: { dayRole?: DayRole; plannedId?: string; limit?: number },
): ScoredCandidate[] {
  const limit = options?.limit ?? 3;
  return [...dishes]
    .map((dish) => scoreCandidate(dish, policy, ctx, options))
    .sort((a, b) => b.score - a.score || a.dish.id.localeCompare(b.dish.id))
    .slice(0, limit);
}

export function filterByDayRoleFeasibility(
  dishes: DishCatalogEntry[],
  role?: DayRole,
): DishCatalogEntry[] {
  if (!role || role === "balanced" || role === "controlled_discovery") {
    return dishes;
  }
  if (role === "quick") {
    const quick = dishes.filter(
      (d) => d.prepMinutes <= 30 || d.moods.includes("quick"),
    );
    return quick.length >= 2 ? quick : dishes;
  }
  if (role === "vegetable_forward") {
    const veg = dishes.filter(
      (d) =>
        d.dietaryTags.includes("vegetarian_ok") ||
        d.mealTypes.includes("salad") ||
        (!d.dietaryTags.includes("contains_meat") &&
          d.mealTypes.includes("main")),
    );
    return veg.length >= 1 ? veg : dishes;
  }
  if (role === "comfort") {
    const comfort = dishes.filter(
      (d) =>
        d.mealTypes.includes("stew") ||
        d.mealTypes.includes("soup") ||
        d.specialness >= 2,
    );
    return comfort.length >= 1 ? comfort : dishes;
  }
  if (role === "family_familiar") {
    const familiar = dishes.filter(
      (d) => d.familiarity <= 2 && d.difficulty === "easy",
    );
    return familiar.length >= 1 ? familiar : dishes;
  }
  if (role === "protein_shift") {
    const withProtein = dishes.filter((d) => proteinToken(d));
    return withProtein.length >= 1 ? withProtein : dishes;
  }
  return dishes;
}

export { byCuisine, proteinToken };
