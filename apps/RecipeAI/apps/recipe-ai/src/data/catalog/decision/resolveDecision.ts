import type {
  MealRecommendation,
  RecommendationReasonCode,
  TonightDecisionContext,
} from "@recipe-ai/core/types";
import type { AppLocale } from "../../../i18n/types";
import { t } from "../../../i18n/t";
import { getDishById, listAllDishes } from "../dishes";
import { composeReasonText } from "./explain";
import { matchPantryDishes, pantryReasonCodes } from "./pantry";
import { candidateUniverse, resolvePolicy } from "./policy";
import { formatLocalIsoDate } from "./planningCalendar";
import { rankCandidates } from "./score";
import {
  applyHardSafety,
  filterDinnerComplete,
  isDinnerComplete,
  isSafetyBlocked,
} from "./safety";
import type { DishCatalogEntry } from "../types";
import type { DecisionContext, DecisionResult } from "./types";
import { buildIntelligentWeekPlan } from "./weekly";

function uniqueIds(ids: string[]): string[] {
  return [...new Set(ids)];
}

function dinnerUniverse(dishes: DishCatalogEntry[]): DishCatalogEntry[] {
  return filterDinnerComplete(dishes);
}

/**
 * Single Decision Engine V1 entry.
 * Policy shapes universe → feasibility → score → diversity → select.
 */
export function resolveDecision(ctx: DecisionContext): DecisionResult {
  const policy = resolvePolicy(ctx);
  const all = listAllDishes();
  const safe = applyHardSafety(all, ctx);
  const safetyBlocked = isSafetyBlocked(all, ctx.allergies, ctx.dietType);

  if (policy === "PANTRY_MODE") {
    const pantry = matchPantryDishes(ctx, 3);
    const primary = pantry.recipeIds[0];
    const coverage = primary ? pantry.coverageById[primary] : undefined;
    const codes = pantryReasonCodes(coverage);
    return {
      policy,
      candidateIds: pantry.recipeIds,
      primaryId: primary,
      reasonCodes: codes,
      safetyBlocked: safetyBlocked && pantry.recipeIds.length === 0,
      source: "pantry",
      pantryMissingTotal: primary
        ? pantry.missingTotalById[primary]
        : undefined,
      pantryCoverage: coverage,
    };
  }

  if (policy === "US_WITH_WEEKLY_PLAN") {
    const date = ctx.date ?? new Date();
    const todayKey = formatLocalIsoDate(date);
    // Tonight uses today's calendar date in the rolling plan (not Monday index).
    const planned = ctx.weeklyPlan.find((d) => d.date === todayKey);
    const dayRole =
      planned != null ? ctx.weekDayRoles?.[planned.dayOffset] : undefined;
    const plannedDish = planned ? getDishById(planned.recipeId) : undefined;
    const plannedSafe =
      plannedDish &&
      applyHardSafety([plannedDish], ctx).length > 0 &&
      isDinnerComplete(plannedDish)
        ? plannedDish.id
        : undefined;
    const companions =
      plannedSafe && planned?.meal
        ? planned.meal.companionRecipeIds.filter((id) => {
            const c = getDishById(id);
            return c ? applyHardSafety([c], ctx).length > 0 : false;
          })
        : [];

    if (plannedSafe) {
      // Planned Us meal is a fixed contract — not a rotatable recommendation set.
      return {
        policy,
        candidateIds: [plannedSafe],
        primaryId: plannedSafe,
        plannedRecipeId: plannedSafe,
        companionRecipeIds: companions,
        mealBalanceReason: planned?.meal?.balanceReason,
        dayRole,
        reasonCodes: ["FROM_WEEKLY_PLAN"],
        safetyBlocked: false,
        source: "weekly-plan",
      };
    }

    // Unsafe / non-dinner planned dish: never leak a hidden fallback meal object.
    const universe = dinnerUniverse(candidateUniverse(policy, safe, ctx));
    const fallback = rankCandidates(universe, "US_WITHOUT_PLAN", ctx, {
      dayRole,
      limit: 3,
    });
    return {
      policy: "US_WITHOUT_PLAN",
      candidateIds: fallback.map((r) => r.dish.id),
      primaryId: fallback[0]?.dish.id,
      dayRole,
      reasonCodes: fallback[0]?.reasonCodes ?? [],
      safetyBlocked: safetyBlocked && fallback.length === 0,
      source: "resolver",
    };
  }

  if (
    (policy === "GUESTS_EASY" ||
      policy === "GUESTS_SPECIAL" ||
      policy === "GUESTS_SURPRISE") &&
    ctx.tonight.occasion === "guests" &&
    !ctx.tonight.intent
  ) {
    return {
      policy,
      candidateIds: [],
      reasonCodes: [],
      safetyBlocked: false,
      source: "resolver",
    };
  }

  if (
    (policy === "GUESTS_EASY" ||
      policy === "GUESTS_SPECIAL" ||
      policy === "GUESTS_SURPRISE") &&
    ctx.tonight.occasion === "guests" &&
    !ctx.tonight.guestPrimaryCuisineId
  ) {
    return {
      policy,
      candidateIds: [],
      reasonCodes: [],
      safetyBlocked: false,
      source: "resolver",
    };
  }

  let universe = dinnerUniverse(candidateUniverse(policy, safe, ctx));

  // Surprise fallback ladder: primary → preferred → broader guest-safe easy (dinner-complete)
  if (policy === "GUESTS_SURPRISE" && universe.length === 0) {
    universe = dinnerUniverse(safe.filter((d) => d.difficulty === "easy"));
  }

  if (policy === "SOMEONE_SPECIAL" && universe.length === 0) {
    universe = dinnerUniverse(safe);
  }

  // Guests easy/special empty → broaden to safe host easy (honest, not random)
  if (
    (policy === "GUESTS_EASY" || policy === "GUESTS_SPECIAL") &&
    universe.length === 0
  ) {
    universe = dinnerUniverse(safe.filter((d) => d.difficulty === "easy"));
  }

  const ranked = rankCandidates(universe, policy, ctx, { limit: 3 });

  // Empty safe result stays empty — never manufacture a hidden fallback meal.
  return {
    policy,
    candidateIds: ranked.map((r) => r.dish.id),
    primaryId: ranked[0]?.dish.id,
    reasonCodes: ranked[0]?.reasonCodes ?? [],
    safetyBlocked: safetyBlocked && ranked.length === 0,
    source: "resolver",
  };
}

export function buildMealFromDecision(
  recipeId: string,
  locale: AppLocale,
  context: TonightDecisionContext,
  reasonCodes: RecommendationReasonCode[] = [],
  companionRecipeIds: string[] = [],
): MealRecommendation | null {
  const dish = getDishById(recipeId);
  if (!dish) return null;
  const localized = dish.content[locale] ?? dish.content.en;
  const isGuest =
    context.occasion === "guests" || context.occasion === "friend";
  const baseReason =
    isGuest && localized.reasonGuests
      ? localized.reasonGuests
      : localized.reason;

  const recommendationBasis =
    context.intent === "surprise"
      ? "guest_cuisine"
      : context.intent === "special"
        ? "curated_special"
        : context.intent === "familiar"
          ? "easy_familiar"
          : undefined;

  const reason =
    reasonCodes.length > 0
      ? composeReasonText(
          reasonCodes,
          baseReason,
          (key) => t(locale, key),
          locale,
        )
      : baseReason;

  const companions = companionRecipeIds
    .map((id) => {
      const c = getDishById(id);
      if (!c) return null;
      return { recipeId: c.id, title: c.title, imageUrl: c.imageUrl };
    })
    .filter(
      (c): c is { recipeId: string; title: string; imageUrl: string } =>
        c != null,
    );

  return {
    id: `${recipeId}-${locale}`,
    recipeId: dish.id,
    cuisineFamilyId: dish.cuisineFamilyId,
    title: dish.title,
    reason,
    reasonCodes,
    recommendationBasis,
    prepMinutes: dish.prepMinutes,
    imageUrl: dish.imageUrl,
    cuisine: localized.cuisineLabel,
    servings: dish.servings,
    ingredients: localized.ingredients.map((i) => ({ ...i })),
    steps: localized.steps.map((s) => ({ ...s })),
    tips: [...localized.tips],
    storageTip: localized.storageTip,
    companions: companions.length > 0 ? companions : undefined,
  };
}

export { buildIntelligentWeekPlan, resolvePolicy };
