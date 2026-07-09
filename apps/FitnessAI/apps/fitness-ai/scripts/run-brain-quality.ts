/**
 * CLI entry — prints Fitness Brain quality report to stdout.
 * Usage: npm run validate:brain
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { formatQualityReportConsole, runBrainQualityValidation } from "../src/fitnessBrain/validation/qualityValidation.ts";

const report = runBrainQualityValidation();
const output = formatQualityReportConsole(report);

console.log(output);

const reportPath = resolve(process.cwd(), "docs", "BRAIN_QUALITY_REPORT.md");
try {
  writeFileSync(reportPath, output, "utf8");
  console.log(`\nReport written to ${reportPath}`);
} catch {
  console.log("\n(Could not write docs/BRAIN_QUALITY_REPORT.md — run from app workspace)");
}

process.exit(report.launchReady ? 0 : 1);
