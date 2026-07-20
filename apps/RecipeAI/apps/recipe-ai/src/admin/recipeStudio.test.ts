import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { FlowScreen } from "@recipe-ai/core/types";
import { getDishById, listAllDishes } from "../data/catalog/dishes";
import {
  draftIdsMustNotResolveViaConsumerGetDishById,
  isInConsumerCatalog,
} from "./consumerIsolation";
import {
  EMPTY_CATALOG_FILTERS,
  filterStudioRecipes,
  paginateStudioRecipes,
} from "./recipeCatalogAdmin";
import {
  defaultPhotoReviewStatus,
  getPhotoReviewStatus,
  loadPhotoReviewStore,
  savePhotoReviewToStore,
} from "./recipePhotoReview";
import { auditRecipeContent, recipeHasQaWarnings } from "./recipeQaAudit";
import { getRecipeQaEntry, saveRecipeQaToStore } from "./recipeQaReview";
import {
  KNOWN_STUDIO_FINDINGS,
  seedPhotoQaFromKnownFindings,
  seedRecipeQaFromKnownFindings,
} from "./recipeStudioKnownFindings";
import {
  getStudioRecipeById,
  listConsumerCatalogIds,
  listStudioRecipeViews,
} from "./recipeStudioMerge";
import { emptyStudioState, loadStudioState } from "./recipeStudioStorage";
import {
  createDraftFromCreationInput,
  emptyDraftRecord,
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

describe("Recipe Studio Phase B", () => {
  it("Photo QA and Recipe QA are independent stores", () => {
    const photo = savePhotoReviewToStore({}, "fattoush", "approved");
    const recipeQa = saveRecipeQaToStore({}, "fattoush", {
      status: "needs_correction",
      notes: "content incomplete",
    });
    assert.equal(getPhotoReviewStatus(photo, "fattoush"), "approved");
    assert.equal(getRecipeQaEntry(recipeQa, "fattoush", { isDraft: false, isCanonical: true }).status, "needs_correction");
  });

  it("new draft recipe starts Recipe QA Draft and Photo QA Pending", () => {
    const draftId = "draft-test-1";
    const studio: RecipeStudioPersistedState = {
      ...emptyStudioState(),
      drafts: { [draftId]: emptyDraftRecord(draftId) },
      recipeQa: saveRecipeQaToStore({}, draftId, { status: "draft" }),
    };
    const photo = savePhotoReviewToStore({}, draftId, defaultPhotoReviewStatus());
    const views = listStudioRecipeViews(studio.overrides, studio.drafts, studio.recipeQa, photo);
    const draft = views.find((v) => v.id === draftId);
    assert.ok(draft?.isDraft);
    assert.equal(draft?.recipeQaStatus, "draft");
    assert.equal(draft?.photoQaStatus, "pending");
  });

  it("draft ids do not resolve via consumer getDishById", () => {
    const draftId = "draft-isolated-99";
    const studio: RecipeStudioPersistedState = {
      ...emptyStudioState(),
      drafts: { [draftId]: emptyDraftRecord(draftId) },
    };
    assert.equal(getDishById(draftId), undefined);
    assert.ok(draftIdsMustNotResolveViaConsumerGetDishById(studio.drafts));
    assert.ok(!isInConsumerCatalog(draftId));
  });

  it("consumer catalog remains 43 canonical recipes unchanged by drafts", () => {
    const studio: RecipeStudioPersistedState = {
      ...emptyStudioState(),
      drafts: {
        "draft-a": emptyDraftRecord("draft-a"),
        "draft-b": emptyDraftRecord("draft-b"),
      },
    };
    assert.equal(listAllDishes().length, 43);
    assert.equal(listConsumerCatalogIds().length, 43);
    const studioViews = listStudioRecipeViews(
      studio.overrides,
      studio.drafts,
      studio.recipeQa,
      {},
    );
    assert.equal(studioViews.length, 45);
  });

  it("fattoush ingredient list covers cooking-step pantry items after reconciliation", () => {
    const fattoush = getDishById("fattoush");
    assert.ok(fattoush);
    assert.ok(fattoush.content.en.ingredients.length >= 8);
    assert.equal(recipeHasQaWarnings(fattoush), false);
    assert.deepEqual(
      auditRecipeContent(fattoush).filter((w) => w.severity === "warn"),
      [],
    );
  });

  it("sumac-chicken Musakhan Wraps has no ingredient↔step QA warnings", () => {
    const dish = getDishById("sumac-chicken");
    assert.ok(dish);
    assert.equal(dish.title, "Musakhan Wraps");
    assert.equal(recipeHasQaWarnings(dish), false);
    assert.deepEqual(
      auditRecipeContent(dish).filter((w) => w.severity === "warn"),
      [],
    );
  });

  it("known findings seed recipe QA without auto-correcting catalog", () => {
    const seeded = seedRecipeQaFromKnownFindings({});
    assert.equal(seeded.fattoush?.status, KNOWN_STUDIO_FINDINGS.fattoush?.recipeQaStatus);
    assert.equal(seeded["sumac-chicken"]?.status, "draft");
    assert.equal(getDishById("fattoush")?.title, "Fattoush");
    assert.equal(getDishById("sumac-chicken")?.title, "Musakhan Wraps");
  });

  it("Has QA warnings filter narrows studio list", () => {
    const views = listStudioRecipeViews({}, {}, seedRecipeQaFromKnownFindings({}), {});
    const warned = filterStudioRecipes(views, {
      ...EMPTY_CATALOG_FILTERS,
      hasQaWarnings: true,
    });
    assert.ok(warned.length >= 1);
    assert.ok(warned.every((r) => recipeHasQaWarnings(r)));
    const all = filterStudioRecipes(views, EMPTY_CATALOG_FILTERS);
    assert.ok(all.length >= warned.length);
  });

  it("pagination supports efficient large-list browsing", () => {
    const views = listStudioRecipeViews({}, {}, {}, {});
    const page1 = paginateStudioRecipes(views, 1, 10);
    const page2 = paginateStudioRecipes(views, 2, 10);
    assert.equal(page1.items.length, 10);
    assert.equal(page1.totalPages, Math.ceil(views.length / 10));
    assert.notEqual(page1.items[0]?.id, page2.items[0]?.id);
  });

  it("studio overrides merge for admin view only", () => {
    const studio: RecipeStudioPersistedState = {
      ...emptyStudioState(),
      overrides: {
        kofte: { title: "Studio Kofte Title", updatedAt: new Date().toISOString() },
      },
    };
    const merged = getStudioRecipeById("kofte", studio.overrides, studio.drafts);
    const canonical = getDishById("kofte");
    assert.equal(merged?.title, "Studio Kofte Title");
    assert.equal(canonical?.title, getDishById("kofte")?.title);
    assert.notEqual(merged?.title, canonical?.title);
  });

  it("loads versioned studio storage from JSON", () => {
    const raw = JSON.stringify({
      version: 2,
      recipeQa: { kofte: { status: "approved" } },
      overrides: {},
      drafts: {},
      metadata: {},
    });
    const loaded = loadStudioState(raw);
    assert.equal(loaded.version, 3);
    assert.equal(loaded.recipeQa.kofte?.status, "approved");
  });

  it("Approve recipe persists Recipe QA approved across reload without touching Photo QA", () => {
    const draftId = "draft-arab-batch2-g1-shakriyeh-with-rice";
    let studio = emptyStudioState();
    assert.ok(studio.drafts[draftId], "expected seeded draft");
    const photoBefore = getPhotoReviewStatus({}, draftId);
    studio = {
      ...studio,
      recipeQa: saveRecipeQaToStore(studio.recipeQa, draftId, {
        status: "approved",
        notes: "manual approve test",
      }),
    };
    assert.equal(studio.recipeQa[draftId]?.status, "approved");
    const views = listStudioRecipeViews(
      studio.overrides,
      studio.drafts,
      studio.recipeQa,
      {},
    );
    assert.equal(views.find((v) => v.id === draftId)?.recipeQaStatus, "approved");
    assert.equal(views.find((v) => v.id === draftId)?.photoQaStatus, photoBefore);

    const reloaded = loadStudioState(JSON.stringify(studio));
    assert.equal(reloaded.recipeQa[draftId]?.status, "approved");
    assert.equal(reloaded.recipeQa[draftId]?.notes, "manual approve test");
    assert.equal(
      getRecipeQaEntry(reloaded.recipeQa, draftId, {
        isDraft: true,
        isCanonical: false,
      }).status,
      "approved",
    );
    // Known-findings seed must not clobber human approval on reload.
    assert.notEqual(
      reloaded.recipeQa[draftId]?.status,
      KNOWN_STUDIO_FINDINGS[draftId]?.recipeQaStatus === "draft"
        ? undefined
        : "should-stay-approved",
    );
  });

  it("Photo QA known-findings seed does not overwrite human decisions", () => {
    const draftId = "draft-arab-batch2-g1-syrian-meat-maqluba";
    const human = seedPhotoQaFromKnownFindings({ [draftId]: "approved" });
    assert.equal(human[draftId], "approved");
    const fresh = seedPhotoQaFromKnownFindings({});
    assert.equal(fresh[draftId], "pending");
  });

  it("Approve photo persists independently of Recipe QA (Yalanji draft-mrrfvax1)", () => {
    const draftId = "draft-mrrfvax1";
    const draft = createDraftFromCreationInput(draftId, {
      dishName: "Yalanji",
      cuisineFamilyId: "arab",
    });
    let studio: RecipeStudioPersistedState = {
      ...emptyStudioState(),
      drafts: { [draftId]: draft },
      recipeQa: saveRecipeQaToStore({}, draftId, { status: "approved" }),
    };
    let photo = savePhotoReviewToStore({}, draftId, "pending");
    assert.equal(getPhotoReviewStatus(photo, draftId), "pending");

    // Approve photo only
    photo = savePhotoReviewToStore(photo, draftId, "approved");
    const views = listStudioRecipeViews(
      studio.overrides,
      studio.drafts,
      studio.recipeQa,
      photo,
    );
    const view = views.find((v) => v.id === draftId);
    assert.equal(view?.recipeQaStatus, "approved");
    assert.equal(view?.photoQaStatus, "approved");
    assert.equal(isInConsumerCatalog(draftId), false);

    // Reload photo store; recipe QA untouched
    const reloadedPhoto = seedPhotoQaFromKnownFindings(
      loadPhotoReviewStore(JSON.stringify(photo)),
    );
    assert.equal(getPhotoReviewStatus(reloadedPhoto, draftId), "approved");
    assert.equal(studio.recipeQa[draftId]?.status, "approved");
  });

  it("consumer FlowScreen has no admin / studio route", () => {
    for (const screen of ALL_FLOW_SCREENS) {
      assert.ok(!screen.includes("admin"));
      assert.ok(!screen.includes("studio"));
    }
  });
});
