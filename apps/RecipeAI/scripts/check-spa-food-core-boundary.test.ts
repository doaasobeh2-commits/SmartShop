import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const SPA_ROOT = path.join(repoRoot, "apps", "recipe-ai");
const FORBIDDEN_IMPORT = "@recipe-ai/food-core";

function walkTsFiles(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (entry === "node_modules" || entry === "dist") continue;
      files.push(...walkTsFiles(full));
    } else if (/\.(ts|tsx)$/.test(entry) && !entry.endsWith(".test.ts")) {
      files.push(full);
    }
  }
  return files;
}

describe("SPA bundling boundary", () => {
  it("apps/recipe-ai package.json does not depend on @recipe-ai/food-core", () => {
    const pkg = JSON.parse(
      readFileSync(path.join(SPA_ROOT, "package.json"), "utf8"),
    ) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    assert.equal(deps[FORBIDDEN_IMPORT], undefined);
  });

  it("apps/recipe-ai source must not import @recipe-ai/food-core", () => {
    const srcDir = path.join(SPA_ROOT, "src");
    const offenders: string[] = [];
    for (const file of walkTsFiles(srcDir)) {
      const content = readFileSync(file, "utf8");
      if (content.includes(FORBIDDEN_IMPORT)) {
        offenders.push(path.relative(repoRoot, file));
      }
    }
    assert.deepEqual(
      offenders,
      [],
      `SPA must not import ${FORBIDDEN_IMPORT}: ${offenders.join(", ")}`,
    );
  });

  it("@recipe-ai/shared must not import @recipe-ai/food-core", () => {
    const sharedSrc = path.join(repoRoot, "shared");
    const offenders: string[] = [];
    for (const file of walkTsFiles(sharedSrc)) {
      const content = readFileSync(file, "utf8");
      if (content.includes(FORBIDDEN_IMPORT)) {
        offenders.push(path.relative(repoRoot, file));
      }
    }
    assert.deepEqual(offenders, []);
  });
});
