/**
 * German UI copy for optional one-time lifestyle setup.
 * Structure ready for: en, ar, tr, uk, fa.
 */

export type LifestyleSetupLocale = "de" | "en" | "ar" | "tr" | "uk" | "fa";

export type LifestyleSetupStrings = {
  entryTitle: string;
  entrySubtitle: string;
  brainProfileLabel: string;
  skip: string;
  back: string;
  continue: string;
  save: string;
  stepOf: (current: number, total: number) => string;
  steps: { title: string; subtitle: string }[];
  work: {
    occupationLabel: string;
    occupations: { id: string; label: string }[];
    scheduleLabel: string;
    schedules: { id: string; label: string }[];
    hoursLabel: string;
    hoursUnit: string;
  };
  training: {
    sportsLabel: string;
    daysLabel: string;
    timeLabel: string;
    times: { id: string; label: string }[];
    weekdayShort: string[];
  };
  sleep: {
    bedtimeLabel: string;
    wakeLabel: string;
  };
  food: {
    preferencesLabel: string;
    preferencesHint: string;
    allergiesLabel: string;
    allergiesHint: string;
    dislikedLabel: string;
    dislikedHint: string;
  };
  final: {
    title: string;
    message: string;
  };
};

const DE: LifestyleSetupStrings = {
  entryTitle: "Fitness Brain Profil vervollständigen",
  entrySubtitle:
    "Lifestyle-Angaben verbessern, wie präzise Stoffwechsel-, Ernährungs- und Trainingsregeln auf dich angewendet werden.",
  brainProfileLabel: "Fitness Brain Profil",
  skip: "Überspringen",
  back: "Zurück",
  continue: "Weiter",
  save: "Speichern",
  stepOf: (c, t) => `Schritt ${c} von ${t}`,
  steps: [
    {
      title: "Arbeit & Alltag",
      subtitle: "Hilft Fitness Brain, Aktivitätslevel und Tagesrhythmus regelbasiert einzuschätzen.",
    },
    {
      title: "Training",
      subtitle: "Was du gern machst — und wann es meistens passt.",
    },
    {
      title: "Schlaf",
      subtitle: "Dein üblicher Rhythmus — keine tägliche Eingabe nötig.",
    },
    {
      title: "Ernährung",
      subtitle: "Optional. Alles kannst du später ändern.",
    },
    {
      title: "Fertig",
      subtitle: "Danke — du musst das nicht täglich wiederholen.",
    },
  ],
  work: {
    occupationLabel: "Beruf / Alltag",
    occupations: [
      { id: "office", label: "Büro" },
      { id: "standing", label: "Stehend" },
      { id: "physical", label: "Körperlich" },
      { id: "mixed", label: "Gemischt" },
    ],
    scheduleLabel: "Arbeitsrhythmus",
    schedules: [
      { id: "regular_daytime", label: "Tagsüber" },
      { id: "evening", label: "Abends" },
      { id: "night_shift", label: "Nachtschicht" },
      { id: "rotating_shifts", label: "Wechselnd" },
    ],
    hoursLabel: "Durchschnittliche Arbeitsstunden",
    hoursUnit: "Std. / Tag",
  },
  training: {
    sportsLabel: "Lieblingssportarten",
    daysLabel: "Gewohnte Trainingstage",
    timeLabel: "Bevorzugte Trainingszeit",
    times: [
      { id: "morning", label: "Morgen" },
      { id: "midday", label: "Mittag" },
      { id: "evening", label: "Abend" },
      { id: "flexible", label: "Flexibel" },
    ],
    weekdayShort: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
  },
  sleep: {
    bedtimeLabel: "Gewöhnliche Schlafenszeit",
    wakeLabel: "Gewöhnliche Aufwachzeit",
  },
  food: {
    preferencesLabel: "Ernährungspräferenzen",
    preferencesHint: "z. B. vegetarisch, low carb — optional",
    allergiesLabel: "Allergien",
    allergiesHint: "optional, kommagetrennt",
    dislikedLabel: "Lebensmittel, die ich nicht mag",
    dislikedHint: "optional, kommagetrennt",
  },
  final: {
    title: "Danke!",
    message:
      "Diese Angaben fließen in die Regeln für Stoffwechsel, Erholung, Ernährung und Training ein. Du musst sie nicht täglich wiederholen.",
  },
};

export const LIFESTYLE_SETUP_STRINGS: Record<LifestyleSetupLocale, LifestyleSetupStrings> = {
  de: DE,
  en: {
    ...DE,
    entryTitle: "Complete Fitness Brain profile",
    entrySubtitle:
      "Lifestyle details help apply metabolism, nutrition, and training rules more precisely to you.",
    brainProfileLabel: "Fitness Brain profile",
    skip: "Skip",
    back: "Back",
    continue: "Continue",
    save: "Save",
    stepOf: (c, t) => `Step ${c} of ${t}`,
    final: {
      title: "Thank you!",
      message:
        "This information feeds into metabolism, recovery, nutrition, and training rules. You do not need to enter it daily.",
    },
  },
  ar: DE,
  tr: DE,
  uk: DE,
  fa: DE,
};

export function getLifestyleSetupStrings(locale: LifestyleSetupLocale = "de"): LifestyleSetupStrings {
  const pack = LIFESTYLE_SETUP_STRINGS[locale];
  if (locale === "de" || locale === "en") return pack;
  return pack.entryTitle ? pack : LIFESTYLE_SETUP_STRINGS.de;
}

/** User-facing German labels for activity library IDs. */
export const ACTIVITY_LABELS_DE: Record<string, string> = {
  strength_training: "Krafttraining",
  bodybuilding: "Bodybuilding",
  crossfit: "CrossFit",
  martial_arts: "Kampfsport",
  running: "Laufen",
  walking: "Gehen",
  swimming: "Schwimmen",
  cycling: "Radfahren",
  rowing: "Rudern",
  football: "Fußball",
  basketball: "Basketball",
  tennis: "Tennis",
  badminton: "Badminton",
  volleyball: "Volleyball",
  yoga: "Yoga",
  pilates: "Pilates",
  stretching: "Dehnen",
  boxing: "Boxen",
  kickboxing: "Kickboxen",
  mma: "MMA",
  judo: "Judo",
  hiking: "Wandern",
  climbing: "Klettern",
  dance: "Tanzen",
};

export function activityLabelDe(activityId: string): string {
  return ACTIVITY_LABELS_DE[activityId] ?? activityId;
}
