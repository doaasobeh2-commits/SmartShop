/**
 * Fitness Brain quality validation — golden personas + launch readiness report.
 */

import { GOLDEN_PERSONAS } from "./goldenPersonas";
import { validatePersonaScenario, type PersonaValidationResult } from "./personaScenarioRunner";
import { installValidationStorage } from "./testSetup";

export type BrainQualityReport = {
  generatedAt: string;
  totalPersonas: number;
  passed: number;
  failed: number;
  launchReady: boolean;
  personas: PersonaValidationResult[];
  weakLogicPersonas: string[];
  rulesNeedingTuning: string[];
  summaryMarkdown: string;
};

function uniqueRulesFromFailures(results: PersonaValidationResult[]): string[] {
  const hints = new Set<string>();
  for (const r of results.filter((p) => !p.passed)) {
    if (r.failures.some((f) => f.includes("complete_workout"))) {
      hints.add("dailyDecisionEngine — complete_workout vs recovery priority");
    }
    if (r.failures.some((f) => f.includes("confidence"))) {
      hints.add("confidenceEvaluator — sparse-data confidence thresholds");
    }
    if (r.failures.some((f) => f.includes("hydration"))) {
      hints.add("nutritionRules — hydration threshold timing (hour cutoffs)");
    }
    if (r.failures.some((f) => f.includes("protein"))) {
      hints.add("nutritionRules — protein progress thresholds by goal");
    }
    if (r.failures.some((f) => f.includes("Training title"))) {
      hints.add("trainingRules — experience-aware session selection");
    }
    if (r.failures.some((f) => f.includes("Macro sum"))) {
      hints.add("nutritionEngine — macro rounding vs calorie target");
    }
    if (r.failures.some((f) => f.includes("Source:"))) {
      hints.add("scientificSources — knowledge rule linkage");
    }
  }
  return [...hints];
}

function buildSummaryMarkdown(report: BrainQualityReport): string {
  const lines: string[] = [
    "# Fitness Brain Quality Validation Report",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    "## Summary",
    "",
    `- **Personas tested:** ${report.totalPersonas}`,
    `- **Passed:** ${report.passed}`,
    `- **Failed:** ${report.failed}`,
    `- **Launch ready:** ${report.launchReady ? "YES — proceed to launch review" : "NO — fix failures first"}`,
    "",
  ];

  if (report.weakLogicPersonas.length) {
    lines.push("## Personas exposing weak logic", "");
    for (const id of report.weakLogicPersonas) {
      const p = report.personas.find((x) => x.personaId === id);
      lines.push(`- **${id}** (${p?.label}): ${p?.failures.join("; ")}`);
    }
    lines.push("");
  }

  if (report.rulesNeedingTuning.length) {
    lines.push("## Rules / modules needing tuning", "");
    for (const rule of report.rulesNeedingTuning) {
      lines.push(`- ${rule}`);
    }
    lines.push("");
  }

  lines.push("## Persona results", "");
  lines.push("| Persona | Action | Confidence | Recovery | Result |");
  lines.push("|---------|--------|------------|----------|--------|");
  for (const p of report.personas) {
    lines.push(
      `| ${p.personaId} | ${p.dailyActionId} | ${p.confidence} | ${p.recoveryLevel} (${p.recoveryScore}) | ${p.passed ? "PASS" : "FAIL"} |`,
    );
  }
  lines.push("");

  lines.push("## Passed", "");
  for (const p of report.personas.filter((x) => x.passed)) {
    lines.push(`- **${p.personaId}**: ${p.dailyActionTitle} — ${p.rationale}`);
  }
  lines.push("");

  const failed = report.personas.filter((x) => !x.passed);
  if (failed.length) {
    lines.push("## Failed (detail)", "");
    for (const p of failed) {
      lines.push(`### ${p.personaId} — ${p.label}`, "");
      lines.push(`Expected: ${p.rationale}`, "");
      for (const f of p.failures) {
        lines.push(`- ${f}`);
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}

let storageInstalled = false;

export function runBrainQualityValidation(): BrainQualityReport {
  if (!storageInstalled) {
    installValidationStorage();
    storageInstalled = true;
  }

  const personas = GOLDEN_PERSONAS.map((persona) => validatePersonaScenario(persona));
  const passed = personas.filter((p) => p.passed).length;
  const failed = personas.length - passed;
  const weakLogicPersonas = personas.filter((p) => !p.passed).map((p) => p.personaId);
  const rulesNeedingTuning = uniqueRulesFromFailures(personas);

  const report: BrainQualityReport = {
    generatedAt: new Date().toISOString(),
    totalPersonas: personas.length,
    passed,
    failed,
    launchReady: failed === 0,
    personas,
    weakLogicPersonas,
    rulesNeedingTuning,
    summaryMarkdown: "",
  };

  report.summaryMarkdown = buildSummaryMarkdown(report);
  return report;
}

export function formatQualityReportConsole(report: BrainQualityReport): string {
  return report.summaryMarkdown;
}
