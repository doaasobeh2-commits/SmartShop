import { loadRecipeQaStore } from "./recipeQaReview";
import { buildAiGenerationPromptPayload } from "./recipeAiGeneration";
import { seedRecipeQaFromKnownFindings } from "./recipeStudioKnownFindings";
import { ensureArabBatch1StudioDrafts } from "./arabBatch1StudioSeed";
import { ensureArabBatch2Group1StudioDrafts } from "./arabBatch2Group1StudioSeed";
import { ensureArabBatch2Group2StudioDrafts } from "./arabBatch2Group2StudioSeed";
import { DEFAULT_IMAGE_QUALITY_GUIDANCE } from "../components/responsiveDishImage";
import {
  DEFAULT_NUTRITION_PLACEHOLDER,
  RECIPE_STUDIO_STORAGE_KEY,
  STUDIO_STORAGE_VERSION,
  type DraftCreationInput,
  type DraftRecipeStore,
  type RecipeOverrideStore,
  type RecipeStudioPersistedState,
  type StudioMetadataStore,
  type StudioRecipeMetadata,
} from "./recipeStudioTypes";

export function emptyStudioState(): RecipeStudioPersistedState {
  // Seed curated Batch 1 + Batch 2 Group 1 + Group 2 review drafts.
  // Consumer catalog is untouched — these ids never enter DISH_CATALOG.
  return ensureArabBatch2Group2StudioDrafts(
    ensureArabBatch2Group1StudioDrafts(
      ensureArabBatch1StudioDrafts({
        version: STUDIO_STORAGE_VERSION,
        recipeQa: seedRecipeQaFromKnownFindings({}),
        overrides: {},
        drafts: {},
        metadata: {},
      }),
    ),
  );
}

function normalizeStudioState(
  parsed: Partial<RecipeStudioPersistedState> & { version?: number },
): RecipeStudioPersistedState {
  return ensureArabBatch2Group2StudioDrafts(
    ensureArabBatch2Group1StudioDrafts(
      ensureArabBatch1StudioDrafts({
        version: STUDIO_STORAGE_VERSION,
        recipeQa: seedRecipeQaFromKnownFindings(
          loadRecipeQaStore(JSON.stringify(parsed.recipeQa ?? {})),
        ),
        overrides: (parsed.overrides ?? {}) as RecipeOverrideStore,
        drafts: (parsed.drafts ?? {}) as DraftRecipeStore,
        metadata: (parsed.metadata ?? {}) as StudioMetadataStore,
      }),
    ),
  );
}

export function loadStudioState(raw?: string | null): RecipeStudioPersistedState {
  if (!raw) return emptyStudioState();
  try {
    const parsed = JSON.parse(raw) as Partial<RecipeStudioPersistedState> & {
      version?: number;
    };
    if (!parsed.version || parsed.version < 2) {
      return emptyStudioState();
    }
    return normalizeStudioState(parsed);
  } catch {
    return emptyStudioState();
  }
}

export function readStudioStateFromBrowser(): RecipeStudioPersistedState {
  if (typeof localStorage === "undefined") return emptyStudioState();
  return loadStudioState(localStorage.getItem(RECIPE_STUDIO_STORAGE_KEY));
}

export function writeStudioStateToBrowser(state: RecipeStudioPersistedState): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(RECIPE_STUDIO_STORAGE_KEY, JSON.stringify(state));
}

export function getStudioMetadata(
  store: StudioMetadataStore,
  recipeId: string,
): StudioRecipeMetadata {
  return store[recipeId] ?? { nutrition: DEFAULT_NUTRITION_PLACEHOLDER };
}

export function buildStudioMetadataForNewDraft(
  input: DraftCreationInput,
): StudioRecipeMetadata {
  const meta: StudioRecipeMetadata = {
    nutrition: DEFAULT_NUTRITION_PLACEHOLDER,
    regionSubcuisine: input.regionSubcuisine,
    creationNote: input.adminNote,
    imageQualityGuidance: DEFAULT_IMAGE_QUALITY_GUIDANCE,
    naturalYield: {
      servingLabel: "Set natural yield after AI generation or manual edit",
    },
  };
  const prompt = buildAiGenerationPromptPayload({
    dishName: input.dishName,
    cuisineFamilyId: input.cuisineFamilyId,
    regionSubcuisine: input.regionSubcuisine,
    adminNote: input.adminNote,
    metadata: meta,
  });
  meta.lastAiPromptJson = JSON.stringify(prompt, null, 2);
  return meta;
}

export function generateDraftRecipeId(existingIds: Set<string>): string {
  let attempt = 0;
  while (attempt < 1000) {
    const id = `draft-${Date.now().toString(36)}${attempt > 0 ? `-${attempt}` : ""}`;
    if (!existingIds.has(id)) return id;
    attempt += 1;
  }
  return `draft-${Math.random().toString(36).slice(2, 10)}`;
}

export { RECIPE_STUDIO_STORAGE_KEY, STUDIO_STORAGE_VERSION };
