/**
 * Align ingredientTokens with reconciled ingredient ids for the 40 consumer recipes.
 * Keeps short aliases needed for matching (e.g. tomato/tomatoes) when present in names.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const plan = JSON.parse(
  readFileSync(join(root, "exports/_40-ingredient-plan.json"), "utf8"),
) as Array<{ id: string; sourceFile: string }>;

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

function tokensFromIngredients(ings: Array<{ id: string; en: string }>): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const add = (t: string) => {
    const key = t.toLowerCase().trim();
    if (!key || seen.has(key)) return;
    seen.add(key);
    out.push(key);
  };
  for (const ing of ings) {
    add(ing.id.replace(/-/g, " "));
    // Keep hyphenated id form too when different
    if (ing.id.includes("-")) add(ing.id);
    for (const part of ing.en.toLowerCase().split(/[\s,/()]+/)) {
      if (part.length >= 3 && !["the", "and", "for", "with"].includes(part)) {
        add(part);
      }
    }
  }
  // Cap token list to stay focused — prefer ids first
  const idFirst = ings.map((i) => i.id.replace(/-/g, " "));
  const extras = out.filter((t) => !idFirst.includes(t));
  return [...idFirst, ...extras].slice(0, Math.max(idFirst.length, Math.min(12, out.length)));
}

const corrected = JSON.parse(
  readFileSync(
    "C:/Users/fadis/Downloads/shareyum-catalog-88-final-corrected.json",
    "utf8",
  ),
);

for (const row of plan) {
  const recipe = corrected.recipes.find((r: { id: string }) => r.id === row.id);
  if (!recipe) throw new Error(row.id);
  const ings = (recipe.locales.en.ingredients as Array<{ id: string; name: string }>).map(
    (i) => ({ id: i.id, en: i.name }),
  );
  // Special coherence: dal-tadka steps say "dal"
  if (row.id === "dal-tadka") {
    const lentils = ings.find((i) => i.id === "lentils");
    if (lentils && !lentils.en.toLowerCase().includes("dal")) {
      lentils.en = `${lentils.en} (dal)`;
    }
  }
  const tokens = tokensFromIngredients(ings);
  // Ensure dal token present for dal-tadka
  if (row.id === "dal-tadka" && !tokens.includes("dal")) tokens.push("dal");

  const rel = row.sourceFile.replace(/^apps\/recipe-ai\//, "");
  const fileAbs = join(root, rel);
  let src = readFileSync(fileAbs, "utf8");
  const idRe = new RegExp(`id:\\s*${JSON.stringify(row.id)}`);
  const idMatch = idRe.exec(src);
  if (!idMatch || idMatch.index == null) throw new Error(`id missing ${row.id}`);
  const from = idMatch.index;
  const nextId = src.slice(from + 1).search(/\nid:\s*"/);
  const seedEnd = nextId >= 0 ? from + 1 + nextId : src.length;
  const seedSlice = src.slice(from, seedEnd);
  const tokensRel = seedSlice.search(/ingredientTokens:\s*\[/);
  if (tokensRel < 0) {
    console.log("skip no tokens", row.id);
    continue;
  }
  const tokenOpen = from + tokensRel + seedSlice.slice(tokensRel).indexOf("[");
  const tokenClose = findMatchingBracket(src, tokenOpen);
  let end = tokenClose + 1;
  if (src[end] === ",") end += 1;
  const lineStart = src.lastIndexOf("\n", from + tokensRel) + 1;
  const indent = src.slice(lineStart, from + tokensRel).match(/^(\s*)/)?.[1] ?? "    ";
  const block =
    `${indent}ingredientTokens: [\n` +
    tokens.map((t) => `${indent}  ${JSON.stringify(t)},`).join("\n") +
    `\n${indent}],`;

  src = src.slice(0, from + tokensRel) + block + src.slice(end);

  // Also update dal-tadka lentils display name if needed
  if (row.id === "dal-tadka") {
    src = src.replace(
      /id: "lentils",\s*\n\s*en: "Yellow lentils"/,
      `id: "lentils",\n        en: "Yellow lentils (dal)"`,
    );
  }

  writeFileSync(fileAbs, src);
  console.log(`${row.id}: tokens=${tokens.length} [${tokens.slice(0, 6).join(", ")}...]`);
}

console.log("done");
