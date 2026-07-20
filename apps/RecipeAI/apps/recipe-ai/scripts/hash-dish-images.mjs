import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { listAllDishes } from "../src/data/catalog/dishes/index.ts";
import {
  INSPECTED_CORRECT_RECIPE_IMAGE_IDS,
  NEEDS_ACCURATE_PHOTOGRAPHY_RECIPE_IDS,
} from "../src/data/catalog/imageAssets.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicRoot = path.join(__dirname, "../public");

function cuisineFolder(cuisineFamilyId) {
  return cuisineFamilyId === "central_european"
    ? "central-european"
    : cuisineFamilyId;
}

const hashes = new Map();
const byHash = new Map();

for (const dish of listAllDishes()) {
  const cf = cuisineFolder(dish.cuisineFamilyId);
  const jpg = path.join(publicRoot, "assets/dishes", cf, `${dish.id}.jpg`);
  if (!fs.existsSync(jpg)) {
    console.log("MISSING", dish.id);
    continue;
  }
  const buf = fs.readFileSync(jpg);
  const hash = crypto.createHash("sha256").update(buf).digest("hex");
  hashes.set(dish.id, { hash, size: buf.length });
  if (!byHash.has(hash)) byHash.set(hash, []);
  byHash.get(hash).push(dish.id);
}

console.log("Total JPG on disk:", hashes.size);
console.log("Duplicate hash groups:");
for (const [, ids] of byHash) {
  if (ids.length > 1) {
    console.log(" ", ids.join(" === "), "bytes:", hashes.get(ids[0]).size);
  }
}

const jpgButPlaceholder = NEEDS_ACCURATE_PHOTOGRAPHY_RECIPE_IDS.filter((id) => {
  const dish = listAllDishes().find((d) => d.id === id);
  if (!dish) return false;
  const cf = cuisineFolder(dish.cuisineFamilyId);
  return fs.existsSync(
    path.join(publicRoot, "assets/dishes", cf, `${id}.jpg`),
  );
});
console.log("JPG on disk but still placeholder in code:", jpgButPlaceholder.length);
console.log(jpgButPlaceholder.join(", "));
