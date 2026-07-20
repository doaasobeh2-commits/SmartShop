import { writeFileSync } from "node:fs";
import { getDishById, listAllDishes } from "../src/data/catalog/dishes/index.ts";
import { auditRecipeContent, recipeHasQaWarnings } from "../src/admin/recipeQaAudit.ts";
import { readFileSync } from "node:fs";

const plan = JSON.parse(
  readFileSync("exports/_40-ingredient-plan.json", "utf8"),
) as Array<{ id: string; afterCount: number }>;

const rows = plan.map((p) => {
  const d = getDishById(p.id);
  if (!d) return { id: p.id, error: "missing" };
  const warnings = auditRecipeContent(d);
  return {
    id: p.id,
    title: d.title,
    enIng: d.content.en.ingredients.length,
    expected: p.afterCount,
    enSteps: d.content.en.steps.length,
    deIng: d.content.de.ingredients.length,
    arIng: d.content.ar.ingredients.length,
    trIng: d.content.tr.ingredients.length,
    hasWarn: recipeHasQaWarnings(d),
    warnCodes: warnings.map((w) => w.code),
    imageUrl: d.imageUrl,
  };
});

writeFileSync("exports/_40-post-reconcile-check.json", JSON.stringify({ total: listAllDishes().length, rows }, null, 2));
const mismatches = rows.filter((r) => "enIng" in r && r.enIng !== r.expected);
const warned = rows.filter((r) => "hasWarn" in r && r.hasWarn);
console.log("consumer total", listAllDishes().length);
console.log("count mismatches", mismatches.length);
console.log("still warned", warned.length);
console.log(warned.map((w) => ("id" in w ? `${w.id}:${(w as { warnCodes: string[] }).warnCodes.join(",")}` : "")).join("\n"));
