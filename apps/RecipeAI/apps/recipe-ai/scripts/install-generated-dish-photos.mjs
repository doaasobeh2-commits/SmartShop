#!/usr/bin/env node
/** Copy generated dish photos from Cursor assets into public catalog paths. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { listAllDishes } from "../src/data/catalog/dishes/index.ts";
import { NEEDS_ACCURATE_PHOTOGRAPHY_RECIPE_IDS } from "../src/data/catalog/imageAssets.ts";
import { cuisineFolderFor } from "../src/data/catalog/catalogIntegrity.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const generatedRoot = path.resolve(
  __dirname,
  "../../../../.cursor/projects/c-Users-fadis-Desktop-CUsers-Projects-Projects-Fadi-Core-Platform-apps-RecipeAI/assets",
);
const publicRoot = path.join(__dirname, "../public");

let copied = 0;
let missing = 0;

for (const id of NEEDS_ACCURATE_PHOTOGRAPHY_RECIPE_IDS) {
  const dish = listAllDishes().find((d) => d.id === id);
  if (!dish) continue;
  const src = path.join(generatedRoot, `${id}.jpg`);
  const destDir = path.join(
    publicRoot,
    "assets/dishes",
    cuisineFolderFor(dish.cuisineFamilyId),
  );
  const dest = path.join(destDir, `${id}.jpg`);
  if (!fs.existsSync(src)) {
    console.log("MISSING GENERATED:", id);
    missing++;
    continue;
  }
  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(src, dest);
  copied++;
}

console.log("Copied:", copied, "Missing:", missing);
