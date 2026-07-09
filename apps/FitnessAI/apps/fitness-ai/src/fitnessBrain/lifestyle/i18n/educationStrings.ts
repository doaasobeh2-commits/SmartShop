/**
 * One-time lifestyle education copy — German default.
 * Describes rule-based Fitness Brain — not AI learning marketing.
 */

export type LifestyleEducationLocale = "de" | "en" | "ar" | "tr" | "uk" | "fa";

export type LifestyleEducationCopy = {
  title: string;
  intro: string;
  bullets: string[];
  closing: string;
  dailyLoggingTitle: string;
  dailyLoggingItems: string[];
  philosophy: string;
};

const DE: LifestyleEducationCopy = {
  title: "Einmal einrichten — präzisere Regeln",
  intro:
    "Fitness Brain kombiniert Körperprofil, Stoffwechsel, Ernährung, Training, Erholung und Lifestyle. Je vollständiger dein Profil, desto präziser arbeiten die wissenschaftlichen Regeln.",
  bullets: [
    "Profilangaben werden einmal gespeichert und können jederzeit angepasst werden.",
    "Tägliches Loggen bleibt kurz: Training, Mahlzeiten, Wasser — optional Schlaf und Gewicht.",
    "Aus deinen Logs erkennt Fitness Brain wiederkehrende Muster (z. B. Trainingstage, Hydration) und fließt sie in die Entscheidungsregeln ein.",
  ],
  closing: "Ziel: verlässliche Empfehlungen mit minimalem täglichen Aufwand.",
  dailyLoggingTitle: "Was du meistens nur kurz loggst",
  dailyLoggingItems: ["Training", "Mahlzeiten", "Wasser", "Gewicht (gelegentlich)", "Schlaf (bis Wearables verfügbar sind)"],
  philosophy:
    "FitnessAI ist kein Dateneingabe-Tool. Fitness Brain berechnet Ziele und Empfehlungen — du lieferst nur die Fakten, die es braucht.",
};

const EN: LifestyleEducationCopy = {
  title: "Set up once — more precise rules",
  intro:
    "Fitness Brain combines body profile, metabolism, nutrition, training, recovery, and lifestyle. The more complete your profile, the more precisely the scientific rules can apply.",
  bullets: [
    "Profile details are stored once and can be edited anytime.",
    "Daily logging stays short: workouts, meals, water — optionally sleep and weight.",
    "From your logs, Fitness Brain detects recurring patterns (e.g. training days, hydration) and applies them in the decision rules.",
  ],
  closing: "Goal: reliable recommendations with minimal daily effort.",
  dailyLoggingTitle: "What you usually log quickly",
  dailyLoggingItems: ["Workout", "Meals", "Water", "Weight (occasionally)", "Sleep (until wearables are supported)"],
  philosophy:
    "FitnessAI is not a data-entry app. Fitness Brain calculates targets and recommendations — you provide the facts it needs.",
};

export const LIFESTYLE_EDUCATION: Record<LifestyleEducationLocale, LifestyleEducationCopy> = {
  de: DE,
  en: EN,
  ar: { ...DE, title: "" },
  tr: { ...DE, title: "" },
  uk: { ...DE, title: "" },
  fa: { ...DE, title: "" },
};

export function getLifestyleEducation(locale: LifestyleEducationLocale = "de"): LifestyleEducationCopy {
  const pack = LIFESTYLE_EDUCATION[locale];
  if (pack.title) return pack;
  return LIFESTYLE_EDUCATION.de;
}
