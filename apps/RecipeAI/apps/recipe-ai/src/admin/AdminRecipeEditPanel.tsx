import { useState } from "react";
import type { CuisineFamilyId } from "@recipe-ai/core/types";
import type {
  CatalogAllergen,
  DietaryTag,
  DishDifficulty,
  MealIntentTag,
  MealSlotRole,
  MealType,
} from "../data/catalog/types";
import type {
  CropPreference,
  DefaultMealRole,
  DraftRecipeRecord,
  NaturalYieldModel,
  RecipeContentOverride,
  StudioEditableIngredient,
  StudioLocaleCopy,
  StudioRecipeMetadata,
} from "./recipeStudioTypes";
import { deriveMealRoleFromDish, type MealRoleInput } from "./mealRole";
import {
  canonicalIngredientsToEditable,
  localeCopyFromDish,
} from "./recipeStudioMerge";
import type { DishCatalogEntry } from "../data/catalog/types";
import { DEFAULT_IMAGE_QUALITY_GUIDANCE } from "../components/responsiveDishImage";

export type RecipeEditSavePayload = {
  override?: RecipeContentOverride;
  draft?: DraftRecipeRecord;
  metadata: StudioRecipeMetadata;
};

type AdminRecipeEditPanelProps = {
  dish: DishCatalogEntry;
  isDraft: boolean;
  draftRecord?: DraftRecipeRecord;
  metadata: StudioRecipeMetadata;
  mealRoleInitial?: MealRoleInput;
  onSave: (payload: RecipeEditSavePayload) => void;
  onCancel: () => void;
};

function stepsToText(steps: string[]): string {
  return steps.join("\n");
}

function textToSteps(text: string): string[] {
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function AdminRecipeEditPanel({
  dish,
  isDraft,
  draftRecord,
  metadata,
  mealRoleInitial,
  onSave,
  onCancel,
}: AdminRecipeEditPanelProps) {
  const initialCopy = isDraft
    ? draftRecord!.localeCopy.en
    : localeCopyFromDish(dish).en;
  const initialIngredients = isDraft
    ? draftRecord!.ingredients
    : canonicalIngredientsToEditable(dish);

  const initialYield: NaturalYieldModel =
    metadata.naturalYield ?? draftRecord?.naturalYield ?? {};
  const roleFallback = deriveMealRoleFromDish(dish);

  const [title, setTitle] = useState(dish.title);
  const [defaultRole, setDefaultRole] = useState<DefaultMealRole>(
    mealRoleInitial?.defaultRole ?? roleFallback.defaultRole,
  );
  const [canServeAsMain, setCanServeAsMain] = useState<boolean>(
    mealRoleInitial?.canServeAsMain ?? roleFallback.canServeAsMain,
  );
  const [prepMinutes, setPrepMinutes] = useState(dish.prepMinutes);
  const [servings, setServings] = useState(dish.servings);
  const [difficulty, setDifficulty] = useState<DishDifficulty>(dish.difficulty);
  const [cuisineFamilyId, setCuisineFamilyId] = useState<CuisineFamilyId>(
    dish.cuisineFamilyId,
  );
  const [mealTypes, setMealTypes] = useState(dish.mealTypes.join(", "));
  const [mealSlotRole, setMealSlotRole] = useState(dish.mealSlotRole);
  const [mealIntents, setMealIntents] = useState(dish.mealIntents.join(", "));
  const [allergens, setAllergens] = useState(dish.allergens.join(", "));
  const [dietaryTags, setDietaryTags] = useState(dish.dietaryTags.join(", "));
  const [ingredientTokens, setIngredientTokens] = useState(
    dish.ingredientTokens.join(", "),
  );
  const [reason, setReason] = useState(initialCopy.reason);
  const [stepsText, setStepsText] = useState(stepsToText(initialCopy.steps));
  const [storageTip, setStorageTip] = useState(initialCopy.storageTip);
  const [ingredientsJson, setIngredientsJson] = useState(
    JSON.stringify(initialIngredients, null, 2),
  );
  const [imagePrompt, setImagePrompt] = useState(metadata.imagePrompt ?? "");
  const [platingNotes, setPlatingNotes] = useState(metadata.platingNotes ?? "");
  const [culturalNotes, setCulturalNotes] = useState(
    metadata.culturalAuthenticityNotes ?? "",
  );
  const [servingLabel, setServingLabel] = useState(initialYield.servingLabel ?? "");
  const [baseServingsMin, setBaseServingsMin] = useState(
    initialYield.baseServingsMin != null ? String(initialYield.baseServingsMin) : "",
  );
  const [baseServingsMax, setBaseServingsMax] = useState(
    initialYield.baseServingsMax != null ? String(initialYield.baseServingsMax) : "",
  );
  const [scalingNote, setScalingNote] = useState(initialYield.scalingNote ?? "");
  const [focalPointX, setFocalPointX] = useState(
    metadata.focalPointX != null ? String(metadata.focalPointX) : "",
  );
  const [focalPointY, setFocalPointY] = useState(
    metadata.focalPointY != null ? String(metadata.focalPointY) : "",
  );
  const [cropPreference, setCropPreference] = useState<CropPreference | "">(
    metadata.cropPreference ?? "",
  );
  const [imageQualityGuidance, setImageQualityGuidance] = useState(
    metadata.imageQualityGuidance ?? DEFAULT_IMAGE_QUALITY_GUIDANCE,
  );
  const [parseError, setParseError] = useState<string | null>(null);

  const handleSave = () => {
    let ingredients: StudioEditableIngredient[];
    try {
      ingredients = JSON.parse(ingredientsJson) as StudioEditableIngredient[];
      if (!Array.isArray(ingredients)) throw new Error("Ingredients must be an array");
      setParseError(null);
    } catch (e) {
      setParseError(e instanceof Error ? e.message : "Invalid ingredients JSON");
      return;
    }

    const localeEn: StudioLocaleCopy = {
      ...initialCopy,
      reason,
      storageTip,
      steps: textToSteps(stepsText),
    };

    const parsedMealTypes = mealTypes
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean) as MealType[];
    const parsedMealIntents = mealIntents
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean) as MealIntentTag[];
    const parsedAllergens = allergens
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean) as CatalogAllergen[];
    const parsedDietary = dietaryTags
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean) as DietaryTag[];
    const parsedTokens = ingredientTokens
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    const naturalYield: NaturalYieldModel = {
      servingLabel: servingLabel.trim() || undefined,
      baseServingsMin: baseServingsMin.trim()
        ? Number(baseServingsMin)
        : undefined,
      baseServingsMax: baseServingsMax.trim()
        ? Number(baseServingsMax)
        : undefined,
      scalingNote: scalingNote.trim() || undefined,
    };

    // Normalize the redundant combination: a main dish is already a main.
    const normalizedCanServeAsMain = defaultRole === "main" ? false : canServeAsMain;

    const nextMetadata: StudioRecipeMetadata = {
      ...metadata,
      imagePrompt,
      platingNotes,
      culturalAuthenticityNotes: culturalNotes,
      naturalYield,
      focalPointX: focalPointX.trim() ? Number(focalPointX) : undefined,
      focalPointY: focalPointY.trim() ? Number(focalPointY) : undefined,
      cropPreference: cropPreference || undefined,
      imageQualityGuidance: imageQualityGuidance.trim() || undefined,
    };

    if (isDraft && draftRecord) {
      const nextDraft: DraftRecipeRecord = {
        ...draftRecord,
        title,
        prepMinutes,
        servings,
        difficulty,
        cuisineFamilyId,
        cuisineFolder:
          cuisineFamilyId === "central_european"
            ? "central-european"
            : cuisineFamilyId,
        mealTypes: parsedMealTypes.length ? parsedMealTypes : ["main"],
        mealSlotRole,
        mealIntents: parsedMealIntents.length
          ? parsedMealIntents
          : ["family_friendly"],
        allergens: parsedAllergens,
        dietaryTags: parsedDietary,
        ingredientTokens: parsedTokens,
        ingredients,
        naturalYield,
        defaultRole,
        canServeAsMain: normalizedCanServeAsMain,
        localeCopy: {
          ...draftRecord.localeCopy,
          en: localeEn,
        },
        updatedAt: new Date().toISOString(),
      };
      onSave({ draft: nextDraft, metadata: nextMetadata });
      return;
    }

    const override: RecipeContentOverride = {
      title,
      prepMinutes,
      servings,
      difficulty,
      cuisineFamilyId,
      mealTypes: parsedMealTypes,
      mealSlotRole,
      mealIntents: parsedMealIntents,
      allergens: parsedAllergens,
      dietaryTags: parsedDietary,
      ingredientTokens: parsedTokens,
      ingredients,
      naturalYield,
      defaultRole,
      canServeAsMain: normalizedCanServeAsMain,
      localeCopy: { en: localeEn },
      updatedAt: new Date().toISOString(),
    };
    onSave({ override, metadata: nextMetadata });
  };

  return (
    <div
      className="space-y-4 rounded-xl border p-4"
      style={{
        borderColor: "var(--accent)",
        background: "rgba(196, 101, 46, 0.04)",
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold" style={{ color: "var(--brand-primary)" }}>
          Edit mode — studio-only until promoted to canonical catalog files
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border px-3 py-1.5 text-xs"
            style={{ borderColor: "var(--soft-beige)" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
            style={{ background: "var(--accent)" }}
          >
            Save studio changes
          </button>
        </div>
      </div>

      <p className="text-xs" style={{ color: "var(--warning)" }}>
        Safety metadata changes (allergens, dietary tags) require human review before
        consumer promotion. Edits persist in browser localStorage only.
      </p>

      {parseError ? (
        <p className="text-xs" style={{ color: "var(--error)" }}>
          {parseError}
        </p>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-xs">
          Title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded border px-2 py-1 text-sm"
          />
        </label>
        <label className="text-xs">
          Cuisine
          <input
            value={cuisineFamilyId}
            onChange={(e) => setCuisineFamilyId(e.target.value as CuisineFamilyId)}
            className="mt-1 w-full rounded border px-2 py-1 text-sm"
          />
        </label>
        <label className="text-xs">
          Prep minutes
          <input
            type="number"
            value={prepMinutes}
            onChange={(e) => setPrepMinutes(Number(e.target.value))}
            className="mt-1 w-full rounded border px-2 py-1 text-sm"
          />
        </label>
        <label className="text-xs">
          Servings
          <input
            type="number"
            value={servings}
            onChange={(e) => setServings(Number(e.target.value))}
            className="mt-1 w-full rounded border px-2 py-1 text-sm"
          />
        </label>
        <label className="text-xs">
          Difficulty
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as DishDifficulty)}
            className="mt-1 w-full rounded border px-2 py-1 text-sm"
          >
            <option value="easy">easy</option>
            <option value="medium">medium</option>
          </select>
        </label>
        <label className="text-xs">
          Meal slot role
          <select
            value={mealSlotRole}
            onChange={(e) => setMealSlotRole(e.target.value as MealSlotRole)}
            className="mt-1 w-full rounded border px-2 py-1 text-sm"
          >
            <option value="dinner_complete">dinner_complete</option>
            <option value="side_component">side_component</option>
            <option value="light_meal">light_meal</option>
          </select>
        </label>
        <label className="text-xs md:col-span-2">
          Meal types (comma-separated)
          <input
            value={mealTypes}
            onChange={(e) => setMealTypes(e.target.value)}
            className="mt-1 w-full rounded border px-2 py-1 text-sm"
          />
        </label>
        <label className="text-xs md:col-span-2">
          Intent tags (comma-separated)
          <input
            value={mealIntents}
            onChange={(e) => setMealIntents(e.target.value)}
            className="mt-1 w-full rounded border px-2 py-1 text-sm"
          />
        </label>
        <label className="text-xs md:col-span-2">
          Ingredient tokens (comma-separated, pantry)
          <input
            value={ingredientTokens}
            onChange={(e) => setIngredientTokens(e.target.value)}
            className="mt-1 w-full rounded border px-2 py-1 text-sm"
          />
        </label>
        <label className="text-xs md:col-span-2">
          Allergens (comma-separated)
          <input
            value={allergens}
            onChange={(e) => setAllergens(e.target.value)}
            className="mt-1 w-full rounded border px-2 py-1 text-sm"
          />
        </label>
        <label className="text-xs md:col-span-2">
          Dietary tags (comma-separated)
          <input
            value={dietaryTags}
            onChange={(e) => setDietaryTags(e.target.value)}
            className="mt-1 w-full rounded border px-2 py-1 text-sm"
          />
        </label>
        <label className="text-xs md:col-span-2">
          EN description / reason
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded border px-2 py-1 text-sm"
          />
        </label>
        <label className="text-xs md:col-span-2">
          EN steps (one per line)
          <textarea
            value={stepsText}
            onChange={(e) => setStepsText(e.target.value)}
            rows={5}
            className="mt-1 w-full rounded border px-2 py-1 font-mono text-sm"
          />
        </label>
        <label className="text-xs md:col-span-2">
          Storage tip (EN)
          <input
            value={storageTip}
            onChange={(e) => setStorageTip(e.target.value)}
            className="mt-1 w-full rounded border px-2 py-1 text-sm"
          />
        </label>
        <label className="text-xs md:col-span-2">
          Ingredients JSON (all locales in one structure)
          <textarea
            value={ingredientsJson}
            onChange={(e) => setIngredientsJson(e.target.value)}
            rows={10}
            className="mt-1 w-full rounded border px-2 py-1 font-mono text-xs"
          />
        </label>
        <label className="text-xs">
          Default meal role
          <select
            value={defaultRole}
            onChange={(e) => setDefaultRole(e.target.value as DefaultMealRole)}
            className="mt-1 w-full rounded border px-2 py-1 text-sm"
          >
            <option value="main">Main dish</option>
            <option value="side">Side dish</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={defaultRole === "side" && canServeAsMain}
            disabled={defaultRole === "main"}
            onChange={(e) => setCanServeAsMain(e.target.checked)}
          />
          <span>
            Can also be served as a main
            {defaultRole === "main" ? " (n/a for mains)" : ""}
          </span>
        </label>
        <label className="text-xs md:col-span-2">
          Natural yield label (e.g. 3–4 people as a side)
          <input
            value={servingLabel}
            onChange={(e) => setServingLabel(e.target.value)}
            className="mt-1 w-full rounded border px-2 py-1 text-sm"
          />
        </label>
        <label className="text-xs">
          Base servings min
          <input
            type="number"
            min={1}
            value={baseServingsMin}
            onChange={(e) => setBaseServingsMin(e.target.value)}
            className="mt-1 w-full rounded border px-2 py-1 text-sm"
          />
        </label>
        <label className="text-xs">
          Base servings max
          <input
            type="number"
            min={1}
            value={baseServingsMax}
            onChange={(e) => setBaseServingsMax(e.target.value)}
            className="mt-1 w-full rounded border px-2 py-1 text-sm"
          />
        </label>
        <label className="text-xs md:col-span-2">
          Scaling note (informational — no consumer auto-recalc)
          <textarea
            value={scalingNote}
            onChange={(e) => setScalingNote(e.target.value)}
            rows={2}
            placeholder="Dish-specific guidance for scaling up or down"
            className="mt-1 w-full rounded border px-2 py-1 text-sm"
          />
        </label>
        <label className="text-xs md:col-span-2">
          Image prompt / brief (admin)
          <textarea
            value={imagePrompt}
            onChange={(e) => setImagePrompt(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded border px-2 py-1 text-sm"
          />
        </label>
        <label className="text-xs md:col-span-2">
          Plating / presentation notes
          <textarea
            value={platingNotes}
            onChange={(e) => setPlatingNotes(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded border px-2 py-1 text-sm"
          />
        </label>
        <label className="text-xs md:col-span-2">
          Image quality guidance (AI generation)
          <textarea
            value={imageQualityGuidance}
            onChange={(e) => setImageQualityGuidance(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded border px-2 py-1 text-sm"
          />
        </label>
        <label className="text-xs">
          Focal point X (0–100%)
          <input
            type="number"
            min={0}
            max={100}
            value={focalPointX}
            onChange={(e) => setFocalPointX(e.target.value)}
            className="mt-1 w-full rounded border px-2 py-1 text-sm"
          />
        </label>
        <label className="text-xs">
          Focal point Y (0–100%)
          <input
            type="number"
            min={0}
            max={100}
            value={focalPointY}
            onChange={(e) => setFocalPointY(e.target.value)}
            className="mt-1 w-full rounded border px-2 py-1 text-sm"
          />
        </label>
        <label className="text-xs md:col-span-2">
          Crop preference
          <select
            value={cropPreference}
            onChange={(e) =>
              setCropPreference(e.target.value as CropPreference | "")
            }
            className="mt-1 w-full rounded border px-2 py-1 text-sm"
          >
            <option value="">Default (focal point)</option>
            <option value="center">Center</option>
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
          </select>
        </label>
        <label className="text-xs md:col-span-2">
          Cultural authenticity notes
          <textarea
            value={culturalNotes}
            onChange={(e) => setCulturalNotes(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded border px-2 py-1 text-sm"
          />
        </label>
      </div>
    </div>
  );
}
