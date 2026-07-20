import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { FlowScreen } from "@recipe-ai/core/types";
import { getDishById, listAllDishes } from "../data/catalog/dishes";
import {
  attemptAiDraftGeneration,
  buildAiGenerationPromptPayload,
  isAiGenerationConfigured,
} from "./recipeAiGeneration";
import { defaultPhotoReviewStatus, savePhotoReviewToStore } from "./recipePhotoReview";
import { getRecipeQaEntry, saveRecipeQaToStore } from "./recipeQaReview";
import { draftIdsMustNotResolveViaConsumerGetDishById } from "./consumerIsolation";
import { listStudioRecipeViews } from "./recipeStudioMerge";
import {
  buildStudioMetadataForNewDraft,
  emptyStudioState,
  loadStudioState,
  STUDIO_STORAGE_VERSION,
} from "./recipeStudioStorage";
import {
  createDraftFromCreationInput,
  type RecipeStudioPersistedState,
} from "./recipeStudioTypes";

const ALL_FLOW_SCREENS: FlowScreen[] = [
  "language-selection",
  "welcome",
  "auth",
  "household-members",
  "food-preferences",
  "cuisine-preferences",
  "weekly-plan-opt-in",
  "weekly-plan-intents",
  "tonight",
  "recipe-preview",
  "cook-mode",
  "weekly-plan",
  "feedback",
  "cook-with-what-i-have",
];

describe("Recipe Studio Phase C", () => {
  it("creates draft from minimal dish name + cuisine input", () => {
    const draft = createDraftFromCreationInput("draft-baba", {
      dishName: "Baba Ghanouj",
      cuisineFamilyId: "arab",
      regionSubcuisine: "Levantine",
      adminNote: "Side/appetizer yield",
    });
    assert.equal(draft.title, "Baba Ghanouj");
    assert.equal(draft.cuisineFamilyId, "arab");
    assert.equal(draft.regionSubcuisine, "Levantine");
    assert.equal(draft.creationNote, "Side/appetizer yield");
    assert.deepEqual(draft.ingredients, []);
  });

  it("persists natural yield and scaling note in studio metadata", () => {
    const meta = buildStudioMetadataForNewDraft({
      dishName: "Tabbouleh",
      cuisineFamilyId: "arab",
    });
    const studio: RecipeStudioPersistedState = {
      ...emptyStudioState(),
      metadata: {
        "draft-tab": {
          ...meta,
          naturalYield: {
            baseServingsMin: 3,
            baseServingsMax: 4,
            servingLabel: "3–4 people as a side",
            scalingNote:
              "Increase parsley/tomato first, then rebalance bulgur/lemon/oil.",
          },
          focalPointX: 50,
          focalPointY: 40,
        },
      },
      drafts: {
        "draft-tab": createDraftFromCreationInput("draft-tab", {
          dishName: "Tabbouleh",
          cuisineFamilyId: "arab",
        }),
      },
    };
    const yieldMeta = studio.metadata["draft-tab"]?.naturalYield;
    assert.equal(yieldMeta?.baseServingsMin, 3);
    assert.equal(yieldMeta?.baseServingsMax, 4);
    assert.ok(yieldMeta?.scalingNote?.includes("parsley"));
    assert.equal(studio.metadata["draft-tab"]?.focalPointX, 50);
  });

  it("a recipe provider is configured but unsupported dishes do not fake content", () => {
    assert.equal(isAiGenerationConfigured(), true);
    // Uses a dish name that is intentionally NOT in the curated library so the
    // provider must report unsupported rather than fabricate content.
    const result = attemptAiDraftGeneration({
      dishName: "Unlisted Mystery Dish",
      cuisineFamilyId: "arab",
      regionSubcuisine: "Palestinian",
      metadata: buildStudioMetadataForNewDraft({
        dishName: "Unlisted Mystery Dish",
        cuisineFamilyId: "arab",
        regionSubcuisine: "Palestinian",
      }),
    });
    assert.equal(result.status, "not_configured");
    if (result.status === "not_configured") {
      assert.ok(result.message.toLowerCase().includes("no curated recipe"));
      assert.equal(result.prompt.dishName, "Unlisted Mystery Dish");
      assert.ok(result.prompt.imageQualityGuidance.length > 20);
      assert.equal(result.prompt.localizationTargets.length, 4);
    }
  });

  it("prompt payload includes yield, scaling, and photo brief requirements", () => {
    const prompt = buildAiGenerationPromptPayload({
      dishName: "Lentil soup",
      cuisineFamilyId: "arab",
      metadata: {
        nutrition: { verified: false },
        naturalYield: {
          servingLabel: "about 4 bowls",
          scalingNote: "Thin with stock gradually; adjust lemon/salt by taste.",
        },
        imagePrompt: "Rustic bowl, visible lentils and herbs",
        culturalAuthenticityNotes: "Levantine home-style",
      },
    });
    assert.equal(prompt.naturalYield?.servingLabel, "about 4 bowls");
    assert.ok(prompt.scalingNote?.includes("stock"));
    assert.equal(prompt.photoBriefRequirements, "Rustic bowl, visible lentils and herbs");
    assert.equal(prompt.authenticityRequirements, "Levantine home-style");
  });

  it("Generate Draft with AI keeps Recipe QA Draft and Photo QA Pending", () => {
    const draftId = "draft-ai-1";
    const studio: RecipeStudioPersistedState = {
      ...emptyStudioState(),
      drafts: {
        [draftId]: createDraftFromCreationInput(draftId, {
          dishName: "Kabsa",
          cuisineFamilyId: "arab",
        }),
      },
      recipeQa: saveRecipeQaToStore({}, draftId, { status: "draft" }),
      metadata: {
        [draftId]: buildStudioMetadataForNewDraft({
          dishName: "Kabsa",
          cuisineFamilyId: "arab",
        }),
      },
    };
    const photo = savePhotoReviewToStore({}, draftId, defaultPhotoReviewStatus());
    attemptAiDraftGeneration({
      dishName: "Kabsa",
      cuisineFamilyId: "arab",
      metadata: studio.metadata[draftId],
    });
    const views = listStudioRecipeViews(
      studio.overrides,
      studio.drafts,
      studio.recipeQa,
      photo,
    );
    const view = views.find((v) => v.id === draftId);
    assert.equal(view?.recipeQaStatus, "draft");
    assert.equal(view?.photoQaStatus, "pending");
    assert.ok(draftIdsMustNotResolveViaConsumerGetDishById(studio.drafts));
    assert.equal(getDishById(draftId), undefined);
  });

  it("loads v2 storage and migrates to current studio version", () => {
    const raw = JSON.stringify({
      version: 2,
      recipeQa: {},
      overrides: {},
      drafts: {},
      metadata: {},
    });
    const loaded = loadStudioState(raw);
    assert.equal(loaded.version, STUDIO_STORAGE_VERSION);
    assert.equal(STUDIO_STORAGE_VERSION, 3);
  });

  it("consumer catalog remains 43 recipes after Phase C studio additions", () => {
    const studio: RecipeStudioPersistedState = {
      ...emptyStudioState(),
      drafts: {
        "draft-c1": createDraftFromCreationInput("draft-c1", {
          dishName: "Test Dish",
          cuisineFamilyId: "turkish",
        }),
      },
    };
    assert.equal(listAllDishes().length, 43);
    const views = listStudioRecipeViews(studio.overrides, studio.drafts, studio.recipeQa, {});
    assert.equal(views.length, 44);
    assert.equal(getRecipeQaEntry(studio.recipeQa, "draft-c1", { isDraft: true, isCanonical: false }).status, "draft");
  });

  it("consumer FlowScreen has no admin or studio route exposure", () => {
    for (const screen of ALL_FLOW_SCREENS) {
      assert.ok(!screen.includes("admin"));
      assert.ok(!screen.includes("studio"));
      assert.ok(!screen.includes("recipe-studio"));
    }
  });
});
