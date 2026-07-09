/** German default — activity logging UI. */

export const ACTIVITY_LOG_STRINGS = {
  logActivity: "Aktivität loggen",
  repeatLast: "Letztes Training wiederholen",
  saved: "Gespeichert — fließt in Erholung, Training und Tagesentscheidung ein.",
  emptyLogHint: "Unter 10 Sekunden — fließt in Erholung und die heutige Empfehlung ein.",
  searchPlaceholder: "Aktivität suchen…",
  stepDuration: "Dauer",
  stepIntensity: "Intensität",
  stepNote: "Notiz (optional)",
  stepNoteHint: "Max. 150 Zeichen — keine medizinischen Angaben.",
  done: "Fertig",
  back: "Zurück",
  customDuration: "Eigene",
  minutes: "Min.",
  intensity: {
    light: "Leicht",
    moderate: "Moderat",
    hard: "Hart",
  },
  durations: [15, 30, 45, 60, 90] as const,
};
