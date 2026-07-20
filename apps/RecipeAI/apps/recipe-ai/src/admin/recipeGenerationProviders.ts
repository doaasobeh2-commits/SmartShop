/**
 * Provider-adaptable recipe generation layer.
 *
 * Recipe Studio must not be hard-wired to a single AI vendor. Every generation
 * capability (recipe authoring/review/translation and image generation) is
 * expressed through a provider interface so we can later register, compare, or
 * switch providers (e.g. a live LLM, a hosted image model) without touching the
 * Studio UI. No paid external API or key is added here.
 */

import {
  findGeneratedRecipe,
  normalizeDishName,
  type GeneratedRecipe,
} from "./generatedRecipeLibrary";

export type GenerationCapability = "recipe" | "image";

export type RecipeGenerationRequest = {
  dishName: string;
  regionSubcuisine?: string;
};

export type RecipeGenerationOutcome =
  | { status: "generated"; providerId: string; recipe: GeneratedRecipe }
  | { status: "unsupported"; providerId: string; message: string }
  | { status: "unavailable"; providerId: string; message: string };

export type RevisionArea =
  | "recipe"
  | "image"
  | "yield"
  | "ingredients"
  | "locale_en"
  | "locale_de"
  | "locale_ar"
  | "locale_tr"
  | "authenticity";

export type RevisionInterpretation = {
  recognizedAreas: RevisionArea[];
  imageOnly: boolean;
  summary: string;
};

export interface RecipeGenerationProvider {
  id: string;
  label: string;
  /** Human-facing note about what this provider is (e.g. curated vs live LLM). */
  description: string;
  capabilities: GenerationCapability[];
  /** Whether the provider can currently run (keys present, model reachable…). */
  isConfigured(): boolean;
  supportsDish(dishName: string): boolean;
  generateRecipe(request: RecipeGenerationRequest): RecipeGenerationOutcome;
}

/**
 * Local, human-authored provider. Not a live LLM — it returns curated recipe
 * fixtures that were written and cross-checked for cultural authenticity. This
 * is a legitimate (non-faked) generation source used until a live provider is
 * connected. It only answers for dishes it actually has authored content for.
 */
export const localAuthoredRecipeProvider: RecipeGenerationProvider = {
  id: "local-authored",
  label: "Curated (local authored)",
  description:
    "Human-authored, culturally cross-checked recipe fixtures. Not a live LLM. Returns content only for dishes in the curated library; everything else is reported unsupported.",
  capabilities: ["recipe"],
  isConfigured() {
    return true;
  },
  supportsDish(dishName: string) {
    return findGeneratedRecipe(dishName) != null;
  },
  generateRecipe(request) {
    const recipe = findGeneratedRecipe(request.dishName);
    if (!recipe) {
      return {
        status: "unsupported",
        providerId: this.id,
        message: `No curated recipe matches "${request.dishName.trim() || "(unnamed draft)"}". Rename the draft to a supported dish (e.g. Baba Ghanouj) or connect a live AI provider.`,
      };
    }
    return { status: "generated", providerId: this.id, recipe };
  },
};

/**
 * Image generation is not wired to an in-app runtime provider in this task.
 * Prepared images (e.g. the Baba Ghanouj hero) are placed in assets out of band
 * and referenced by the curated recipe. This descriptor keeps the surface
 * provider-adaptable and reports honestly that no live image API is connected.
 */
export const imageGenerationProviderStatus = {
  id: "image-none",
  label: "Image generation (not connected)",
  description:
    "No live in-app image generation provider is connected. Prepared images may still ship with curated recipes; Photo QA always stays Pending until human review.",
  isConfigured(): boolean {
    return false;
  },
};

const RECIPE_PROVIDERS: RecipeGenerationProvider[] = [localAuthoredRecipeProvider];

export function listRecipeGenerationProviders(): RecipeGenerationProvider[] {
  return [...RECIPE_PROVIDERS];
}

/** First configured provider that can handle this dish, else first configured. */
export function getActiveRecipeProvider(
  dishName?: string,
): RecipeGenerationProvider | null {
  const configured = RECIPE_PROVIDERS.filter((p) => p.isConfigured());
  if (configured.length === 0) return null;
  if (dishName) {
    const match = configured.find((p) => p.supportsDish(dishName));
    if (match) return match;
  }
  return configured[0] ?? null;
}

export function isRecipeGenerationConfigured(): boolean {
  return RECIPE_PROVIDERS.some((p) => p.isConfigured());
}

export function isImageGenerationConfigured(): boolean {
  return imageGenerationProviderStatus.isConfigured();
}

export function canGenerateDish(dishName: string): boolean {
  return RECIPE_PROVIDERS.some(
    (p) => p.isConfigured() && p.supportsDish(dishName),
  );
}

const LOCALE_KEYWORDS: Array<{ area: RevisionArea; words: string[] }> = [
  { area: "locale_ar", words: ["arabic", "arab", "عربي", "بالعربية"] },
  { area: "locale_de", words: ["german", "deutsch"] },
  { area: "locale_tr", words: ["turkish", "türkçe", "turkce"] },
  { area: "locale_en", words: ["english"] },
];

/**
 * Lightweight natural-language revision interpreter. Recognizes which areas the
 * admin asked to change so revision can be scoped instead of regenerating
 * everything. Unrecognized feedback is preserved verbatim as a QA note.
 */
export function interpretRevisionInstruction(
  instruction: string,
): RevisionInterpretation {
  const text = normalizeDishName(instruction);
  const raw = instruction.toLowerCase();
  const areas = new Set<RevisionArea>();

  const mentionsImage = /\b(image|photo|picture|foto|bild|صورة|görsel|resim)\b/.test(
    raw,
  );
  if (mentionsImage) areas.add("image");

  for (const { area, words } of LOCALE_KEYWORDS) {
    if (words.some((w) => raw.includes(w) || text.includes(normalizeDishName(w)))) {
      areas.add(area);
    }
  }

  if (/(serving|servings|yield|portion|people|3.?4|scale)/.test(raw)) {
    areas.add("yield");
  }
  if (
    /(tahini|lemon|garlic|salt|eggplant|ingredient|quantit|amount|reduce|increase|more|less)/.test(
      raw,
    )
  ) {
    areas.add("ingredients");
  }
  if (/(authentic|cultural|traditional|levantine|presentation)/.test(raw)) {
    areas.add("authenticity");
  }

  const imageOnly = areas.size === 1 && areas.has("image");

  if (areas.size === 0) areas.add("recipe");

  const summary = imageOnly
    ? "Requested image-only changes; recipe content preserved."
    : `Requested changes to: ${[...areas].join(", ")}. Unmentioned content preserved.`;

  return { recognizedAreas: [...areas], imageOnly, summary };
}
