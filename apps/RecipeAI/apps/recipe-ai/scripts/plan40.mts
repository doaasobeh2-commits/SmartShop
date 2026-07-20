import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const corrected = JSON.parse(
  readFileSync(
    "C:/Users/fadis/Downloads/shareyum-catalog-88-final-corrected.json",
    "utf8",
  ),
);
const mismatches = JSON.parse(
  readFileSync(join(root, "exports/_validate-18-content-diff.json"), "utf8"),
).mismatches as Array<{ id: string; title: string; issues: string[] }>;

const rows = mismatches.map((m) => {
  const r = corrected.recipes.find((x: { id: string }) => x.id === m.id);
  if (!r) throw new Error(`missing ${m.id}`);
  const en = r.locales.en.ingredients as Array<{ id: string; name: string; detail: string; status?: string }>;
  return {
    id: m.id,
    title: m.title,
    sourceFile: r.sourceFile as string,
    beforeHint: m.issues[0],
    afterCount: en.length,
    ingredientIds: en.map((i) => i.id),
  };
});

writeFileSync(join(root, "exports/_40-ingredient-plan.json"), JSON.stringify(rows, null, 2));
console.log(`planned ${rows.length}`);
for (const r of rows) {
  console.log(`${r.id}\t${r.afterCount}\t${r.sourceFile}`);
}
