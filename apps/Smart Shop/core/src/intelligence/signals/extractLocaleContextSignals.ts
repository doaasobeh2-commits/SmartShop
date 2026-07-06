import type { BehavioralSignal } from "./BehavioralSignal";

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export type LocaleContextInput = {
  householdId: string;
  city?: string;
  countryCode?: string;
  languageCode?: string;
  region?: string;
};

export function extractLocaleContextSignals(
  input: LocaleContextInput,
  observedAt = new Date().toISOString(),
): BehavioralSignal[] {
  const signals: BehavioralSignal[] = [];

  if (input.countryCode) {
    signals.push({
      id: createId("sig"),
      householdId: input.householdId,
      source: "system",
      category: "locale_context",
      observedAt,
      payload: { countryCode: input.countryCode.toLowerCase() },
      weight: 0.4,
    });
  }

  if (input.languageCode) {
    signals.push({
      id: createId("sig"),
      householdId: input.householdId,
      source: "system",
      category: "locale_context",
      observedAt,
      payload: { languageCode: input.languageCode.toLowerCase() },
      weight: 0.5,
    });
  }

  if (input.city) {
    signals.push({
      id: createId("sig"),
      householdId: input.householdId,
      source: "system",
      category: "locale_context",
      observedAt,
      payload: { city: input.city.toLowerCase() },
      weight: 0.3,
    });
  }

  if (input.region) {
    signals.push({
      id: createId("sig"),
      householdId: input.householdId,
      source: "system",
      category: "locale_context",
      observedAt,
      payload: { region: input.region.toLowerCase() },
      weight: 0.3,
    });
  }

  return signals;
}
