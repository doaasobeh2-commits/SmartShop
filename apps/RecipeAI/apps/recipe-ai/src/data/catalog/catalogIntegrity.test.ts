import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import type { DayPlanIntent } from "@recipe-ai/core/types";
import { listAllDishes } from "./dishes";
import {
  auditCatalogImageRegistry,
  auditImageFiles,
  assertCatalogMetadataIntegrity,
  buildCoverageMatrix,
  findDuplicateImageGroups,
  resolvePublicAssetsRoot,
} from "./catalogIntegrity";
import {
  INSPECTED_CORRECT_RECIPE_IMAGE_IDS,
  NEEDS_ACCURATE_PHOTOGRAPHY_RECIPE_IDS,
  NEEDS_PHOTO_PLACEHOLDER_PATH,
} from "./imageAssets";
import {
  CURATED_COMPANIONS,
  isCompatibleCompanion,
} from "./decision/mealComposition";
import { applyHardSafety } from "./decision/safety";
import { scorePantryDish } from "./decision/pantry";
import { buildIntelligentWeekPlan } from "./decision/weekly";
import { resolveHouseholdCuisineProfile } from "./decision/householdCuisine";
import { dayIntentFit } from "./decision/dayIntent";
import { isVegetarianMainDish } from "./decision/householdCuisine";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicRoot = resolvePublicAssetsRoot(__dirname);

describe("Catalog integrity (A–L)", () => {
  const dishes = listAllDishes();
  const ids = dishes.map((d) => d.id);

  it("A — every recipe has a valid unique recipeId", () => {
    assert.equal(new Set(ids).size, ids.length);
    for (const id of ids) {
      assert.match(id, /^[a-z0-9-]+$/);
      assert.ok(id.length >= 3);
    }
  });

  it("B — registry counts balance: verified + placeholder = total", () => {
    const audit = auditCatalogImageRegistry();
    assert.equal(audit.totalRecipes, dishes.length);
    assert.equal(audit.missingFromImageLists.length, 0);
    assert.equal(audit.extraInImageLists.length, 0);
    assert.ok(audit.countsBalanced);
    assert.equal(
      audit.verifiedPhotoCount + audit.placeholderPhotoCount,
      audit.totalRecipes,
    );
    assert.equal(NEEDS_ACCURATE_PHOTOGRAPHY_RECIPE_IDS.length, 0);
    assert.equal(INSPECTED_CORRECT_RECIPE_IMAGE_IDS.length, 43);
    assert.equal(dishes.length, 43);
  });

  it("B2 — every imageUrl resolves to identity JPG path", () => {
    const verified = new Set<string>(INSPECTED_CORRECT_RECIPE_IMAGE_IDS);
    for (const dish of dishes) {
      assert.ok(verified.has(dish.id), dish.id);
      // Most recipes use `{id}.jpg`; sumac-chicken uses dedicated musakhan-wraps.jpg.
      if (dish.id === "sumac-chicken") {
        assert.equal(dish.imageUrl, "/assets/dishes/arab/musakhan-wraps.jpg");
      } else {
        assert.match(
          dish.imageUrl,
          new RegExp(`/assets/dishes/[^/]+/${dish.id}\\.jpg$`),
        );
      }
      assert.ok(!dish.imageUrl.includes(NEEDS_PHOTO_PLACEHOLDER_PATH), dish.id);
    }
  });

  it("C — no byte-identical JPG reused across different recipeIds", () => {
    const fileAudits = auditImageFiles(publicRoot);
    const dupes = findDuplicateImageGroups(fileAudits);
    assert.equal(
      dupes.length,
      0,
      `duplicate image bytes: ${dupes.map((g) => g.recipeIds.join("=")).join("; ")}`,
    );
  });

  it("D — dinner-complete mains have safety metadata", () => {
    for (const dish of dishes.filter((d) => d.mealSlotRole === "dinner_complete")) {
      assertCatalogMetadataIntegrity(dish);
      assert.ok(dish.allergenDeclared);
      assert.ok(Array.isArray(dish.allergens));
      assert.ok(Array.isArray(dish.mayContain));
      assert.ok(dish.pantryIngredients.length >= 1);
      assert.ok(dish.content.en.steps.length >= 2);
      assert.ok(dish.content.ar.steps.length >= 2);
    }
  });

  it("E — vegetarian_ok mains contain no meat classification", () => {
    for (const dish of dishes) {
      if (!dish.dietaryTags.includes("vegetarian_ok")) continue;
      assert.ok(!dish.dietaryTags.includes("contains_meat"), dish.id);
      assert.ok(!dish.dietaryTags.includes("contains_fish"), dish.id);
      assert.ok(isVegetarianMainDish(dish), dish.id);
    }
  });

  it("F — budgetTier exists consistently on all dishes", () => {
    for (const dish of dishes) {
      assert.ok(["low", "medium", "premium"].includes(dish.budgetTier), dish.id);
      if (dish.mealIntents.includes("budget")) {
        assert.ok(
          dish.budgetTier === "low" || dish.budgetTier === "medium",
          `${dish.id} claims budget intent`,
        );
      }
    }
  });

  it("G — primary-cuisine weekly majority remains achievable (Arab depth)", () => {
    const now = new Date(2026, 6, 14, 10);
    const built = buildIntelligentWeekPlan(
      {
        locale: "en",
        hostCuisineIds: ["arab"],
        allergies: [],
        householdProfile: resolveHouseholdCuisineProfile({
          primaryCuisine: "arab",
          preferredCuisines: [],
          favoriteCuisines: ["arab"],
        }),
      },
      {
        now,
        dayIntents: Array.from({ length: 7 }, () => "auto" as const),
        dayCuisineSources: Array.from({ length: 7 }, () => "primary" as const),
      },
    );
    const arabMains = dishes
      .filter(
        (d) =>
          d.cuisineFamilyId === "arab" && d.mealSlotRole === "dinner_complete",
      )
      .map((d) => d.id);
    const arabDays = built.plan.filter((d) =>
      arabMains.includes(d.recipeId),
    ).length;
    assert.ok(arabDays >= 4, `expected primary arab majority, got ${arabDays}/7`);
    assert.ok(new Set(built.plan.map((d) => d.recipeId)).size >= 3);
  });

  it("H — day intents still filter/rank correctly after catalog size", () => {
    const intents: DayPlanIntent[] = [
      "budget",
      "healthy",
      "light",
      "high_calorie",
      "special",
      "quick",
      "vegetarian",
    ];
    for (const intent of intents) {
      const pool = dishes.filter(
        (d) =>
          d.mealSlotRole === "dinner_complete" && dayIntentFit(d, intent) > 0,
      );
      assert.ok(pool.length >= 7, `${intent} pool too small: ${pool.length}`);
    }
  });

  it("J — pantry chicken+rice ranks kabsa; Musakhan Wraps needs more than chicken+rice", () => {
    const wraps = dishes.find((d) => d.id === "sumac-chicken")!;
    const kabsa = dishes.find((d) => d.id === "kabsa-chicken")!;
    const tokens = ["chicken", "rice"];
    // Wraps still need onion/sumac/tortilla critically — excluded from pantry matches.
    assert.equal(scorePantryDish(wraps, tokens), null);
    const kabsaScore = scorePantryDish(kabsa, tokens)!;
    assert.ok(kabsaScore.missingCritical === 0);
    assert.ok(kabsaScore.score > 0);
  });

  it("K — companions remain curated + independently safety-filtered", () => {
    for (const [mainId, companionIds] of Object.entries(CURATED_COMPANIONS)) {
      const main = dishes.find((d) => d.id === mainId);
      assert.ok(main, mainId);
      for (const cid of companionIds) {
        const companion = dishes.find((d) => d.id === cid);
        assert.ok(companion, `${mainId} -> ${cid}`);
        assert.ok(isCompatibleCompanion(main!, companion!));
        const safe = applyHardSafety([companion!], {
          allergies: [],
          dietType: "normal",
        });
        assert.equal(safe.length, 1);
      }
    }
  });

  it("L — image files exist for every verified recipe JPG path", () => {
    const audits = auditImageFiles(publicRoot);
    for (const id of INSPECTED_CORRECT_RECIPE_IMAGE_IDS) {
      const row = audits.find((a) => a.recipeId === id)!;
      assert.ok(row.fileExists, `${id} missing JPG at ${row.expectedRelativePath}`);
    }
  });

  it("M — coverage matrix has minimum dinner-complete depth per cuisine", () => {
    const matrix = buildCoverageMatrix();
    for (const [cuisine, row] of Object.entries(matrix)) {
      assert.ok(row.dinner_complete.length >= 3, cuisine);
      assert.ok(row.budget.length >= 1, `${cuisine} budget`);
      assert.ok(row.vegetarian.length >= 1, `${cuisine} vegetarian`);
    }
  });
});

describe("Catalog image file audit helper", () => {
  it("placeholder SVG exists", () => {
    const svg = path.join(publicRoot, "assets/dishes/_needs-photo.svg");
    assert.ok(fs.existsSync(svg));
  });
});
