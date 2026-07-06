import type { HouseholdHypothesisStore } from "../hypotheses/HouseholdHypothesis";
import {
  applyHypothesisDecay,
  upsertHypothesis,
} from "../hypotheses/hypothesisMutations";
import type { BehavioralSignal } from "../signals/BehavioralSignal";
import {
  CUISINE_AFFINITY_RULES,
  DIETARY_TENDENCY_RULES,
  LOCALE_CUISINE_BOOSTS,
  matchKeyword,
} from "./cuisineAffinityRules";

export type InferenceContext = {
  householdId: string;
  signals: BehavioralSignal[];
  existing?: HouseholdHypothesisStore;
};

function collectIngredientTexts(signals: BehavioralSignal[]): string[] {
  return signals
    .filter((signal) => signal.category === "purchase" || signal.category === "ingredient_repeat")
    .map((signal) => {
      const product = signal.payload.productName;
      const ingredient = signal.payload.ingredient;
      if (typeof product === "string") {
        return product;
      }
      if (typeof ingredient === "string") {
        return ingredient;
      }
      return "";
    })
    .filter(Boolean);
}

function collectLocaleCodes(signals: BehavioralSignal[]): {
  countryCodes: string[];
  languageCodes: string[];
} {
  const countryCodes: string[] = [];
  const languageCodes: string[] = [];

  for (const signal of signals.filter((item) => item.category === "locale_context")) {
    const country = signal.payload.countryCode;
    const language = signal.payload.languageCode;
    if (typeof country === "string") {
      countryCodes.push(country);
    }
    if (typeof language === "string") {
      languageCodes.push(language);
    }
  }

  return { countryCodes, languageCodes };
}

export function runInferencePipeline(context: InferenceContext): HouseholdHypothesisStore {
  const base = context.existing ?? {
    householdId: context.householdId,
    schemaVersion: 1,
    hypotheses: [],
  };

  let hypotheses = [...base.hypotheses];
  const ingredientTexts = collectIngredientTexts(context.signals);
  const locale = collectLocaleCodes(context.signals);

  for (const rule of CUISINE_AFFINITY_RULES) {
    const matches = context.signals.filter((signal) => {
      const text =
        typeof signal.payload.productName === "string"
          ? signal.payload.productName
          : typeof signal.payload.ingredient === "string"
            ? signal.payload.ingredient
            : "";

      return rule.keywords.some((keyword) => matchKeyword(text, keyword));
    });

    if (matches.length === 0) {
      continue;
    }

    const matchCount = ingredientTexts.filter((text) =>
      rule.keywords.some((keyword) => matchKeyword(text, keyword)),
    ).length;

    let confidence = rule.baseConfidence + Math.min(0.35, matchCount * 0.04);

    for (const boost of LOCALE_CUISINE_BOOSTS) {
      if (boost.cuisineLabel !== rule.cuisineLabel) {
        continue;
      }
      const countryOk =
        !boost.countryCodes ||
        boost.countryCodes.some((code) => locale.countryCodes.includes(code));
      const languageOk =
        !boost.languageCodes ||
        boost.languageCodes.some((code) => locale.languageCodes.includes(code));
      if (countryOk && languageOk) {
        confidence += boost.boost;
      }
    }

    for (const signal of matches) {
      hypotheses = upsertHypothesis(
        hypotheses,
        context.householdId,
        "cuisine_affinity",
        rule.cuisineLabel,
        signal.id,
        confidence,
      );
    }
  }

  for (const rule of DIETARY_TENDENCY_RULES) {
    const matches = context.signals.filter((signal) => {
      const text =
        typeof signal.payload.productName === "string"
          ? signal.payload.productName
          : typeof signal.payload.ingredient === "string"
            ? signal.payload.ingredient
            : "";

      return rule.keywords.some((keyword) => matchKeyword(text, keyword));
    });

    if (matches.length === 0) {
      continue;
    }

    for (const signal of matches) {
      hypotheses = upsertHypothesis(
        hypotheses,
        context.householdId,
        "dietary_tendency",
        rule.tendencyLabel,
        signal.id,
        rule.baseConfidence,
      );
    }
  }

  hypotheses = applyHypothesisDecay(hypotheses);

  return {
    ...base,
    hypotheses,
    lastInferredAt: new Date().toISOString(),
  };
}

/** Read-only projection for engines — never expose as user-facing facts. */
export function getActiveHypothesesByDomain(
  store: HouseholdHypothesisStore,
  domain: HouseholdHypothesisStore["hypotheses"][number]["domain"],
  minConfidence = 0.4,
) {
  return store.hypotheses
    .filter(
      (item) =>
        item.domain === domain &&
        item.status === "active" &&
        item.confidence >= minConfidence,
    )
    .sort((a, b) => b.confidence - a.confidence);
}
