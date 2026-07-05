export type KnowledgeFactStatus = "active" | "superseded" | "decayed";

export type KnowledgeFact = {
  id: string;
  type: string;
  category: string;
  value: string;
  confidence: number;
  evidenceCount: number;
  lastObservedAt: string;
  createdAt: string;
  status: KnowledgeFactStatus;
  supersededBy?: string;
};

export const KNOWLEDGE_SCHEMA_VERSION = 1;

export type HouseholdKnowledge = {
  householdId: string;
  schemaVersion: number;
  facts: KnowledgeFact[];
  lastRecomputedAt?: string;
};

export type HouseholdKnowledgeStore = {
  get(householdId: string): Promise<HouseholdKnowledge>;
  save(knowledge: HouseholdKnowledge): Promise<void>;
};

/** Internal: reduce confidence for facts not recently observed. */
export function applyKnowledgeDecay(
  facts: KnowledgeFact[],
  now = new Date(),
): KnowledgeFact[] {
  const decayThresholdMs = 56 * 24 * 60 * 60 * 1000;

  return facts.map((fact) => {
    if (fact.status !== "active") {
      return fact;
    }

    const age = now.getTime() - new Date(fact.lastObservedAt).getTime();
    if (age <= decayThresholdMs) {
      return fact;
    }

    const decayFactor = Math.max(0.3, 1 - age / (decayThresholdMs * 4));
    const nextConfidence = Math.round(fact.confidence * decayFactor * 100) / 100;

    if (nextConfidence < 0.35) {
      return { ...fact, confidence: nextConfidence, status: "decayed" as const };
    }

    return { ...fact, confidence: nextConfidence };
  });
}

export function emptyKnowledge(householdId: string): HouseholdKnowledge {
  return {
    householdId,
    schemaVersion: KNOWLEDGE_SCHEMA_VERSION,
    facts: [],
  };
}
