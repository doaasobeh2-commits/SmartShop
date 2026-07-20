import { writeFileSync } from "node:fs";
import { getDishById } from "../src/data/catalog/dishes/index.ts";
import { auditRecipeContent } from "../src/admin/recipeQaAudit.ts";
import { readFileSync } from "node:fs";

const ids = (
  JSON.parse(readFileSync("exports/_40-ingredient-plan.json", "utf8")) as Array<{
    id: string;
  }>
).map((x) => x.id);

const detail = ids
  .map((id) => {
    const d = getDishById(id)!;
    const w = auditRecipeContent(d);
    return {
      id,
      tokens: d.ingredientTokens,
      pantry: d.pantryIngredients.map((p) => p.canonicalId),
      ingIds: d.content.en.ingredients.map((i) => i.id),
      warnings: w.map((x) => ({ code: x.code, message: x.message })),
    };
  })
  .filter((r) => r.warnings.length);

writeFileSync("exports/_40-qa-warnings-detail.json", JSON.stringify(detail, null, 2));
console.log("warned", detail.length);
for (const r of detail) {
  console.log("---", r.id);
  for (const w of r.warnings) console.log(" ", w.code, w.message);
}
