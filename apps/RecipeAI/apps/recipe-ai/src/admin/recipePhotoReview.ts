/** Human photography QA — browser-local persistence (Phase A, no DB migration). */

export type PhotoReviewStatus = "pending" | "approved" | "needs_replacement";

export type PhotoReviewStore = Record<string, PhotoReviewStatus>;

export const PHOTO_REVIEW_STORAGE_KEY = "shareyum-admin-photo-review-v1";

export function defaultPhotoReviewStatus(): PhotoReviewStatus {
  return "pending";
}

export function loadPhotoReviewStore(raw?: string | null): PhotoReviewStore {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return {};
    }
    const out: PhotoReviewStore = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (
        value === "pending" ||
        value === "approved" ||
        value === "needs_replacement"
      ) {
        out[key] = value;
      }
    }
    return out;
  } catch {
    return {};
  }
}

export function savePhotoReviewToStore(
  store: PhotoReviewStore,
  recipeId: string,
  status: PhotoReviewStatus,
): PhotoReviewStore {
  return { ...store, [recipeId]: status };
}

export function getPhotoReviewStatus(
  store: PhotoReviewStore,
  recipeId: string,
): PhotoReviewStatus {
  return store[recipeId] ?? defaultPhotoReviewStatus();
}

export function countPhotoReviewsByStatus(
  recipeIds: readonly string[],
  store: PhotoReviewStore,
): Record<PhotoReviewStatus, number> {
  const counts: Record<PhotoReviewStatus, number> = {
    pending: 0,
    approved: 0,
    needs_replacement: 0,
  };
  for (const id of recipeIds) {
    counts[getPhotoReviewStatus(store, id)] += 1;
  }
  return counts;
}

/** Next recipe still marked pending — wraps after the last item. */
export function findNextUnreviewedRecipeId(
  recipeIds: readonly string[],
  store: PhotoReviewStore,
  afterRecipeId?: string,
): string | undefined {
  const pending = recipeIds.filter(
    (id) => getPhotoReviewStatus(store, id) === "pending",
  );
  if (pending.length === 0) return undefined;
  if (!afterRecipeId) return pending[0];
  const idx = pending.indexOf(afterRecipeId);
  if (idx >= 0 && idx < pending.length - 1) return pending[idx + 1];
  return pending[0];
}

export function readPhotoReviewStoreFromBrowser(): PhotoReviewStore {
  if (typeof localStorage === "undefined") return {};
  return loadPhotoReviewStore(localStorage.getItem(PHOTO_REVIEW_STORAGE_KEY));
}

export function writePhotoReviewStoreToBrowser(store: PhotoReviewStore): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(PHOTO_REVIEW_STORAGE_KEY, JSON.stringify(store));
}
