import { useCallback, useEffect, useMemo, useState } from "react";
import {
  adminDetailPath,
  adminListPath,
  parseAdminRoute,
  type AdminRoute,
} from "./adminRoute";
import { AdminRecipeDetailScreen } from "./AdminRecipeDetailScreen";
import { AdminRecipeListScreen } from "./AdminRecipeListScreen";
import {
  readPhotoReviewStoreFromBrowser,
  writePhotoReviewStoreToBrowser,
  type PhotoReviewStore,
} from "./recipePhotoReview";
import { seedPhotoQaFromKnownFindings } from "./recipeStudioKnownFindings";
import { emptyStudioState, readStudioStateFromBrowser, writeStudioStateToBrowser } from "./recipeStudioStorage";
import type { RecipeStudioPersistedState } from "./recipeStudioTypes";

function readRoute(): AdminRoute {
  return parseAdminRoute(window.location.pathname) ?? { screen: "list" };
}

export function AdminApp() {
  const [route, setRoute] = useState<AdminRoute>(readRoute);
  const [photoReview, setPhotoReview] = useState<PhotoReviewStore>(() =>
    seedPhotoQaFromKnownFindings(readPhotoReviewStoreFromBrowser()),
  );
  const [studio, setStudio] = useState<RecipeStudioPersistedState>(() =>
    readStudioStateFromBrowser(),
  );

  // Persist seeded Studio drafts (e.g. Arab Batch 1) so a hard refresh keeps
  // Admin catalog visibility without requiring a manual edit first.
  useEffect(() => {
    writeStudioStateToBrowser(studio);
    writePhotoReviewStoreToBrowser(photoReview);
    // Intentionally once on mount — subsequent writes go through persistStudio.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.documentElement.classList.add("admin-workspace");
    document.body.classList.add("admin-workspace");
    return () => {
      document.documentElement.classList.remove("admin-workspace");
      document.body.classList.remove("admin-workspace");
    };
  }, []);

  useEffect(() => {
    const onPopState = () => setRoute(readRoute());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = useCallback((path: string) => {
    window.history.pushState(null, "", path);
    setRoute(parseAdminRoute(path) ?? { screen: "list" });
  }, []);

  const persistPhotoReview = useCallback((next: PhotoReviewStore) => {
    setPhotoReview(next);
    writePhotoReviewStoreToBrowser(next);
  }, []);

  const persistStudio = useCallback((next: RecipeStudioPersistedState) => {
    setStudio(next);
    writeStudioStateToBrowser(next);
  }, []);

  const resetStudioStorage = useCallback(() => {
    const fresh = emptyStudioState();
    setStudio(fresh);
    writeStudioStateToBrowser(fresh);
  }, []);

  const goToList = useCallback(() => navigate(adminListPath()), [navigate]);
  const goToDetail = useCallback(
    (recipeId: string) => navigate(adminDetailPath(recipeId)),
    [navigate],
  );

  const header = useMemo(
    () => (
      <header
        className="sticky top-0 z-30 border-b px-4 py-3 md:px-8"
        style={{
          borderColor: "var(--soft-beige)",
          background: "rgba(250, 249, 247, 0.96)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-2">
          <div>
            <p
              className="text-[0.65rem] font-semibold uppercase tracking-[0.14em]"
              style={{ color: "var(--warm-gray)" }}
            >
              Internal · Recipe Studio
            </p>
            <h1
              className="text-xl font-semibold md:text-2xl"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--brand-primary)",
              }}
            >
              ShareYum Recipe Studio
            </h1>
          </div>
          <p className="max-w-md text-xs" style={{ color: "var(--warm-gray)" }}>
            Build, edit, review, and approve recipes before consumer exposure.
            Drafts stay isolated from Tonight / weekly plan / pantry.
          </p>
        </div>
      </header>
    ),
    [],
  );

  return (
    <div
      className="admin-root flex min-h-dvh w-full flex-col overflow-y-auto"
      style={{ background: "var(--warm-white)" }}
    >
      {header}
      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-5 md:px-8 md:py-6">
        {route.screen === "list" ? (
          <AdminRecipeListScreen
            studio={studio}
            photoReview={photoReview}
            onOpenRecipe={goToDetail}
            onStudioChange={persistStudio}
            onPhotoReviewChange={persistPhotoReview}
          />
        ) : (
          <AdminRecipeDetailScreen
            recipeId={route.recipeId}
            studio={studio}
            photoReview={photoReview}
            onStudioChange={persistStudio}
            onPhotoReviewChange={persistPhotoReview}
            onBack={goToList}
            onOpenRecipe={goToDetail}
            onResetStudio={resetStudioStorage}
          />
        )}
      </main>
    </div>
  );
}
