import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { DISH_CATALOG } from "../src/data/catalog/dishes/index.ts";
import { ARAB_BATCH_1 } from "../src/admin/arabBatch1Library.ts";
import { arabBatch1DraftId } from "../src/admin/arabBatch1StudioSeed.ts";
import { ARAB_BATCH_2_GROUP_1 } from "../src/admin/arabBatch2Group1Library.ts";
import { arabBatch2Group1DraftId } from "../src/admin/arabBatch2Group1StudioSeed.ts";
import { ARAB_BATCH_2_GROUP_2 } from "../src/admin/arabBatch2Group2Library.ts";
import { arabBatch2Group2DraftId } from "../src/admin/arabBatch2Group2StudioSeed.ts";
import { GENERATED_RECIPE_LIBRARY } from "../src/admin/generatedRecipeLibrary.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CORRECTED = "C:/Users/fadis/Downloads/shareyum-catalog-88-final-corrected.json";

type AppRow = { id: string; title: string; enIng: number; enSteps: number; layer: string };

const app: AppRow[] = [];
for (const d of DISH_CATALOG) {
  app.push({
    id: d.id,
    title: d.title,
    enIng: d.content.en.ingredients.length,
    enSteps: d.content.en.steps.length,
    layer: "consumer",
  });
}
for (const r of ARAB_BATCH_1) {
  app.push({
    id: arabBatch1DraftId(r),
    title: r.canonicalTitle,
    enIng: r.ingredients.length,
    enSteps: r.localeCopy.en.steps.length,
    layer: "studio_seed",
  });
}
for (const r of ARAB_BATCH_2_GROUP_1) {
  app.push({
    id: arabBatch2Group1DraftId(r),
    title: r.canonicalTitle,
    enIng: r.ingredients.length,
    enSteps: r.localeCopy.en.steps.length,
    layer: "studio_seed",
  });
}
for (const r of ARAB_BATCH_2_GROUP_2) {
  app.push({
    id: arabBatch2Group2DraftId(r),
    title: r.canonicalTitle,
    enIng: r.ingredients.length,
    enSteps: r.localeCopy.en.steps.length,
    layer: "studio_seed",
  });
}
for (const r of GENERATED_RECIPE_LIBRARY.filter(
  (x) => x.canonicalTitle === "Baba Ghanouj" || x.canonicalTitle === "Yalanji",
)) {
  app.push({
    id: `generation-only:${r.canonicalTitle.toLowerCase().replace(/\s+/g, "-")}`,
    title: r.canonicalTitle,
    enIng: r.ingredients.length,
    enSteps: r.localeCopy.en.steps.length,
    layer: "generation_only",
  });
}

const corrected = JSON.parse(readFileSync(CORRECTED, "utf8")) as {
  recipes: Array<{
    id: string;
    canonicalTitle?: string;
    locales?: { en?: { ingredients?: unknown[]; steps?: unknown[] } };
    imageUrl?: string | null;
    preparedImageUrl?: string | null;
  }>;
};

const byId = new Map(corrected.recipes.map((r) => [r.id, r]));
const mismatches: Array<{ id: string; title: string; layer: string; issues: string[] }> = [];

for (const a of app) {
  const c = byId.get(a.id);
  if (!c) {
    mismatches.push({
      id: a.id,
      title: a.title,
      layer: a.layer,
      issues: ["missing in corrected JSON by id"],
    });
    continue;
  }
  const cIng = c.locales?.en?.ingredients?.length ?? 0;
  const cSteps = c.locales?.en?.steps?.length ?? 0;
  const issues: string[] = [];
  if (a.enIng !== cIng) issues.push(`EN ingredient count app=${a.enIng} corrected=${cIng}`);
  if (a.enSteps !== cSteps) issues.push(`EN step count app=${a.enSteps} corrected=${cSteps}`);
  if (issues.length) mismatches.push({ id: a.id, title: a.title, layer: a.layer, issues });
}

const onlyInCorrected = corrected.recipes
  .filter((r) => !app.some((a) => a.id === r.id))
  .map((r) => ({ id: r.id, title: r.canonicalTitle }));

const onlyInApp = app
  .filter((a) => !byId.has(a.id))
  .map((a) => ({ id: a.id, title: a.title }));

const out = {
  appCount: app.length,
  correctedCount: corrected.recipes.length,
  mismatchCount: mismatches.length,
  mismatches,
  onlyInCorrected,
  onlyInApp,
  note: "Reference-only comparison. App catalog was NOT replaced with corrected JSON.",
};

const outPath = join(__dirname, "..", "exports", "_validate-18-content-diff.json");
writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log(
  JSON.stringify(
    {
      appCount: out.appCount,
      correctedCount: out.correctedCount,
      mismatchCount: out.mismatchCount,
      onlyInCorrected: onlyInCorrected.length,
      onlyInApp: onlyInApp.length,
      byLayer: {
        consumer: mismatches.filter((m) => m.layer === "consumer").length,
        studio_seed: mismatches.filter((m) => m.layer === "studio_seed").length,
        generation_only: mismatches.filter((m) => m.layer === "generation_only").length,
      },
      outPath: existsSync(outPath) ? outPath : null,
    },
    null,
    2,
  ),
);
