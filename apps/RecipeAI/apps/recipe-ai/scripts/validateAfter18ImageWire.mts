/**
 * One-shot validation after wiring the 18 missing images.
 * Read-only toward recipe content; reports only.
 */
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

import { DISH_CATALOG } from "../src/data/catalog/dishes/index.ts";
import { ARAB_BATCH_1 } from "../src/admin/arabBatch1Library.ts";
import { arabBatch1DraftId } from "../src/admin/arabBatch1StudioSeed.ts";
import { ARAB_BATCH_2_GROUP_1 } from "../src/admin/arabBatch2Group1Library.ts";
import { arabBatch2Group1DraftId } from "../src/admin/arabBatch2Group1StudioSeed.ts";
import { ARAB_BATCH_2_GROUP_2 } from "../src/admin/arabBatch2Group2Library.ts";
import { arabBatch2Group2DraftId } from "../src/admin/arabBatch2Group2StudioSeed.ts";
import { GENERATED_RECIPE_LIBRARY } from "../src/admin/generatedRecipeLibrary.ts";
import { NEEDS_PHOTO_PLACEHOLDER_PATH } from "../src/data/catalog/imageAssets.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_ARAB = join(__dirname, "..", "public", "assets", "dishes", "arab");
const CORRECTED = "C:/Users/fadis/Downloads/shareyum-catalog-88-final-corrected.json";

const MISSING_18 = [
  { id: "draft-arab-batch2-g1-shakriyeh-with-rice", title: "Shakriyeh with Rice", file: "shakriyeh-with-rice.jpg" },
  { id: "draft-arab-batch2-g1-syrian-molokhia-with-chicken", title: "Syrian Molokhia with Chicken", file: "syrian-molokhia-with-chicken.jpg" },
  { id: "draft-arab-batch2-g1-fasolia-bi-zeit", title: "Fasolia bi Zeit", file: "fasolia-bi-zeit.jpg" },
  { id: "draft-arab-batch2-g1-artichoke-salad", title: "Artichoke Salad", file: "artichoke-salad.jpg" },
  { id: "draft-arab-batch2-g1-peas-with-tomato", title: "Peas with Tomato", file: "peas-with-tomato.jpg" },
  { id: "draft-arab-batch2-g1-syrian-stuffed-chicken", title: "Syrian Stuffed Chicken", file: "syrian-stuffed-chicken.jpg" },
  { id: "draft-arab-batch2-g1-freekeh-with-meat", title: "Freekeh with Meat", file: "freekeh-with-meat.jpg" },
  { id: "draft-arab-batch2-g2-harraq-esbao", title: "Harraq Esbao", file: "harraq-esbao.jpg" },
  { id: "draft-arab-batch2-g2-macarona-bil-lahmeh", title: "Macarona bil Lahmeh", file: "macarona-bil-lahmeh.jpg" },
  { id: "draft-arab-batch2-g2-syrian-boiled-potato-salad", title: "Syrian Boiled Potato Salad", file: "syrian-boiled-potato-salad.jpg" },
  { id: "draft-arab-batch2-g2-dawood-basha", title: "Dawood Basha", file: "dawood-basha.jpg" },
  { id: "draft-arab-batch2-g2-syrian-stuffed-cabbage-stew", title: "Syrian Stuffed Cabbage Stew", file: "syrian-stuffed-cabbage-stew.jpg" },
  { id: "draft-arab-batch2-g2-syrian-cauliflower-with-meat", title: "Syrian Cauliflower with Meat", file: "syrian-cauliflower-with-meat.jpg" },
  { id: "draft-arab-batch2-g2-syrian-potato-garlic-olive-oil-stew", title: "Syrian Potato Garlic Olive Oil Stew", file: "syrian-potato-garlic-olive-oil-stew.jpg" },
  { id: "draft-arab-batch2-g2-tunisian-couscous-with-meat-and-vegetables", title: "Tunisian Couscous with Meat and Vegetables", file: "tunisian-couscous-with-meat-and-vegetables.jpg" },
  { id: "draft-arab-batch2-g2-moroccan-meat-tagine-with-prunes", title: "Moroccan Meat Tagine with Prunes", file: "moroccan-meat-tagine-with-prunes.jpg" },
  { id: "draft-arab-batch2-g2-moroccan-chicken-with-preserved-lemon-and-olives", title: "Moroccan Chicken with Preserved Lemon and Olives", file: "moroccan-chicken-with-preserved-lemon-and-olives.jpg" },
  { id: "draft-arab-batch2-g2-lebanese-batata-harra", title: "Lebanese Batata Harra", file: "lebanese-batata-harra.jpg" },
] as const;

type Row = {
  id: string;
  title: string;
  layer: string;
  imagePath: string | null;
  enSteps: number;
  localeOk: boolean;
};

function isPlaceholder(url: string | null | undefined): boolean {
  if (!url) return true;
  return url.includes(NEEDS_PHOTO_PLACEHOLDER_PATH);
}

function publicPathFromUrl(url: string): string {
  // /assets/dishes/arab/foo.jpg -> public/assets/dishes/arab/foo.jpg
  return join(__dirname, "..", "public", url.replace(/^\//, "").split("?")[0]!);
}

const rows: Row[] = [];

for (const d of DISH_CATALOG) {
  const en = d.content.en;
  rows.push({
    id: d.id,
    title: d.title,
    layer: "consumer",
    imagePath: d.imageUrl,
    enSteps: en.steps.length,
    localeOk: (["en", "de", "ar", "tr"] as const).every(
      (l) =>
        Boolean(d.content[l]?.reason) &&
        (d.content[l]?.ingredients.length ?? 0) > 0 &&
        (d.content[l]?.steps.length ?? 0) > 0,
    ),
  });
}

function addGenerated(
  recipes: typeof ARAB_BATCH_1,
  draftIdFn: (r: (typeof ARAB_BATCH_1)[number]) => string,
  layer: string,
) {
  for (const r of recipes) {
    rows.push({
      id: draftIdFn(r),
      title: r.canonicalTitle,
      layer,
      imagePath: r.photo.preparedImageUrl ?? null,
      enSteps: r.localeCopy.en.steps.length,
      localeOk: (["en", "de", "ar", "tr"] as const).every(
        (l) =>
          Boolean(r.localeCopy[l]?.reason) &&
          r.ingredients.length > 0 &&
          (r.localeCopy[l]?.steps.length ?? 0) > 0,
      ),
    });
  }
}

addGenerated(ARAB_BATCH_1, arabBatch1DraftId, "studio_seed");
addGenerated(ARAB_BATCH_2_GROUP_1, arabBatch2Group1DraftId, "studio_seed");
addGenerated(ARAB_BATCH_2_GROUP_2, arabBatch2Group2DraftId, "studio_seed");

for (const r of GENERATED_RECIPE_LIBRARY.filter(
  (x) => x.canonicalTitle === "Baba Ghanouj" || x.canonicalTitle === "Yalanji",
)) {
  rows.push({
    id: `generation-only:${r.canonicalTitle.toLowerCase().replace(/\s+/g, "-")}`,
    title: r.canonicalTitle,
    layer: "generation_only",
    imagePath: r.photo.preparedImageUrl ?? null,
    enSteps: r.localeCopy.en.steps.length,
    localeOk: true,
  });
}

const missingImages = rows.filter((r) => isPlaceholder(r.imagePath));
const brokenRefs: Array<{ id: string; title: string; imagePath: string }> = [];
for (const r of rows) {
  if (isPlaceholder(r.imagePath) || !r.imagePath) continue;
  const abs = publicPathFromUrl(r.imagePath);
  if (!existsSync(abs)) {
    brokenRefs.push({ id: r.id, title: r.title, imagePath: r.imagePath });
  }
}

const ids = rows.map((r) => r.id);
const titles = rows.map((r) => r.title.trim().toLowerCase());
const dupIds = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
const dupTitles = [
  ...new Set(
    rows
      .filter((r, i) => titles.indexOf(r.title.trim().toLowerCase()) !== i)
      .map((r) => r.title),
  ),
];

const missingTranslations = rows.filter((r) => !r.localeOk);
const weakSteps = rows.filter((r) => r.enSteps < 3);

const mappings = MISSING_18.map((m) => {
  const row = rows.find((r) => r.id === m.id || r.title === m.title);
  const fileOk = existsSync(join(PUBLIC_ARAB, m.file));
  const wired = row?.imagePath === `/assets/dishes/arab/${m.file}`;
  return {
    id: m.id,
    title: m.title,
    file: m.file,
    fileExists: fileOk,
    wiredPath: row?.imagePath ?? null,
    wiredOk: wired && fileOk,
  };
});

// Compare corrected JSON vs app source for content-affecting diffs (reference only)
let correctedDiffs: unknown = { available: false };
if (existsSync(CORRECTED)) {
  const corrected = JSON.parse(readFileSync(CORRECTED, "utf8")) as {
    recipes?: Array<{
      id?: string;
      canonicalTitle?: string;
      title?: string;
      locales?: Record<string, { steps?: unknown[]; ingredients?: unknown[]; reason?: string }>;
      imageUrl?: string | null;
      preparedImageUrl?: string | null;
    }>;
  };
  const correctedRecipes = corrected.recipes ?? [];
  const contentDiffs: Array<{ id: string; title: string; issues: string[] }> = [];
  for (const row of rows) {
    const match =
      correctedRecipes.find((c) => c.id === row.id) ||
      correctedRecipes.find(
        (c) =>
          (c.canonicalTitle || c.title || "").trim().toLowerCase() ===
          row.title.trim().toLowerCase(),
      );
    if (!match) {
      contentDiffs.push({
        id: row.id,
        title: row.title,
        issues: ["not found in corrected JSON by id/title"],
      });
      continue;
    }
    const issues: string[] = [];
    const corrEn = match.locales?.en;
    if (corrEn) {
      const corrSteps = corrEn.steps?.length ?? 0;
      const corrIngs = corrEn.ingredients?.length ?? 0;
      // Find matching generated/consumer for counts
      if (row.layer === "consumer") {
        const dish = DISH_CATALOG.find((d) => d.id === row.id);
        if (dish) {
          if (dish.content.en.steps.length !== corrSteps) {
            issues.push(
              `EN step count app=${dish.content.en.steps.length} corrected=${corrSteps}`,
            );
          }
          if (dish.content.en.ingredients.length !== corrIngs) {
            issues.push(
              `EN ingredient count app=${dish.content.en.ingredients.length} corrected=${corrIngs}`,
            );
          }
        }
      } else if (row.layer === "studio_seed" || row.layer === "generation_only") {
        const gen =
          [...ARAB_BATCH_1, ...ARAB_BATCH_2_GROUP_1, ...ARAB_BATCH_2_GROUP_2].find(
            (g) => g.canonicalTitle === row.title,
          ) ||
          GENERATED_RECIPE_LIBRARY.find((g) => g.canonicalTitle === row.title);
        if (gen) {
          if (gen.localeCopy.en.steps.length !== corrSteps) {
            issues.push(
              `EN step count app=${gen.localeCopy.en.steps.length} corrected=${corrSteps}`,
            );
          }
          if (gen.ingredients.length !== corrIngs) {
            issues.push(
              `EN ingredient count app=${gen.ingredients.length} corrected=${corrIngs}`,
            );
          }
        }
      }
    }
    if (issues.length) contentDiffs.push({ id: row.id, title: row.title, issues });
  }
  correctedDiffs = {
    available: true,
    correctedRecipeCount: correctedRecipes.length,
    recipesWithContentCountMismatches: contentDiffs.length,
    sample: contentDiffs.slice(0, 20),
    note: "Compared EN ingredient/step counts only (content correctness signal). Image path differences expected after wiring.",
  };
}

console.log(
  JSON.stringify(
    {
      totalRecipes: rows.length,
      missingImagesCount: missingImages.length,
      missingImageIds: missingImages.map((r) => ({ id: r.id, title: r.title })),
      brokenNonexistentImageReferences: brokenRefs,
      duplicateRecipeIds: dupIds,
      duplicateTitles: dupTitles,
      missingTranslationsCount: missingTranslations.length,
      missingTranslationIds: missingTranslations.map((r) => r.id),
      weakIncompleteStepsCount: weakSteps.length,
      weakStepIds: weakSteps.map((r) => ({
        id: r.id,
        title: r.title,
        enSteps: r.enSteps,
      })),
      mappingsChanged: mappings,
      mappingsWiredOkCount: mappings.filter((m) => m.wiredOk).length,
      correctedJsonComparison: correctedDiffs,
      sheikhAlMahshiInMissing18: MISSING_18.some((m) =>
        m.title.toLowerCase().includes("sheikh"),
      ),
    },
    null,
    2,
  ),
);
