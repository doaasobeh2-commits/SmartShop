import { listAllDishes } from "../src/data/catalog/dishes/index.ts";
import { auditCuisineIntentCoverage } from "../src/data/catalog/mealIntentMeta.ts";
import {
  INSPECTED_CORRECT_RECIPE_IMAGE_IDS,
  NEEDS_ACCURATE_PHOTOGRAPHY_RECIPE_IDS,
} from "../src/data/catalog/imageAssets.ts";
import { dayIntentFit } from "../src/data/catalog/decision/dayIntent.ts";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicRoot = path.join(__dirname, "../public");

const dishes = listAllDishes();
const ids = dishes.map((d) => d.id).sort();

console.log("TOTAL", ids.length);
console.log("INSPECTED", INSPECTED_CORRECT_RECIPE_IMAGE_IDS.length);
console.log("PLACEHOLDER", NEEDS_ACCURATE_PHOTOGRAPHY_RECIPE_IDS.length);
console.log(
  "SUM",
  INSPECTED_CORRECT_RECIPE_IMAGE_IDS.length +
    NEEDS_ACCURATE_PHOTOGRAPHY_RECIPE_IDS.length,
);

const allImageIds = new Set([
  ...INSPECTED_CORRECT_RECIPE_IMAGE_IDS,
  ...NEEDS_ACCURATE_PHOTOGRAPHY_RECIPE_IDS,
]);
const catalogIds = new Set(ids);
console.log(
  "Missing from image lists:",
  ids.filter((id) => !allImageIds.has(id)),
);
console.log(
  "Extra in image lists:",
  [...allImageIds].filter((id) => !catalogIds.has(id)),
);

const coverage = auditCuisineIntentCoverage(dishes);
console.log("\nCoverage by cuisine:");
for (const [c, row] of Object.entries(coverage)) {
  console.log(c, row);
}

const intents = ["budget", "healthy", "light", "high_calorie", "special", "quick", "vegetarian"];
console.log("\nIntent-capable dinner_complete mains (top fit > 0):");
for (const c of Object.keys(coverage)) {
  const mains = dishes.filter(
    (d) => d.cuisineFamilyId === c && d.mealSlotRole === "dinner_complete",
  );
  const row = {};
  for (const intent of intents) {
    row[intent] = mains.filter((d) => dayIntentFit(d, intent) > 0).map((d) => d.id);
  }
  console.log(c, JSON.stringify(row, null, 0));
}

console.log("\nArab dinner_complete:", dishes.filter(d => d.cuisineFamilyId === 'arab' && d.mealSlotRole === 'dinner_complete').map(d => d.id));

function fileExists(rel) {
  const p = path.join(publicRoot, rel.replace(/^\//, ""));
  return fs.existsSync(p);
}

console.log("\nImage file existence:");
let verifiedFiles = 0;
let missingVerified = 0;
for (const dish of dishes) {
  const isVerified = INSPECTED_CORRECT_RECIPE_IMAGE_IDS.includes(dish.id);
  if (isVerified) {
    const rel = dish.imageUrl;
    const ok = fileExists(rel);
    if (ok) verifiedFiles++;
    else {
      missingVerified++;
      console.log("MISSING JPG:", dish.id, rel);
    }
  }
}
console.log("Verified JPG files on disk:", verifiedFiles);
console.log("Verified JPG missing on disk:", missingVerified);
console.log("Placeholder SVG exists:", fileExists("/assets/dishes/_needs-photo.svg"));
