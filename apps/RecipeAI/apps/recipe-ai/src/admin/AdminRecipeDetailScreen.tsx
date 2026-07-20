import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AdminDishImage } from "../components/AdminDishImage";
import { DEFAULT_IMAGE_QUALITY_GUIDANCE } from "../components/responsiveDishImage";
import { CURATED_COMPANIONS } from "../data/catalog/decision/mealComposition";
import { getDishById } from "../data/catalog/dishes";
import type { AppLocale } from "../i18n/types";
import { AdminImageCropPreviews } from "./AdminImageCropPreviews";
import { AdminRecipeEditPanel, type RecipeEditSavePayload } from "./AdminRecipeEditPanel";
import {
  creationInputFromDraft,
  generateDraftContent,
  metadataPatchFromGeneratedRecipe,
} from "./recipeAiGeneration";
import {
  canGenerateDish,
  getActiveRecipeProvider,
  interpretRevisionInstruction,
  isImageGenerationConfigured,
} from "./recipeGenerationProviders";
import { resolveCatalogPhotoStatus, resolveImageIntegrityLabel } from "./recipeCatalogAdmin";
import { auditRecipeContent } from "./recipeQaAudit";
import {
  auditMealRole,
  mealRoleShortLabel,
  resolveMealRole,
  type MealRoleInput,
} from "./mealRole";
import {
  getRecipeQaEntry,
  saveRecipeQaToStore,
} from "./recipeQaReview";
import type { RecipeQaStatus } from "./recipeStudioTypes";
import {
  findNextUnreviewedRecipeId,
  getPhotoReviewStatus,
  savePhotoReviewToStore,
  type PhotoReviewStatus,
  type PhotoReviewStore,
} from "./recipePhotoReview";
import { knownCulturalReviewNote } from "./recipeStudioKnownFindings";
import {
  getStudioRecipeById,
  listStudioRecipeViews,
} from "./recipeStudioMerge";
import { getStudioMetadata } from "./recipeStudioStorage";
import type { RecipeStudioPersistedState } from "./recipeStudioTypes";

const LOCALES: AppLocale[] = ["en", "de", "ar", "tr"];

const PHOTO_QA_OPTIONS: { value: PhotoReviewStatus; label: string }[] = [
  { value: "pending", label: "Pending review" },
  { value: "approved", label: "Approved" },
  { value: "needs_replacement", label: "Needs replacement" },
];

const RECIPE_QA_OPTIONS: { value: RecipeQaStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "needs_correction", label: "Needs correction" },
  { value: "approved", label: "Approved" },
];

type AdminRecipeDetailScreenProps = {
  recipeId: string;
  studio: RecipeStudioPersistedState;
  photoReview: PhotoReviewStore;
  onStudioChange: (state: RecipeStudioPersistedState) => void;
  onPhotoReviewChange: (store: PhotoReviewStore) => void;
  onBack: () => void;
  onOpenRecipe: (recipeId: string) => void;
  onResetStudio: () => void;
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section
      className="rounded-xl border p-4"
      style={{
        borderColor: "var(--soft-beige)",
        background: "rgba(255, 253, 249, 0.92)",
      }}
    >
      <h2
        className="mb-3 text-sm font-semibold uppercase tracking-wide"
        style={{ color: "var(--brand-primary)" }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function MetaRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div
      className="grid grid-cols-[140px_1fr] gap-2 border-b py-1.5 text-sm last:border-b-0"
      style={{ borderColor: "var(--soft-beige)" }}
    >
      <span style={{ color: "var(--warm-gray)" }}>{label}</span>
      <span style={{ color: "var(--deep-charcoal)" }}>{value}</span>
    </div>
  );
}

export function AdminRecipeDetailScreen({
  recipeId,
  studio,
  photoReview,
  onStudioChange,
  onPhotoReviewChange,
  onBack,
  onOpenRecipe,
}: AdminRecipeDetailScreenProps) {
  const [editMode, setEditMode] = useState(false);
  const [qaNotes, setQaNotes] = useState("");
  const [aiPromptPreview, setAiPromptPreview] = useState<string | null>(null);
  const [aiGenerationMessage, setAiGenerationMessage] = useState<string | null>(null);
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [reviewActionMessage, setReviewActionMessage] = useState<string | null>(null);
  const isDraft = Boolean(studio.drafts[recipeId]);
  const dish = getStudioRecipeById(recipeId, studio.overrides, studio.drafts);
  const draftRecord = studio.drafts[recipeId];

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
  const allIds = useMemo(() => allViews.map((v) => v.id), [allViews]);

  const recipeQaEntry = getRecipeQaEntry(studio.recipeQa, recipeId, {
    isDraft,
    isCanonical: !isDraft && Boolean(getDishById(recipeId)),
  });
  const photoQaStatus = getPhotoReviewStatus(photoReview, recipeId);

  // Keep local notes field in sync when navigating between recipes.
  useEffect(() => {
    setQaNotes(recipeQaEntry.notes ?? "");
    setReviewActionMessage(null);
    setReviewFeedback("");
    // Only reset ephemeral UI when the recipe identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipeId]);
  const metadata = getStudioMetadata(studio.metadata, recipeId);
  const naturalYield = metadata.naturalYield ?? draftRecord?.naturalYield;
  const override = studio.overrides[recipeId];
  const explicitRole: MealRoleInput = {
    defaultRole: draftRecord?.defaultRole ?? override?.defaultRole,
    canServeAsMain: draftRecord?.canServeAsMain ?? override?.canServeAsMain,
  };
  const mealRole = dish
    ? resolveMealRole({ explicit: explicitRole, dish })
    : null;
  const warnings = dish
    ? [...auditRecipeContent(dish), ...auditMealRole(explicitRole, { isDraft })]
    : [];
  const culturalNote =
    metadata.culturalReviewNote ?? knownCulturalReviewNote(recipeId);
  const companions = dish
    ? (isDraft
        ? draftRecord?.companionIds ?? []
        : CURATED_COMPANIONS[recipeId] ?? []
      )
        .map((id) => getStudioRecipeById(id, studio.overrides, studio.drafts))
        .filter(Boolean)
    : [];

  const nextUnreviewed = findNextUnreviewedRecipeId(allIds, photoReview, recipeId);

  if (!dish) {
    return (
      <div className="space-y-4">
        <button type="button" onClick={onBack} className="text-sm underline">
          ← Back to studio
        </button>
        <p style={{ color: "var(--error)" }}>Recipe not found: {recipeId}</p>
      </div>
    );
  }

  const setPhotoQa = (status: PhotoReviewStatus) => {
    onPhotoReviewChange(savePhotoReviewToStore(photoReview, recipeId, status));
  };

  const setRecipeQa = (status: RecipeQaStatus) => {
    onStudioChange({
      ...studio,
      recipeQa: saveRecipeQaToStore(studio.recipeQa, recipeId, {
        status,
        notes: qaNotes || recipeQaEntry.notes,
      }),
    });
  };

  const saveQaNotes = () => {
    onStudioChange({
      ...studio,
      recipeQa: saveRecipeQaToStore(studio.recipeQa, recipeId, {
        ...recipeQaEntry,
        notes: qaNotes,
      }),
    });
  };

  const handleEditSave = (payload: RecipeEditSavePayload) => {
    if (payload.draft) {
      onStudioChange({
        ...studio,
        drafts: { ...studio.drafts, [recipeId]: payload.draft },
        metadata: { ...studio.metadata, [recipeId]: payload.metadata },
      });
    } else if (payload.override) {
      onStudioChange({
        ...studio,
        overrides: { ...studio.overrides, [recipeId]: payload.override },
        metadata: { ...studio.metadata, [recipeId]: payload.metadata },
      });
    }
    setEditMode(false);
  };

  const creationInput = isDraft && draftRecord
    ? creationInputFromDraft(draftRecord, metadata)
    : {
        dishName: dish.title,
        cuisineFamilyId: dish.cuisineFamilyId,
        regionSubcuisine: metadata.regionSubcuisine,
        adminNote: metadata.creationNote,
      };
  const activeProvider = getActiveRecipeProvider(creationInput.dishName);
  const dishSupported = canGenerateDish(creationInput.dishName);

  const handleGenerateDraftWithAi = () => {
    const result = generateDraftContent({ ...creationInput, metadata });
    const promptJson = JSON.stringify(result.prompt, null, 2);
    setAiPromptPreview(promptJson);

    if (result.status !== "generated") {
      setAiGenerationMessage(result.message);
      onStudioChange({
        ...studio,
        metadata: {
          ...studio.metadata,
          [recipeId]: { ...metadata, lastAiPromptJson: promptJson },
        },
        recipeQa: saveRecipeQaToStore(studio.recipeQa, recipeId, {
          status: "draft",
          notes: recipeQaEntry.notes,
        }),
      });
      onPhotoReviewChange(savePhotoReviewToStore(photoReview, recipeId, "pending"));
      return;
    }

    if (!isDraft || !draftRecord) {
      setAiGenerationMessage(
        "Generation is available for draft recipes only; canonical entries are edited via studio overrides.",
      );
      return;
    }

    const nextMetadata = metadataPatchFromGeneratedRecipe(
      result.recipe,
      metadata,
      promptJson,
    );
    onStudioChange({
      ...studio,
      drafts: {
        ...studio.drafts,
        [recipeId]: {
          ...draftRecord,
          ...result.draftPatch,
          updatedAt: new Date().toISOString(),
        },
      },
      metadata: { ...studio.metadata, [recipeId]: nextMetadata },
      recipeQa: saveRecipeQaToStore(studio.recipeQa, recipeId, { status: "draft" }),
    });
    onPhotoReviewChange(savePhotoReviewToStore(photoReview, recipeId, "pending"));
    setAiGenerationMessage(
      `Generated "${result.recipe.canonicalTitle}" via ${result.providerId}. Recipe QA stays Draft and Photo QA stays Pending — review required before approval.`,
    );
  };

  // Human review workflow — explicit admin actions. None auto-publishes.
  const handleApproveRecipe = () => {
    onStudioChange({
      ...studio,
      recipeQa: saveRecipeQaToStore(studio.recipeQa, recipeId, {
        status: "approved",
        notes: qaNotes || recipeQaEntry.notes,
      }),
    });
    setReviewActionMessage(
      "Recipe QA set to Approved (admin QA only — not promoted to consumer catalog). Photo QA is unchanged.",
    );
  };

  const handleApprovePhoto = () => {
    onPhotoReviewChange(savePhotoReviewToStore(photoReview, recipeId, "approved"));
    setReviewActionMessage(
      "Photo QA set to Approved (admin photo review only — Recipe QA and consumer catalog unchanged).",
    );
  };

  const handleRequestChanges = () => {
    const feedback = reviewFeedback.trim();
    if (!feedback) {
      setReviewActionMessage("Enter feedback describing what should change.");
      return;
    }
    const interpretation = interpretRevisionInstruction(feedback);
    const timestamp = new Date().toISOString();
    const combinedNotes = [recipeQaEntry.notes, `[change request ${timestamp}] ${feedback}`]
      .filter(Boolean)
      .join("\n");
    onStudioChange({
      ...studio,
      metadata: {
        ...studio.metadata,
        [recipeId]: {
          ...metadata,
          revisionRequests: [
            ...(metadata.revisionRequests ?? []),
            { instruction: feedback, areas: interpretation.recognizedAreas, requestedAt: timestamp },
          ],
        },
      },
      recipeQa: saveRecipeQaToStore(studio.recipeQa, recipeId, {
        status: "draft",
        notes: combinedNotes,
      }),
    });
    if (interpretation.imageOnly) {
      onPhotoReviewChange(
        savePhotoReviewToStore(photoReview, recipeId, "needs_replacement"),
      );
    }
    setQaNotes(combinedNotes);
    setReviewFeedback("");
    setReviewActionMessage(
      `${interpretation.summary} Recipe QA returned to Draft for another review.`,
    );
  };

  const handleSaveDraft = () => {
    onStudioChange({
      ...studio,
      recipeQa: saveRecipeQaToStore(studio.recipeQa, recipeId, {
        status: recipeQaEntry.status === "approved" ? "approved" : "draft",
        notes: qaNotes || recipeQaEntry.notes,
      }),
    });
    setReviewActionMessage("Draft saved. You can leave and return later.");
  };

  const formatNaturalYield = () => {
    if (!naturalYield) return "Not set — edit or generate with AI";
    const parts: string[] = [];
    if (naturalYield.servingLabel) parts.push(naturalYield.servingLabel);
    if (naturalYield.baseServingsMin != null || naturalYield.baseServingsMax != null) {
      const min = naturalYield.baseServingsMin ?? naturalYield.baseServingsMax;
      const max = naturalYield.baseServingsMax ?? naturalYield.baseServingsMin;
      parts.push(min === max ? `${min} servings` : `${min}–${max} servings`);
    }
    return parts.length ? parts.join(" · ") : "Not set";
  };

  return (    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border px-3 py-1.5 text-sm"
          style={{ borderColor: "var(--soft-beige)" }}
        >
          ← Studio overview
        </button>
        <button
          type="button"
          onClick={() => setEditMode((v) => !v)}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-white"
          style={{ background: "var(--brand-primary)" }}
        >
          {editMode ? "Close editor" : "Edit recipe"}
        </button>
        {isDraft ? (
          <button
            type="button"
            onClick={handleGenerateDraftWithAi}
            className="rounded-lg border px-3 py-1.5 text-sm font-medium"
            style={{
              borderColor: dishSupported ? "var(--accent)" : "var(--soft-beige)",
              color: dishSupported ? "var(--accent)" : "var(--warm-gray)",
            }}
            title={
              dishSupported
                ? `Generate via ${activeProvider?.label ?? "provider"}`
                : "No provider can generate this dish name yet"
            }
          >
            Generate Draft with AI
          </button>
        ) : null}
        {nextUnreviewed && nextUnreviewed !== recipeId ? (
          <button
            type="button"
            onClick={() => onOpenRecipe(nextUnreviewed)}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-white"
            style={{ background: "var(--accent)" }}
          >
            Next unreviewed photo →
          </button>
        ) : null}
      </div>

      <div
        className="rounded-xl border px-4 py-3 text-sm"
        style={{
          borderColor: "var(--warning)",
          background: "rgba(184, 134, 58, 0.1)",
          color: "var(--brand-chocolate)",
        }}
      >
        Recipe Studio — admin-only.{" "}
        {isDraft
          ? "This is a draft and cannot appear in consumer Tonight, weekly plan, or pantry."
          : "Canonical catalog edits here are studio overlays until promoted to source files."}
      </div>

      {editMode ? (
        <AdminRecipeEditPanel
          dish={dish}
          isDraft={isDraft}
          draftRecord={draftRecord}
          metadata={metadata}
          mealRoleInitial={explicitRole}
          onSave={handleEditSave}
          onCancel={() => setEditMode(false)}
        />
      ) : null}

      {isDraft ? (
        <Section title="Human review workflow">
          <p className="mb-3 text-xs" style={{ color: "var(--warm-gray)" }}>
            AI generation never approves or publishes. Choose an explicit action
            after reviewing the generated content. Recipe approval and Photo
            approval stay independent; approval here is admin QA only and does
            not promote to the consumer catalog.
          </p>
          <p className="mb-3 text-sm" style={{ color: "var(--deep-charcoal)" }}>
            Recipe QA status:{" "}
            <strong
              style={{
                color:
                  recipeQaEntry.status === "approved"
                    ? "var(--success, #3f7d54)"
                    : recipeQaEntry.status === "needs_correction"
                      ? "var(--warning)"
                      : "var(--brand-primary)",
              }}
            >
              {RECIPE_QA_OPTIONS.find((o) => o.value === recipeQaEntry.status)?.label ??
                recipeQaEntry.status}
            </strong>
            {" · "}
            Photo QA:{" "}
            <strong
              style={{
                color:
                  photoQaStatus === "approved"
                    ? "var(--success, #3f7d54)"
                    : photoQaStatus === "needs_replacement"
                      ? "var(--warning)"
                      : "var(--brand-primary)",
              }}
            >
              {photoQaStatus === "approved"
                ? "Approved"
                : PHOTO_QA_OPTIONS.find((o) => o.value === photoQaStatus)?.label ??
                  photoQaStatus}
            </strong>
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleApproveRecipe}
              disabled={recipeQaEntry.status === "approved"}
              className="rounded-lg px-3 py-1.5 text-sm font-semibold text-white"
              style={{
                background:
                  recipeQaEntry.status === "approved"
                    ? "var(--warm-gray)"
                    : "var(--success, #3f7d54)",
                cursor: recipeQaEntry.status === "approved" ? "default" : "pointer",
              }}
              aria-pressed={recipeQaEntry.status === "approved"}
            >
              {recipeQaEntry.status === "approved" ? "Recipe approved" : "Approve recipe"}
            </button>
            <button
              type="button"
              onClick={handleApprovePhoto}
              disabled={photoQaStatus === "approved"}
              className="rounded-lg px-3 py-1.5 text-sm font-semibold text-white"
              style={{
                background:
                  photoQaStatus === "approved"
                    ? "var(--warm-gray)"
                    : "var(--brand-primary)",
                cursor: photoQaStatus === "approved" ? "default" : "pointer",
              }}
              aria-pressed={photoQaStatus === "approved"}
            >
              {photoQaStatus === "approved" ? "Photo approved" : "Approve photo"}
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              className="rounded-lg border px-3 py-1.5 text-sm font-medium"
              style={{ borderColor: "var(--soft-beige)", color: "var(--deep-charcoal)" }}
            >
              Save draft
            </button>
          </div>
          <label className="mt-3 block text-xs" style={{ color: "var(--warm-gray)" }}>
            Request changes (natural-language feedback)
            <textarea
              value={reviewFeedback}
              onChange={(e) => setReviewFeedback(e.target.value)}
              rows={2}
              placeholder='e.g. "Reduce the tahini", "Make it suitable for 3–4 people", "The Arabic instructions need correction", "Change only the image"'
              className="mt-1 w-full rounded border px-2 py-1 text-sm"
              style={{ borderColor: "var(--soft-beige)" }}
            />
          </label>
          <button
            type="button"
            onClick={handleRequestChanges}
            className="mt-2 rounded-lg px-3 py-1.5 text-sm font-semibold text-white"
            style={{ background: "var(--accent)" }}
          >
            Request changes
          </button>
          {reviewActionMessage ? (
            <p className="mt-3 text-sm" style={{ color: "var(--brand-primary)" }}>
              {reviewActionMessage}
            </p>
          ) : null}
          {metadata.revisionRequests && metadata.revisionRequests.length > 0 ? (
            <div className="mt-3">
              <p className="text-xs font-medium" style={{ color: "var(--warm-gray)" }}>
                Change request history
              </p>
              <ul className="mt-1 space-y-1 text-xs" style={{ color: "var(--deep-charcoal)" }}>
                {metadata.revisionRequests.map((r, i) => (
                  <li key={`${r.requestedAt}-${i}`}>
                    <span style={{ color: "var(--warm-gray)" }}>[{r.areas.join(", ")}]</span>{" "}
                    {r.instruction}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Section>
      ) : null}

      {(aiGenerationMessage || aiPromptPreview || metadata.lastAiPromptJson) ? (
        <Section title="AI draft generation">
          <p className="mb-2 text-xs" style={{ color: "var(--warm-gray)" }}>
            Recipe provider:{" "}
            <strong>{activeProvider?.label ?? "none configured"}</strong>
            {activeProvider ? ` — ${activeProvider.description}` : ""}
            {" · Image generation: "}
            <strong>{isImageGenerationConfigured() ? "connected" : "not connected"}</strong>
          </p>
          {aiGenerationMessage ? (
            <p
              className="mb-2 text-sm"
              style={{
                color: dishSupported ? "var(--deep-charcoal)" : "var(--warning)",
              }}
            >
              {aiGenerationMessage}
            </p>
          ) : null}
          <p className="mb-1 text-xs" style={{ color: "var(--warm-gray)" }}>
            Recipe QA stays Draft · Photo QA stays Pending · never auto-published
          </p>
          <pre
            className="max-h-48 overflow-auto rounded border p-2 text-[0.65rem]"
            style={{ borderColor: "var(--soft-beige)", color: "var(--deep-charcoal)" }}
          >
            {aiPromptPreview ?? metadata.lastAiPromptJson}
          </pre>
        </Section>
      ) : null}

      {warnings.length > 0 ? (
        <Section title="Content consistency warnings">
          <ul className="space-y-1 text-sm">
            {warnings.map((w) => (
              <li key={w.code + w.message} style={{ color: w.severity === "warn" ? "var(--warning)" : "var(--warm-gray)" }}>
                [{w.code}] {w.message}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border" style={{ borderColor: "var(--soft-beige)" }}>
            <AdminDishImage
              imageUrl={dish.imageUrl}
              alt={dish.title}
              preset="hero"
              layout="hero"
              focalPointX={metadata.focalPointX}
              focalPointY={metadata.focalPointY}
            />
          </div>

          <Section title="Responsive image review">
            <AdminImageCropPreviews
              imageUrl={dish.imageUrl}
              title={dish.title}
              focalPointX={metadata.focalPointX}
              focalPointY={metadata.focalPointY}
            />
            <MetaRow
              label="Focal point"
              value={
                metadata.focalPointX != null && metadata.focalPointY != null
                  ? `${metadata.focalPointX}%, ${metadata.focalPointY}%`
                  : "Default (catalog focal map)"
              }
            />
            {metadata.cropPreference ? (
              <MetaRow label="Crop preference" value={metadata.cropPreference} />
            ) : null}
          </Section>

          <Section title="Photo QA (independent)">            <MetaRow label="Asset path" value={<code className="break-all text-xs">{dish.imageUrl}</code>} />
            <MetaRow label="Integrity" value={resolveImageIntegrityLabel(dish)} />
            <MetaRow label="Registry" value={resolveCatalogPhotoStatus(dish)} />
            <div className="mt-3 flex flex-wrap gap-2">
              {PHOTO_QA_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={photoQaStatus === value}
                  onClick={() => setPhotoQa(value)}
                  className="rounded-lg border px-3 py-1.5 text-xs font-medium"
                  style={{
                    borderColor: photoQaStatus === value ? "var(--brand-primary)" : "var(--soft-beige)",
                    background: photoQaStatus === value ? "rgba(90, 64, 48, 0.1)" : "transparent",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            {metadata.imagePrompt ? (
              <MetaRow label="Image brief" value={metadata.imagePrompt} />
            ) : null}
            {metadata.platingNotes ? (
              <MetaRow label="Plating notes" value={metadata.platingNotes} />
            ) : null}
            {metadata.imageQualityGuidance ? (
              <MetaRow label="Image quality guidance" value={metadata.imageQualityGuidance} />
            ) : (
              <MetaRow label="Image quality guidance" value={DEFAULT_IMAGE_QUALITY_GUIDANCE} />
            )}
            {metadata.replacementReason ? (              <MetaRow label="Replacement reason" value={metadata.replacementReason} />
            ) : null}
          </Section>

          <Section title="Recipe QA (independent)">
            <div className="mb-3 flex flex-wrap gap-2">
              {RECIPE_QA_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={recipeQaEntry.status === value}
                  onClick={() => setRecipeQa(value)}
                  className="rounded-lg border px-3 py-1.5 text-xs font-medium"
                  style={{
                    borderColor:
                      recipeQaEntry.status === value
                        ? "var(--brand-primary)"
                        : "var(--soft-beige)",
                    background:
                      recipeQaEntry.status === value
                        ? "rgba(90, 64, 48, 0.1)"
                        : "transparent",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <label className="block text-xs">
              QA notes (recipe / content review)
              <textarea
                value={qaNotes}
                onChange={(e) => setQaNotes(e.target.value)}
                rows={4}
                className="mt-1 w-full rounded border px-2 py-1 text-sm"
              />
            </label>
            <button
              type="button"
              onClick={saveQaNotes}
              className="mt-2 rounded border px-3 py-1 text-xs"
              style={{ borderColor: "var(--soft-beige)" }}
            >
              Save notes
            </button>
            {culturalNote ? (
              <p className="mt-3 text-xs italic" style={{ color: "var(--warm-gray)" }}>
                Cultural review: {culturalNote}
              </p>
            ) : null}
            {metadata.culturalAuthenticityNotes ? (
              <MetaRow
                label="Authenticity notes"
                value={metadata.culturalAuthenticityNotes}
              />
            ) : null}
            {naturalYield?.scalingNote ? (
              <MetaRow label="Scaling note review" value={naturalYield.scalingNote} />
            ) : null}
            <p className="mt-2 text-[0.7rem]" style={{ color: "var(--warm-gray)" }}>              Photo and Recipe QA are independent — e.g. Photo Approved + Recipe Needs
              correction is valid.
            </p>
          </Section>

          <Section title="Nutrition">
            <p className="text-sm" style={{ color: "var(--warm-gray)" }}>
              Not verified / Not available
            </p>
            <div className="mt-2 grid grid-cols-3 gap-2 text-xs" style={{ color: "var(--warm-gray)" }}>
              {["calories", "protein", "carbs", "fat", "fiber", "salt"].map((field) => (
                <div key={field} className="rounded border px-2 py-1" style={{ borderColor: "var(--soft-beige)" }}>
                  {field}: —
                </div>
              ))}
            </div>
          </Section>
        </div>

        <div className="space-y-4">
          <Section title="Identity">
            <MetaRow label="recipeId" value={<code>{dish.id}</code>} />
            <MetaRow label="Source" value={isDraft ? "Draft (studio)" : "Canonical + studio overlay"} />
            <MetaRow label="Title" value={dish.title} />
            {mealRole ? (
              <MetaRow
                label="Meal role"
                value={
                  <span>
                    {mealRoleShortLabel(mealRole, "en")}
                    <span className="ml-2" dir="rtl" style={{ color: "var(--warm-gray)" }}>
                      {mealRoleShortLabel(mealRole, "ar")}
                    </span>
                    {!explicitRole.defaultRole ? (
                      <span className="ml-2 text-xs" style={{ color: "var(--warm-gray)" }}>
                        (derived — set explicitly)
                      </span>
                    ) : null}
                  </span>
                }
              />
            ) : null}
            <MetaRow label="Cuisine" value={dish.cuisineFamilyId} />
            {metadata.regionSubcuisine ?? draftRecord?.regionSubcuisine ? (
              <MetaRow
                label="Region / subcuisine"
                value={metadata.regionSubcuisine ?? draftRecord?.regionSubcuisine ?? "—"}
              />
            ) : null}
            {metadata.creationNote ?? draftRecord?.creationNote ? (
              <MetaRow
                label="Creation note"
                value={metadata.creationNote ?? draftRecord?.creationNote ?? "—"}
              />
            ) : null}
            <MetaRow label="Natural yield" value={formatNaturalYield()} />
            <MetaRow label="Legacy servings field" value={String(dish.servings)} />            <MetaRow label="Difficulty" value={dish.difficulty} />
            <MetaRow label="Prep" value={`${dish.prepMinutes} min`} />            <MetaRow label="Meal slot" value={dish.mealSlotRole} />
            <MetaRow label="Meal types" value={dish.mealTypes.join(", ")} />
          </Section>

          <Section title="Catalog metadata">
            <MetaRow label="Meal intents" value={dish.mealIntents.join(", ")} />
            <MetaRow label="Budget tier" value={dish.budgetTier} />
            <MetaRow label="Protein" value={dish.proteinCategory} />
            <MetaRow label="Dietary tags" value={dish.dietaryTags.join(", ")} />
            <MetaRow label="Allergens" value={dish.allergens.join(", ") || "None"} />
            <MetaRow label="May contain" value={dish.mayContain.join(", ") || "None"} />
            <MetaRow label="Allergen declared" value={dish.allergenDeclared ? "Yes" : "No"} />
          </Section>

          <Section title="Pantry roles">
            <ul className="space-y-1 text-sm">
              {dish.pantryIngredients.map((item) => (
                <li key={item.canonicalId}>
                  <code>{item.canonicalId}</code> — {item.role}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Companions">
            {companions.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--warm-gray)" }}>
                No curated companions.
              </p>
            ) : (
              <ul className="space-y-1 text-sm">
                {companions.map(
                  (c) =>
                    c ? (
                      <li key={c.id}>
                        <button
                          type="button"
                          onClick={() => onOpenRecipe(c.id)}
                          className="underline"
                          style={{ color: "var(--brand-primary)" }}
                        >
                          {c.title}
                        </button>{" "}
                        <code className="text-xs">({c.id})</code>
                      </li>
                    ) : null,
                )}
              </ul>
            )}
          </Section>

          {LOCALES.map((locale) => {
            const content = dish.content[locale];
            // Arabic is RTL: right-align and set direction on the AR content
            // block only, so EN/DE/TR layouts are untouched.
            const isRtl = locale === "ar";
            const rtlDir = isRtl ? "rtl" : undefined;
            return (
              <Section key={locale} title={`Content · ${locale.toUpperCase()}`}>
                <p
                  className={`mb-2 text-sm italic ${isRtl ? "text-right" : ""}`}
                  dir={rtlDir}
                  style={{ color: "var(--warm-gray)" }}
                >
                  {content.reason || "—"}
                </p>
                <ul
                  className={`mb-2 space-y-1 text-sm ${isRtl ? "text-right" : ""}`}
                  dir={rtlDir}
                >
                  {content.ingredients.map((ing) => (
                    <li key={ing.id}>
                      {ing.name}
                      {ing.detail ? ` — ${ing.detail}` : ""}
                    </li>
                  ))}
                </ul>
                <ol
                  className={`list-decimal space-y-1 text-sm ${isRtl ? "pr-5 text-right" : "pl-5"}`}
                  dir={rtlDir}
                >
                  {content.steps.map((step) => (
                    <li key={step.order}>{step.instruction}</li>
                  ))}
                </ol>
              </Section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
