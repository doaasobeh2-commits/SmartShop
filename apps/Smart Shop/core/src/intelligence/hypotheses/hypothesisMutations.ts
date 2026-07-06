import type { HouseholdHypothesis } from "./HouseholdHypothesis";

const MAX_CONFIDENCE = 0.99;
const MIN_ACTIVE_CONFIDENCE = 0.35;

export function reinforceHypothesis(
  hypothesis: HouseholdHypothesis,
  signalId: string,
  boost = 0.06,
): HouseholdHypothesis {
  const now = new Date().toISOString();
  const supportingSignalIds = hypothesis.supportingSignalIds.includes(signalId)
    ? hypothesis.supportingSignalIds
    : [...hypothesis.supportingSignalIds, signalId];

  return {
    ...hypothesis,
    confidence: Math.min(MAX_CONFIDENCE, Math.round((hypothesis.confidence + boost) * 100) / 100),
    evidenceCount: hypothesis.evidenceCount + 1,
    supportingSignalIds,
    lastReinforcedAt: now,
    status: "active",
  };
}

export function weakenHypothesis(
  hypothesis: HouseholdHypothesis,
  signalId: string,
  penalty = 0.05,
): HouseholdHypothesis {
  const now = new Date().toISOString();
  const contradictingSignalIds = hypothesis.contradictingSignalIds.includes(signalId)
    ? hypothesis.contradictingSignalIds
    : [...hypothesis.contradictingSignalIds, signalId];

  const nextConfidence = Math.max(0, Math.round((hypothesis.confidence - penalty) * 100) / 100);

  return {
    ...hypothesis,
    confidence: nextConfidence,
    contradictingSignalIds,
    lastWeakenedAt: now,
    status: nextConfidence < MIN_ACTIVE_CONFIDENCE ? "weakened" : hypothesis.status,
  };
}

export function applyHypothesisDecay(
  hypotheses: HouseholdHypothesis[],
  now = new Date(),
): HouseholdHypothesis[] {
  const decayThresholdMs = 56 * 24 * 60 * 60 * 1000;

  return hypotheses.map((hypothesis) => {
    if (hypothesis.status === "retired") {
      return hypothesis;
    }

    const age = now.getTime() - new Date(hypothesis.lastReinforcedAt).getTime();
    if (age <= decayThresholdMs) {
      return hypothesis;
    }

    const decayFactor = Math.max(0.25, 1 - age / (decayThresholdMs * 4));
    const nextConfidence = Math.round(hypothesis.confidence * decayFactor * 100) / 100;

    if (nextConfidence < MIN_ACTIVE_CONFIDENCE) {
      return { ...hypothesis, confidence: nextConfidence, status: "weakened" as const };
    }

    return { ...hypothesis, confidence: nextConfidence };
  });
}

export function upsertHypothesis(
  hypotheses: HouseholdHypothesis[],
  householdId: string,
  domain: HouseholdHypothesis["domain"],
  label: string,
  signalId: string,
  initialConfidence = 0.45,
): HouseholdHypothesis[] {
  const now = new Date().toISOString();
  const existing = hypotheses.find(
    (item) =>
      item.domain === domain &&
      item.label === label &&
      item.status !== "retired",
  );

  if (existing) {
    return hypotheses.map((item) =>
      item.id === existing.id ? reinforceHypothesis(item, signalId) : item,
    );
  }

  return [
    ...hypotheses,
    {
      id: `hyp-${domain}-${label}`,
      householdId,
      domain,
      label,
      confidence: initialConfidence,
      evidenceCount: 1,
      supportingSignalIds: [signalId],
      contradictingSignalIds: [],
      lastReinforcedAt: now,
      createdAt: now,
      status: "active",
    },
  ];
}
