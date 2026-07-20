import type { RecipeQaEntry, RecipeQaStatus, RecipeQaStore } from "./recipeStudioTypes";

export function defaultCanonicalRecipeQaStatus(): RecipeQaStatus {
  return "approved";
}

export function defaultDraftRecipeQaStatus(): RecipeQaStatus {
  return "draft";
}

export function loadRecipeQaStore(raw?: string | null): RecipeQaStore {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return {};
    }
    const out: RecipeQaStore = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === "string") {
        if (
          value === "draft" ||
          value === "needs_correction" ||
          value === "approved"
        ) {
          out[key] = { status: value };
        }
        continue;
      }
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        const entry = value as RecipeQaEntry;
        if (
          entry.status === "draft" ||
          entry.status === "needs_correction" ||
          entry.status === "approved"
        ) {
          out[key] = {
            status: entry.status,
            notes: typeof entry.notes === "string" ? entry.notes : undefined,
          };
        }
      }
    }
    return out;
  } catch {
    return {};
  }
}

export function saveRecipeQaToStore(
  store: RecipeQaStore,
  recipeId: string,
  entry: RecipeQaEntry,
): RecipeQaStore {
  return { ...store, [recipeId]: entry };
}

export function getRecipeQaEntry(
  store: RecipeQaStore,
  recipeId: string,
  options: { isDraft: boolean; isCanonical: boolean },
): RecipeQaEntry {
  if (store[recipeId]) return store[recipeId]!;
  if (options.isDraft) return { status: defaultDraftRecipeQaStatus() };
  if (options.isCanonical) return { status: defaultCanonicalRecipeQaStatus() };
  return { status: "draft" };
}

export function countRecipeQaByStatus(
  recipeIds: readonly string[],
  store: RecipeQaStore,
  sourceById: Record<string, "canonical" | "draft">,
): Record<RecipeQaStatus, number> {
  const counts: Record<RecipeQaStatus, number> = {
    draft: 0,
    needs_correction: 0,
    approved: 0,
  };
  for (const id of recipeIds) {
    const entry = getRecipeQaEntry(store, id, {
      isDraft: sourceById[id] === "draft",
      isCanonical: sourceById[id] === "canonical",
    });
    counts[entry.status] += 1;
  }
  return counts;
}
