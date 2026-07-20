import { DISH_CATALOG, getDishById, listAllDishes } from "../data/catalog/dishes";
import type { DraftRecipeStore } from "./recipeStudioTypes";

/**
 * Consumer isolation guards — drafts and studio-only ids must never enter
 * canonical decision-engine catalog accessors.
 */
export function isInConsumerCatalog(recipeId: string): boolean {
  return DISH_CATALOG.some((d) => d.id === recipeId);
}

export function assertDraftNotInConsumerCatalog(
  recipeId: string,
  drafts: DraftRecipeStore,
): boolean {
  if (!drafts[recipeId]) return true;
  return !isInConsumerCatalog(recipeId);
}

export function listDraftIdsExcludedFromConsumer(
  drafts: DraftRecipeStore,
): string[] {
  return Object.keys(drafts).filter((id) => !isInConsumerCatalog(id));
}

export function consumerCatalogUnchangedByDrafts(
  drafts: DraftRecipeStore,
): boolean {
  const consumerIds = new Set(listAllDishes().map((d) => d.id));
  for (const draftId of Object.keys(drafts)) {
    if (consumerIds.has(draftId) && !drafts[draftId]) {
      return false;
    }
  }
  return listAllDishes().length === DISH_CATALOG.length;
}

export function resolveConsumerDishOrNull(recipeId: string) {
  if (!isInConsumerCatalog(recipeId)) return undefined;
  return getDishById(recipeId);
}

export function draftIdsMustNotResolveViaConsumerGetDishById(
  drafts: DraftRecipeStore,
): boolean {
  for (const draftId of Object.keys(drafts)) {
    if (isInConsumerCatalog(draftId)) continue;
    if (getDishById(draftId) !== undefined) return false;
  }
  return true;
}
