/**
 * Reconcile the 40 consumer recipes' ingredient lists from the corrected catalog JSON.
 * Preserves IDs, titles, steps, images, and non-ingredient seed fields.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

type LocaleIng = { id: string; name: string; detail: string; status?: string };

const corrected = JSON.parse(
  readFileSync(
    "C:/Users/fadis/Downloads/shareyum-catalog-88-final-corrected.json",
    "utf8",
  ),
);
const plan = JSON.parse(
  readFileSync(join(root, "exports/_40-ingredient-plan.json"), "utf8"),
) as Array<{ id: string; sourceFile: string; afterCount: number }>;

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function formatIngredientBlock(
  en: LocaleIng[],
  de: LocaleIng[],
  ar: LocaleIng[],
  tr: LocaleIng[],
  indent: string,
): string {
  const lines: string[] = [`${indent}ingredients: [`];
  for (let i = 0; i < en.length; i++) {
    const e = en[i]!;
    const d = de[i]!;
    const a = ar[i]!;
    const t = tr[i]!;
    if (e.id !== d.id || e.id !== a.id || e.id !== t.id) {
      throw new Error(`Ingredient id mismatch at index ${i} for ${e.id}`);
    }
    const status =
      e.status === "have" || e.status === "need" ? e.status : undefined;
    lines.push(`${indent}  {`);
    lines.push(`${indent}    id: ${JSON.stringify(e.id)},`);
    lines.push(`${indent}    en: ${JSON.stringify(e.name)},`);
    lines.push(`${indent}    de: ${JSON.stringify(d.name)},`);
    lines.push(`${indent}    ar: ${JSON.stringify(a.name)},`);
    lines.push(`${indent}    tr: ${JSON.stringify(t.name)},`);
    lines.push(`${indent}    detailEn: ${JSON.stringify(e.detail)},`);
    lines.push(`${indent}    detailDe: ${JSON.stringify(d.detail)},`);
    lines.push(`${indent}    detailAr: ${JSON.stringify(a.detail)},`);
    lines.push(`${indent}    detailTr: ${JSON.stringify(t.detail)},`);
    if (status) {
      lines.push(`${indent}    status: ${JSON.stringify(status)},`);
    }
    lines.push(`${indent}  },`);
  }
  lines.push(`${indent}],`);
  return lines.join("\n");
}

function findMatchingBracket(src: string, openIdx: number): number {
  let depth = 0;
  let inStr: string | null = null;
  let escape = false;
  for (let i = openIdx; i < src.length; i++) {
    const ch = src[i]!;
    if (inStr) {
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === "\\") {
        escape = true;
        continue;
      }
      if (ch === inStr) inStr = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      inStr = ch;
      continue;
    }
    if (ch === "[") depth += 1;
    else if (ch === "]") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  throw new Error("Unbalanced brackets");
}

function replaceIngredientsInFile(
  fileAbs: string,
  recipeId: string,
  newBlock: string,
): { beforeCount: number; afterCount: number } {
  let src = readFileSync(fileAbs, "utf8");
  const idRe = new RegExp(`id:\\s*${JSON.stringify(recipeId)}`);
  const idMatch = idRe.exec(src);
  if (!idMatch || idMatch.index == null) {
    throw new Error(`Recipe id not found in ${fileAbs}: ${recipeId}`);
  }
  // Search for ingredients array within this seed object (before next id: or end)
  const from = idMatch.index;
  const nextId = src.slice(from + 1).search(/\nid:\s*"/);
  const seedEnd = nextId >= 0 ? from + 1 + nextId : src.length;
  const seedSlice = src.slice(from, seedEnd);
  const ingKey = seedSlice.search(/\ningredients:\s*\[/);
  if (ingKey < 0) {
    // try without leading newline
    const alt = seedSlice.search(/ingredients:\s*\[/);
    if (alt < 0) throw new Error(`ingredients array not found for ${recipeId}`);
  }
  const relativeIng = seedSlice.search(/ingredients:\s*\[/);
  const absOpen = from + relativeIng + seedSlice.slice(relativeIng).indexOf("[");
  const absClose = findMatchingBracket(src, absOpen);
  // Include trailing comma after ]
  let end = absClose + 1;
  if (src[end] === ",") end += 1;

  const oldBlock = src.slice(from + relativeIng, end);
  const beforeCount = (oldBlock.match(/\bid:\s*"/g) || []).length;

  // Detect indent from the ingredients: line
  const lineStart = src.lastIndexOf("\n", from + relativeIng) + 1;
  const indent = src.slice(lineStart, from + relativeIng).match(/^(\s*)/)?.[1] ?? "    ";
  // Rebuild block with detected indent — newBlock already has indent baked in
  const replacement = newBlock.endsWith(",") ? newBlock : `${newBlock},`;

  // Replace from "ingredients:" through closing ]
  const startReplace = from + relativeIng;
  src = src.slice(0, startReplace) + replacement + src.slice(end);

  // Also expand ingredientTokens if present in this seed
  const idMatch2 = new RegExp(`id:\\s*${JSON.stringify(recipeId)}`).exec(src);
  if (idMatch2 && idMatch2.index != null) {
    const from2 = idMatch2.index;
    const nextId2 = src.slice(from2 + 1).search(/\nid:\s*"/);
    const seedEnd2 = nextId2 >= 0 ? from2 + 1 + nextId2 : src.length;
    const seedSlice2 = src.slice(from2, seedEnd2);
    const tokensRel = seedSlice2.search(/ingredientTokens:\s*\[/);
    if (tokensRel >= 0) {
      const tokenOpen =
        from2 + tokensRel + seedSlice2.slice(tokensRel).indexOf("[");
      const tokenClose = findMatchingBracket(src, tokenOpen);
      const existing = src.slice(tokenOpen + 1, tokenClose);
      const existingTokens = new Set(
        [...existing.matchAll(/"([^"]+)"/g)].map((m) => m[1]!.toLowerCase()),
      );
      // Pull ids/names from newBlock for token expansion
      const newIds = [...newBlock.matchAll(/id:\s*"([^"]+)"/g)].map((m) => m[1]!);
      const newNames = [...newBlock.matchAll(/\ben:\s*"([^"]+)"/g)].map((m) => m[1]!);
      const toAdd: string[] = [];
      for (const id of newIds) {
        const key = id.replace(/-/g, " ").toLowerCase();
        if (![...existingTokens].some((t) => t.includes(key) || key.includes(t))) {
          if (!existingTokens.has(id.toLowerCase()) && !existingTokens.has(key)) {
            toAdd.push(id.replace(/-/g, " "));
            existingTokens.add(key);
          }
        }
      }
      for (const name of newNames) {
        const key = name.toLowerCase();
        if (!existingTokens.has(key) && name.split(" ").length <= 3) {
          // skip long names; prefer short tokens
        }
      }
      if (toAdd.length) {
        const insertAt = tokenClose;
        const addition = toAdd.map((t) => `\n      ${JSON.stringify(t)},`).join("");
        // insert before closing ]
        src = src.slice(0, insertAt) + addition + src.slice(insertAt);
      }
    }
  }

  writeFileSync(fileAbs, src);
  const afterCount = (replacement.match(/\bid:\s*"/g) || []).length;
  return { beforeCount, afterCount };
}

const report: Array<{
  id: string;
  file: string;
  beforeCount: number;
  afterCount: number;
}> = [];

for (const row of plan) {
  const recipe = corrected.recipes.find((r: { id: string }) => r.id === row.id);
  if (!recipe) throw new Error(`Missing corrected recipe ${row.id}`);
  const en = recipe.locales.en.ingredients as LocaleIng[];
  const de = recipe.locales.de.ingredients as LocaleIng[];
  const ar = recipe.locales.ar.ingredients as LocaleIng[];
  const tr = recipe.locales.tr.ingredients as LocaleIng[];
  if (
    en.length !== de.length ||
    en.length !== ar.length ||
    en.length !== tr.length
  ) {
    throw new Error(`Locale ingredient parity failed for ${row.id}`);
  }

  // Relative path in plan is apps/recipe-ai/src/... — map to local src/
  const rel = (row.sourceFile as string).replace(/^apps\/recipe-ai\//, "");
  const fileAbs = join(root, rel);
  const indent = "    ";
  const block = formatIngredientBlock(en, de, ar, tr, indent);
  const result = replaceIngredientsInFile(fileAbs, row.id, block);
  report.push({
    id: row.id,
    file: rel,
    beforeCount: result.beforeCount,
    afterCount: result.afterCount,
  });
  console.log(
    `${row.id}: ${result.beforeCount} → ${result.afterCount} (${rel})`,
  );
}

writeFileSync(
  join(root, "exports/_40-reconcile-report.json"),
  JSON.stringify(report, null, 2),
);
console.log(`\nReconciled ${report.length} recipes`);
