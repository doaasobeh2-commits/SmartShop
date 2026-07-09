/**
 * Fitness Brain UI strings — German default.
 * Structure ready for: en, ar, tr, uk, fa (future locales).
 */

export type FitnessBrainLocale = "de" | "en" | "ar" | "tr" | "uk" | "fa";

export type LocalizedDailyAction = {
  title: string;
  message: string;
  reason: string;
};

export type FitnessBrainUiStrings = {
  smartFocusLabel: string;
  actions: Record<
    string,
    {
      title: string;
      message: string;
      reason: string;
    }
  >;
};

const DE_ACTIONS: FitnessBrainUiStrings["actions"] = {
  overtraining_risk: {
    title: "Erholung hat Priorität",
    message: "Mehrere Trainingstage hintereinander — heute lieber leichte Bewegung oder Pause.",
    reason: "{{consecutiveDays}} Tage in Folge trainiert — Belastung langsam steigern.",
  },
  recovery_rest: {
    title: "Erholung zuerst",
    message: "Dein Körper braucht heute eher Regeneration als Intensität.",
    reason: "Erholungssignal niedrig (Score {{recoveryScore}}).",
  },
  hydration_critical: {
    title: "Wasser dringend nachfüllen",
    message: "Du bist deutlich unter deinem Trinkziel — jetzt ein Glas Wasser.",
    reason: "Nur {{waterPct}} % deines Hydrationsziels erreicht.",
  },
  hydration_focus: {
    title: "Wasser nachfüllen",
    message: "Trink jetzt ein Glas Wasser — du bist unter deinem Tagesziel.",
    reason: "Noch {{waterRemainingL}} L bis zum Ziel.",
  },
  protein_low: {
    title: "Protein fehlt deutlich",
    message: "Heute war wenig Protein dabei — beim nächsten Essen darauf achten.",
    reason: "Etwa {{proteinRemainingG}} g fehlen noch zum Tagesziel.",
  },
  protein_focus: {
    title: "Protein im Blick",
    message: "Beim Abendessen auf eine proteinreiche Mahlzeit achten.",
    reason: "Etwa {{proteinRemainingG}} g Protein fehlen noch.",
  },
  missed_workout: {
    title: "Training nachholen?",
    message: "Ein geplantes Training wurde übersprungen — kurze Einheit reicht oft.",
    reason: "Geplanter Trainingstag ohne Abschluss.",
  },
  calorie_off_track: {
    title: "Kalorien im Blick",
    message: "Dein Tagesziel weicht deutlich ab — beim nächsten Essen bewusst wählen.",
    reason: "{{calorieProgressPct}} % des Kalorienziels — Ziel neu ausrichten.",
  },
  calorie_balance: {
    title: "Kalorien im Gleichgewicht",
    message: "Noch {{caloriesRemainingKcal}} kcal übrig — bewusst und satt essen.",
    reason: "Du näherst dich deinem Tagesziel.",
  },
  complete_workout: {
    title: "Training heute",
    message: "Dein Plan: {{workoutTitle}} — ruhig starten und sauber abschließen.",
    reason: "Trainingstag mit ausreichender Erholung.",
  },
  movement_day: {
    title: "Leichte Bewegung",
    message: "{{activityTitle}} — locker halten, Konsistenz zählt.",
    reason: "Heute steht Regeneration oder leichte Aktivität im Plan.",
  },
  steady_progress: {
    title: "Einfach dranbleiben",
    message: "Ein Schritt reicht: eine Mahlzeit loggen oder Wasser trinken.",
    reason: "Kleine Konstanz schlägt Perfektion.",
  },
  post_activity_hydration: {
    title: "Nach dem Training trinken",
    message: "Deine heutige Aktivität braucht mehr Flüssigkeit — jetzt Wasser nachfüllen.",
    reason: "Nur {{waterPct}} % deines Hydrationsziels — erhöhter Bedarf nach Aktivität.",
  },
  post_activity_protein: {
    title: "Protein nach der Aktivität",
    message: "Nach deiner Einheit lohnt sich eine proteinreiche Mahlzeit oder ein Snack.",
    reason: "Etwa {{proteinRemainingG}} g Protein fehlen noch — Aktivität erhöht Priorität.",
  },
  post_activity_fuel: {
    title: "Energie nachladen",
    message: "Deine Einheit braucht passende Energie — Kohlenhydrate oder ausgewogene Mahlzeit.",
    reason: "Aktivitätsbedarf erkannt — Ernährung daran anpassen.",
  },
  collect_nutrition_evidence: {
    title: "Ernährung loggen",
    message: "Heutige Mahlzeiten fehlen — ohne Logs kann Fitness Brain deine Ernährung nicht bewerten.",
    reason: "Collect → Analyze → Recommend: Mahlzeitdaten sind für die Analyse erforderlich.",
  },
  collect_hydration_evidence: {
    title: "Trinken loggen",
    message: "Hydration ist unbekannt — fehlende Einträge werden nicht als 0 % interpretiert.",
    reason: "Collect → Analyze → Recommend: Trinkmenge muss erfasst sein, bevor Hydration bewertet wird.",
  },
  collect_sleep_evidence: {
    title: "Schlaf erfassen",
    message: "Erholung kann nicht vollständig bewertet werden — Schlafdaten fehlen.",
    reason: "Unbekannter Schlaf ≠ schlechter Schlaf. Logge Schlaf für die Erholungsanalyse.",
  },
  collect_primary_sport_evidence: {
    title: "Hauptsport wählen",
    message: "Kein Hauptsport gesetzt — Fitness Brain arbeitet im Lifestyle-Modus, bis du eine Sportart wählst.",
    reason: "Collect → Analyze → Recommend: Hauptsport ist für sport-spezifisches Training erforderlich.",
  },
  collect_experience_evidence: {
    title: "Erfahrungslevel angeben",
    message: "Trainingserfahrung ist unbekannt — Programmrotation braucht dein explizites Level.",
    reason: "Erfahrung wird nie auf Anfänger oder Fortgeschritten defaulted.",
  },
};

export const FITNESS_BRAIN_STRINGS: Record<FitnessBrainLocale, FitnessBrainUiStrings> = {
  de: {
    smartFocusLabel: "Heutige Empfehlung",
    actions: DE_ACTIONS,
  },
  en: {
    smartFocusLabel: "Today's recommendation",
    actions: {
      overtraining_risk: {
        title: "Recovery priority",
        message: "Several training days in a row — light movement or rest today.",
        reason: "{{consecutiveDays}} consecutive training days logged.",
      },
      recovery_rest: {
        title: "Recovery first",
        message: "Your body likely needs regeneration more than intensity today.",
        reason: "Low recovery signal (score {{recoveryScore}}).",
      },
      hydration_critical: {
        title: "Hydrate now",
        message: "You're well below your water target — have a glass now.",
        reason: "Only {{waterPct}}% of hydration goal reached.",
      },
      hydration_focus: {
        title: "Top up water",
        message: "Have a glass of water — you're below today's hydration target.",
        reason: "{{waterRemainingL}} L remaining to goal.",
      },
      protein_low: {
        title: "Protein is low",
        message: "Protein intake is low today — focus on it at your next meal.",
        reason: "About {{proteinRemainingG}} g protein remaining.",
      },
      protein_focus: {
        title: "Protein check",
        message: "Aim for a protein-rich dinner tonight.",
        reason: "About {{proteinRemainingG}} g protein remaining.",
      },
      missed_workout: {
        title: "Missed session?",
        message: "A planned workout was skipped — a short session still counts.",
        reason: "Scheduled training day without completion.",
      },
      calorie_off_track: {
        title: "Calories off track",
        message: "Your daily target is significantly off — choose mindfully next meal.",
        reason: "{{calorieProgressPct}}% of calorie target.",
      },
      calorie_balance: {
        title: "Calorie balance",
        message: "{{caloriesRemainingKcal}} kcal left — eat mindfully and satisfied.",
        reason: "You're approaching your daily energy target.",
      },
      complete_workout: {
        title: "Train today",
        message: "Your plan: {{workoutTitle}} — start calm, finish strong.",
        reason: "Training day with adequate recovery.",
      },
      movement_day: {
        title: "Light movement",
        message: "{{activityTitle}} — keep it easy; consistency wins.",
        reason: "Recovery or light activity is planned today.",
      },
      steady_progress: {
        title: "Stay consistent",
        message: "One step is enough: log a meal or drink water.",
        reason: "Small consistency beats perfection.",
      },
      post_activity_hydration: {
        title: "Hydrate after activity",
        message: "Today's session increased fluid needs — top up with water now.",
        reason: "Only {{waterPct}}% of hydration goal — elevated need after activity.",
      },
      post_activity_protein: {
        title: "Protein after activity",
        message: "After your session, a protein-rich meal or snack supports recovery.",
        reason: "About {{proteinRemainingG}} g protein remaining — activity raised priority.",
      },
      post_activity_fuel: {
        title: "Refuel after activity",
        message: "Your session needs matching energy — carbs or a balanced meal.",
        reason: "Activity requirement detected — align nutrition accordingly.",
      },
      collect_nutrition_evidence: {
        title: "Log today's meals",
        message: "Today's meals are incomplete — Fitness Brain cannot evaluate nutrition without logs.",
        reason: "Collect → Analyze → Recommend: meal data is required before analysis.",
      },
      collect_hydration_evidence: {
        title: "Log water intake",
        message: "Hydration is unknown — missing entries are not treated as 0%.",
        reason: "Collect → Analyze → Recommend: water must be logged before hydration is assessed.",
      },
      collect_sleep_evidence: {
        title: "Record sleep",
        message: "Recovery cannot be fully evaluated — sleep data has not been recorded.",
        reason: "Unknown sleep ≠ poor sleep. Log sleep to enable recovery analysis.",
      },
      collect_primary_sport_evidence: {
        title: "Choose primary sport",
        message: "No primary sport set — Fitness Brain operates in lifestyle mode until you choose one.",
        reason: "Collect → Analyze → Recommend: primary sport is required for sport-specific training.",
      },
      collect_experience_evidence: {
        title: "Set training experience",
        message: "Training experience is unknown — program rotation requires your explicit level.",
        reason: "Experience is never defaulted to beginner or intermediate.",
      },
    },
  },
  ar: { smartFocusLabel: "", actions: {} },
  tr: { smartFocusLabel: "", actions: {} },
  uk: { smartFocusLabel: "", actions: {} },
  fa: { smartFocusLabel: "", actions: {} },
};

function interpolate(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(params[key] ?? ""));
}

export function localizeDailyAction(
  actionId: string,
  params: Record<string, string | number>,
  locale: FitnessBrainLocale = "de",
): LocalizedDailyAction {
  const pack =
    FITNESS_BRAIN_STRINGS[locale]?.actions[actionId] ??
    FITNESS_BRAIN_STRINGS.de.actions[actionId] ??
    FITNESS_BRAIN_STRINGS.de.actions.steady_progress;

  return {
    title: pack.title,
    message: interpolate(pack.message, params),
    reason: interpolate(pack.reason, params),
  };
}

export function getSmartFocusLabel(locale: FitnessBrainLocale = "de"): string {
  return FITNESS_BRAIN_STRINGS[locale]?.smartFocusLabel || FITNESS_BRAIN_STRINGS.de.smartFocusLabel;
}

/** Calm, scientific copy describing how Fitness Brain works — not AI marketing. */
export type BrainExplainerCopy = {
  todayRecommendationFooter: string;
  coachIntro: string;
  coachLink: string;
  welcomeLead: string;
  welcomeBody: string;
  activityLogSaved: string;
  profileCompletenessTitle: string;
  profileCompletenessBody: (score: number) => string;
  brainKnowsLabel: string;
  canImproveLabel: string;
  nutritionFocusHint: string;
};

const BRAIN_EXPLAINER_DE: BrainExplainerCopy = {
  todayRecommendationFooter:
    "Fitness Brain analysiert Körperprofil, Stoffwechsel, Ernährung, Training, Erholung und Lifestyle — und leitet daraus ab, was dir heute am meisten nützt.",
  coachIntro:
    "Heute zeigt dir die Empfehlung. Coach erklärt, wie Fitness Brain Körper, Stoffwechsel, Erholung, Ernährung, Training und deine Ziele kombiniert hat — regelbasiert, wissenschaftlich fundiert.",
  coachLink: "Wie wurde diese Empfehlung abgeleitet? Coach erklärt die Faktoren.",
  welcomeLead: "Tägliche Orientierung — ohne Überforderung.",
  welcomeBody:
    "Fitness Brain analysiert dein Körperprofil, deinen Stoffwechsel, Ernährung, Training, Erholung und Lifestyle. Jede Empfehlung basiert auf wissenschaftlichen Regeln und deinen persönlichen Zielen — kein Chatbot.",
  activityLogSaved: "Gespeichert — fließt in Erholung, Training und Tagesentscheidung ein.",
  profileCompletenessTitle: "Profilkontext für Fitness Brain",
  profileCompletenessBody: (score) =>
    `Fitness Brain nutzt ${score}% des verfügbaren Profilkontexts. Vollständigere Angaben zu Lifestyle und Gewohnheiten verbessern die Genauigkeit der Regeln — ohne täglichen Mehraufwand.`,
  brainKnowsLabel: "Bereits berücksichtigt",
  canImproveLabel: "Noch ergänzbar",
  nutritionFocusHint:
    "Ziele und Makros berechnet Fitness Brain aus deinem Profil und Stoffwechsel — du loggst nur Mahlzeiten.",
};

const BRAIN_EXPLAINER_EN: BrainExplainerCopy = {
  todayRecommendationFooter:
    "Fitness Brain analyzes your body profile, metabolism, nutrition, training, recovery, and lifestyle to determine what benefits you most today.",
  coachIntro:
    "Today shows the recommendation. Coach explains how Fitness Brain combined body, metabolism, recovery, nutrition, training, and your goals — rule-based and grounded in science.",
  coachLink: "How was this recommendation derived? Coach explains the factors.",
  welcomeLead: "Daily guidance — without overwhelm.",
  welcomeBody:
    "Fitness Brain analyzes your body profile, metabolism, nutrition, training, recovery, and lifestyle. Every recommendation follows scientific rules and your personal goals — not a chatbot.",
  activityLogSaved: "Saved — included in recovery, training, and today's decision.",
  profileCompletenessTitle: "Profile context for Fitness Brain",
  profileCompletenessBody: (score) =>
    `Fitness Brain uses ${score}% of available profile context. More lifestyle and habit details improve rule accuracy — without daily extra effort.`,
  brainKnowsLabel: "Already factored in",
  canImproveLabel: "Can still be enriched",
  nutritionFocusHint:
    "Fitness Brain calculates targets from your profile and metabolism — you only log meals.",
};

export function getBrainExplainer(locale: FitnessBrainLocale = "de"): BrainExplainerCopy {
  if (locale === "en") return BRAIN_EXPLAINER_EN;
  return BRAIN_EXPLAINER_DE;
}

export function appLangToBrainLocale(lang: string): FitnessBrainLocale {
  if (lang === "de") return "de";
  if (lang === "en") return "en";
  return "de";
}
