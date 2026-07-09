/**
 * Coach explanation adapter — WHY-focused insights only.
 * Today tells WHAT; Coach explains HOW Fitness Brain decided.
 */

import type { CoachInsight } from "../../domain/models";
import { EXPLAINABILITY_VALUES } from "../knowledge";
import type { BodyState } from "../body/bodyState";
import type { FitnessBrainState } from "../types";

function formatBodyContext(body: BodyState): string {
  const parts: string[] = [];
  if (body.energyBalance !== "unknown") {
    parts.push(`Energy balance is assessed as ${body.energyBalance.replace("_", " ")} from today's intake vs. target.`);
  }
  if (body.hydrationStatus === "low") {
    parts.push("Hydration is below today's target band.");
  } else if (body.hydrationStatus === "moderate") {
    parts.push("Hydration is partial — still room to reach today's goal.");
  } else if (body.hydrationStatus === "adequate") {
    parts.push("Hydration is on track for today.");
  } else if (body.hydrationStatus === "unknown") {
    parts.push("Hydration is unknown — missing logs are not treated as zero intake.");
  }
  if (body.recoveryCapacity === "low") {
    parts.push("Recovery capacity is limited — the recovery engine suggests lighter choices.");
  } else if (body.recoveryCapacity === "high") {
    parts.push("Recovery capacity looks solid today.");
  }
  if (body.trainingLoad === "high") {
    parts.push("Recent activity elevated today's training load estimate.");
  }
  return parts.join(" ");
}

function patternSummary(state: FitnessBrainState): string | null {
  const patterns = state.lifestyle.patterns
    .filter((p) => p.confidence === "established")
    .slice(0, 2);
  if (patterns.length === 0) return null;
  return patterns.map((p) => p.description).join(" ");
}

export function generateCoachExplanations(state: FitnessBrainState): CoachInsight[] {
  const { dailyAction, recovery, training, lifestyle, bodyState } = state;
  const insights: CoachInsight[] = [];

  insights.push({
    id: "coach-why-priority",
    title: "Why this is today's priority",
    body: dailyAction.reason,
    tone: "motivation",
    ruleId: dailyAction.explanation.supportingRuleIds[0],
    explanation: {
      id: `explain-why-${dailyAction.id}`,
      engine: "daily_decision",
      title: dailyAction.title,
      summary: dailyAction.reason,
      steps: dailyAction.explanation.selectedBecause.map((reason, i) => ({
        label: `Factor ${i + 1}`,
        value: reason,
      })),
      references: dailyAction.explanation.supportingRuleIds,
    },
  });

  insights.push({
    id: "coach-decision-method",
    title: "How Fitness Brain decided",
    body: "Fitness Brain follows Collect → Analyze → Recommend. It verifies logged evidence first, applies scientific formulas and knowledge rules, then produces today's recommendation — rule-based, not generative AI.",
    tone: "motivation",
    ruleId: "evidence-before-decision",
  });

  if (dailyAction.id.startsWith("collect_")) {
    insights.push({
      id: "coach-evidence-gap",
      title: "Evidence needed first",
      body: dailyAction.message,
      tone: "recovery",
      ruleId: "unknown-not-zero",
    });
  }

  if (dailyAction.explanation.selectedBecause.length > 0) {
    insights.push({
      id: "coach-signals-used",
      title: "Factors in this recommendation",
      body: dailyAction.explanation.selectedBecause.join(" · "),
      tone: "motivation",
      ruleId: "brain-signal-aggregation",
    });
  }

  if (recovery.level !== "neutral") {
    insights.push({
      id: "coach-recovery-why",
      title: "Recovery analysis",
      body: `${recovery.summary} Readiness score: ${recovery.score}/100 — derived from training load, sleep, and adherence signals.`,
      tone: "recovery",
      ruleId: "recovery-score-bands",
    });
  }

  const bodyText = formatBodyContext(bodyState);
  if (bodyText) {
    insights.push({
      id: "coach-body-engine",
      title: "Body context today",
      body: bodyText,
      tone: "recovery",
      ruleId: bodyState.supportingRuleIds[0] ?? "body-engine",
    });
  }

  const patterns = patternSummary(state);
  if (patterns) {
    insights.push({
      id: "coach-lifestyle-patterns",
      title: "Lifestyle patterns considered",
      body: patterns,
      tone: "motivation",
      ruleId: "life-pattern-engine",
    });
  }

  if (training.detail) {
    insights.push({
      id: "coach-training-approach",
      title: "Training recommendation",
      body: training.detail,
      tone: "workout",
      ruleId: "training-recommendation",
    });
  }

  if (training.sportId && training.rationale?.length) {
    insights.push({
      id: "coach-sport-session",
      title: "Sport-specific session",
      body: `${training.title} — ${training.rationale.join(" ")}`,
      tone: "workout",
      ruleId: training.supportingRuleIds?.[0] ?? "sport-knowledge-foundation",
    });
  }

  const todayActivity = state.activityRequirements.todayPrimary;
  if (todayActivity) {
    insights.push({
      id: "coach-activity-impact",
      title: "Activity impact today",
      body: todayActivity.reason,
      tone: "recovery",
      ruleId: todayActivity.supportingRuleIds[0] ?? "activity-requirements",
    });
  }

  if (dailyAction.explanation.supportingRuleIds.length > 0) {
    const evidenceNote =
      dailyAction.confidence === "high"
        ? "High confidence — multiple behaviour signals matched the decision rules."
        : dailyAction.confidence === "low"
          ? "Partial data — the Brain explains what is missing instead of guessing; profile defaults apply only where rules allow."
          : "Moderate confidence — based on available logs, profile, and knowledge rules.";
    insights.push({
      id: "coach-knowledge-base",
      title: "Scientific rules applied",
      body: `${evidenceNote} ${dailyAction.explanation.supportingRuleIds.length} knowledge rule${dailyAction.explanation.supportingRuleIds.length > 1 ? "s" : ""} from nutrition, recovery, training, and activity science — general wellness guidance, not medical advice.`,
      tone: "motivation",
      ruleId: dailyAction.explanation.supportingRuleIds[0],
    });
  }

  if (lifestyle.completeness.score < EXPLAINABILITY_VALUES.brainCompletenessCoachNoteMax) {
    insights.push({
      id: "coach-brain-completeness",
      title: "Profile context incomplete",
      body: `Fitness Brain currently uses ${lifestyle.completeness.score}% of available profile context (body, lifestyle, habits). Adding work, sleep, or food preferences in Profile helps the rule engines apply more precise thresholds — without changing how the system works.`,
      tone: "motivation",
      ruleId: "brain-completeness",
    });
  }

  return insights;
}
