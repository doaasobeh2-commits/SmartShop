import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { isDishPlaceholderUrl } from "../components/dishImageStyle";
import { ResponsiveDishImage } from "../components/DishImageSurface";
import { AdminNewRecipeDialog } from "./AdminNewRecipeDialog";
import {
  buildStudioSummary,
  EMPTY_CATALOG_FILTERS,
  filterStudioRecipes,
  listUniqueCuisinesFromStudio,
  listUniqueMealTypesFromStudio,
  paginateStudioRecipes,
  type CatalogFilters,
  type IntentFilterTag,
} from "./recipeCatalogAdmin";
import {
  savePhotoReviewToStore,
  type PhotoReviewStatus,
  type PhotoReviewStore,
} from "./recipePhotoReview";
import { recipeHasQaWarnings } from "./recipeQaAudit";
import { saveRecipeQaToStore } from "./recipeQaReview";
import type { RecipeQaStatus } from "./recipeStudioTypes";
import { listStudioRecipeViews } from "./recipeStudioMerge";
import {
  createDraftFromCreationInput,
  type DraftCreationInput,
  type RecipeStudioPersistedState,
  type StudioRecipeView,
} from "./recipeStudioTypes";
import {
  buildStudioMetadataForNewDraft,
  generateDraftRecipeId,
} from "./recipeStudioStorage";

const INTENT_OPTIONS: { value: IntentFilterTag; label: string }[] = [
  { value: "budget", label: "Budget" },
  { value: "healthy", label: "Healthy" },
  { value: "light", label: "Light" },
  { value: "filling", label: "Filling" },
  { value: "special", label: "Special" },
  { value: "quick", label: "Quick" },
  { value: "vegetarian", label: "Vegetarian" },
];

const PHOTO_QA_LABELS: Record<PhotoReviewStatus, string> = {
  pending: "Photo: Pending",
  approved: "Photo: Approved",
  needs_replacement: "Photo: Replace",
};

const RECIPE_QA_LABELS: Record<RecipeQaStatus, string> = {
  draft: "Recipe: Draft",
  needs_correction: "Recipe: Fix",
  approved: "Recipe: Approved",
};

type AdminRecipeListScreenProps = {
  studio: RecipeStudioPersistedState;
  photoReview: PhotoReviewStore;
  onOpenRecipe: (recipeId: string) => void;
  onStudioChange: (state: RecipeStudioPersistedState) => void;
  onPhotoReviewChange: (store: PhotoReviewStore) => void;
};

function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "accent" | "warn" | "ok" | "draft";
}) {
  const styles: Record<string, CSSProperties> = {
    neutral: {
      background: "rgba(90, 64, 48, 0.08)",
      color: "var(--brand-primary)",
    },
    accent: {
      background: "rgba(196, 101, 46, 0.12)",
      color: "var(--accent)",
    },
    warn: { background: "rgba(184, 134, 58, 0.15)", color: "var(--warning)" },
    ok: { background: "rgba(92, 122, 90, 0.15)", color: "var(--success)" },
    draft: { background: "rgba(58, 36, 22, 0.1)", color: "var(--brand-chocolate)" },
  };
  return (
    <span
      className="inline-flex rounded-md px-1.5 py-0.5 text-[0.65rem] font-medium"
      style={styles[tone]}
    >
      {children}
    </span>
  );
}

function SummaryStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div
      className="rounded-xl border px-3 py-2"
      style={{
        borderColor: "var(--soft-beige)",
        background: "rgba(255, 253, 249, 0.92)",
      }}
    >
      <p className="text-[0.65rem] uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>
        {label}
      </p>
      <p className="text-lg font-semibold" style={{ color: "var(--deep-charcoal)" }}>
        {value}
      </p>
    </div>
  );
}

function RecipeCard({
  recipe,
  onOpen,
}: {
  recipe: StudioRecipeView;
  onOpen: () => void;
}) {
  const hasWarnings = recipeHasQaWarnings(recipe);
  const hasValidImage =
    Boolean(recipe.imageUrl) && !isDishPlaceholderUrl(recipe.imageUrl);
  // Large DRAFT overlay only while Recipe QA is still Draft (source may remain a draft record).
  const showDraftOverlay =
    recipe.isDraft && recipe.recipeQaStatus === "draft";

  return (
    <article
      className="flex flex-col overflow-hidden rounded-xl border"
      style={{
        borderColor: recipe.isDraft ? "var(--accent)" : "var(--soft-beige)",
        background: "rgba(255, 253, 249, 0.95)",
      }}
    >
      <div className="relative h-32 w-full shrink-0 overflow-hidden">
        <ResponsiveDishImage
          imageUrl={recipe.imageUrl}
          alt={recipe.title}
          preset="mobile-sm"
          className="h-full"
        />
        {showDraftOverlay ? (
          <span
            className="absolute left-2 top-2 rounded px-1.5 py-0.5 text-[0.6rem] font-bold uppercase"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            Draft
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div>
          <h3 className="text-sm font-semibold leading-snug" style={{ color: "var(--deep-charcoal)" }}>
            {recipe.title}
          </h3>
          <p className="font-mono text-[0.65rem]" style={{ color: "var(--warm-gray)" }}>
            {recipe.id}
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          <Badge>{recipe.cuisineFamilyId.replace("_", " ")}</Badge>
          {recipe.mealIntents.slice(0, 2).map((tag) => (
            <Badge key={tag} tone="accent">
              {tag === "high_calorie" ? "filling" : tag}
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {!hasValidImage ? <Badge tone="warn">Photo gap</Badge> : null}
          <Badge
            tone={
              recipe.photoQaStatus === "approved"
                ? "ok"
                : recipe.photoQaStatus === "needs_replacement"
                  ? "warn"
                  : "neutral"
            }
          >
            {PHOTO_QA_LABELS[recipe.photoQaStatus]}
          </Badge>
          <Badge
            tone={
              recipe.recipeQaStatus === "approved"
                ? "ok"
                : recipe.recipeQaStatus === "needs_correction"
                  ? "warn"
                  : "draft"
            }
          >
            {RECIPE_QA_LABELS[recipe.recipeQaStatus]}
          </Badge>
          {hasWarnings ? <Badge tone="warn">QA warnings</Badge> : null}
        </div>
        <button
          type="button"
          onClick={onOpen}
          className="mt-auto rounded-lg px-3 py-1.5 text-left text-xs font-semibold text-white"
          style={{ background: "var(--brand-primary)" }}
        >
          Open / View
        </button>
      </div>
    </article>
  );
}

export function AdminRecipeListScreen({
  studio,
  photoReview,
  onOpenRecipe,
  onStudioChange,
  onPhotoReviewChange,
}: AdminRecipeListScreenProps) {
  const [filters, setFilters] = useState<CatalogFilters>(EMPTY_CATALOG_FILTERS);
  const [page, setPage] = useState(1);
  const [newRecipeOpen, setNewRecipeOpen] = useState(false);

  const allViews = useMemo(
    () =>
      listStudioRecipeViews(
        studio.overrides,
        studio.drafts,
        studio.recipeQa,
        photoReview,
      ),
    [studio, photoReview],
  );

  const summary = useMemo(() => buildStudioSummary(allViews), [allViews]);

  const filtered = useMemo(
    () => filterStudioRecipes(allViews, filters),
    [allViews, filters],
  );

  const paged = useMemo(
    () => paginateStudioRecipes(filtered, page),
    [filtered, page],
  );

  const cuisines = useMemo(() => listUniqueCuisinesFromStudio(allViews), [allViews]);
  const mealTypes = useMemo(() => listUniqueMealTypesFromStudio(allViews), [allViews]);

  const updateFilter = <K extends keyof CatalogFilters>(key: K, value: CatalogFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleCreateDraft = (input: DraftCreationInput) => {
    const existingIds = new Set(allViews.map((v) => v.id));
    const id = generateDraftRecipeId(existingIds);
    const draft = createDraftFromCreationInput(id, input);
    const metadata = buildStudioMetadataForNewDraft(input);
    onStudioChange({
      ...studio,
      drafts: { ...studio.drafts, [id]: draft },
      metadata: { ...studio.metadata, [id]: metadata },
      recipeQa: saveRecipeQaToStore(studio.recipeQa, id, { status: "draft" }),
    });
    onPhotoReviewChange(savePhotoReviewToStore(photoReview, id, "pending"));
    onOpenRecipe(id);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm" style={{ color: "var(--warm-gray)" }}>
          {summary.canonicalCount} canonical · {summary.draftCount} drafts ·{" "}
          {summary.warningCount} with QA warnings
        </p>
        <button
          type="button"
          onClick={() => setNewRecipeOpen(true)}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
          style={{ background: "var(--accent)" }}
        >
          + New Recipe
        </button>
      </div>

      <AdminNewRecipeDialog
        open={newRecipeOpen}
        onClose={() => setNewRecipeOpen(false)}
        onCreate={handleCreateDraft}
      />

      <section className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-8" aria-label="Catalog summary">
        <SummaryStat label="Total" value={summary.totalRecipes} />
        <SummaryStat label="Canonical" value={summary.canonicalCount} />
        <SummaryStat label="Drafts" value={summary.draftCount} />
        <SummaryStat label="With photos" value={summary.recipesWithPhotos} />
        <SummaryStat label="Cuisines" value={summary.cuisineCount} />
        <SummaryStat label="QA warnings" value={summary.warningCount} />
        <SummaryStat label="Photo pending" value={summary.photoReviewCounts.pending} />
        <SummaryStat label="Recipe needs fix" value={summary.recipeQaCounts.needs_correction} />
      </section>

      <section
        className="grid gap-3 rounded-xl border p-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5"
        style={{
          borderColor: "var(--soft-beige)",
          background: "rgba(243, 238, 230, 0.45)",
        }}
      >
        <label className="flex flex-col gap-1 text-xs xl:col-span-2">
          <span style={{ color: "var(--warm-gray)" }}>Search</span>
          <input
            type="search"
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="rounded-lg border px-2 py-1.5 text-sm"
            style={{ borderColor: "var(--soft-beige)" }}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span style={{ color: "var(--warm-gray)" }}>Source</span>
          <select
            value={filters.source}
            onChange={(e) =>
              updateFilter("source", e.target.value as CatalogFilters["source"])
            }
            className="rounded-lg border px-2 py-1.5 text-sm"
          >
            <option value="all">All</option>
            <option value="canonical">Canonical</option>
            <option value="draft">Draft</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span style={{ color: "var(--warm-gray)" }}>Cuisine</span>
          <select
            value={filters.cuisine}
            onChange={(e) => updateFilter("cuisine", e.target.value)}
            className="rounded-lg border px-2 py-1.5 text-sm"
          >
            <option value="">All</option>
            {cuisines.map((c) => (
              <option key={c} value={c}>
                {c.replace("_", " ")}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span style={{ color: "var(--warm-gray)" }}>Meal type</span>
          <select
            value={filters.mealType}
            onChange={(e) => updateFilter("mealType", e.target.value)}
            className="rounded-lg border px-2 py-1.5 text-sm"
          >
            <option value="">All</option>
            {mealTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span style={{ color: "var(--warm-gray)" }}>Intent</span>
          <select
            value={filters.intent}
            onChange={(e) =>
              updateFilter("intent", e.target.value as IntentFilterTag | "")
            }
            className="rounded-lg border px-2 py-1.5 text-sm"
          >
            <option value="">All</option>
            {INTENT_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span style={{ color: "var(--warm-gray)" }}>Photo QA</span>
          <select
            value={filters.photoQaStatus}
            onChange={(e) =>
              updateFilter(
                "photoQaStatus",
                e.target.value as CatalogFilters["photoQaStatus"],
              )
            }
            className="rounded-lg border px-2 py-1.5 text-sm"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="needs_replacement">Needs replacement</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span style={{ color: "var(--warm-gray)" }}>Recipe QA</span>
          <select
            value={filters.recipeQaStatus}
            onChange={(e) =>
              updateFilter(
                "recipeQaStatus",
                e.target.value as CatalogFilters["recipeQaStatus"],
              )
            }
            className="rounded-lg border px-2 py-1.5 text-sm"
          >
            <option value="all">All</option>
            <option value="draft">Draft</option>
            <option value="needs_correction">Needs correction</option>
            <option value="approved">Approved</option>
          </select>
        </label>
        <label className="flex items-end gap-2 text-xs pb-1.5">
          <input
            type="checkbox"
            checked={filters.hasQaWarnings}
            onChange={(e) => updateFilter("hasQaWarnings", e.target.checked)}
          />
          Has QA warnings
        </label>
      </section>

      <p className="text-sm" style={{ color: "var(--warm-gray)" }}>
        Showing {paged.items.length} of {filtered.length} filtered ({allViews.length}{" "}
        total) · page {paged.page}/{paged.totalPages}
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {paged.items.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} onOpen={() => onOpenRecipe(recipe.id)} />
        ))}
      </div>

      {filtered.length === 0 ? (
        <p
          className="rounded-xl border px-4 py-6 text-center text-sm"
          style={{ borderColor: "var(--soft-beige)", color: "var(--warm-gray)" }}
        >
          No recipes match filters. Canonical catalog entries are never deleted — adjust filters.
        </p>
      ) : null}

      {paged.totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            disabled={paged.page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded border px-3 py-1 text-sm disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm" style={{ color: "var(--warm-gray)" }}>
            Page {paged.page} / {paged.totalPages}
          </span>
          <button
            type="button"
            disabled={paged.page >= paged.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded border px-3 py-1 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}
