import { useState } from "react";
import type { Lang } from "@fitness-ai/core/types";
import type { BrainCompletenessFactorId } from "../../fitnessBrain/lifestyle";
import {
  exportBrainData,
  getPrivacyDisclaimer,
  grantConsent,
  hasConsent,
  loadConsentRecords,
  resetLocalBrainData,
} from "../../fitnessBrain/privacy";
import { requestBrainRefresh } from "../../hooks/useFitnessBrain";
import { appLangToBrainLocale, getBrainExplainer } from "../../fitnessBrain/i18n/strings";
import { GBtn, GCard } from "@fitness-ai/shared/components";
import { GLASS } from "@fitness-ai/shared/styles/design";

const FACTOR_LABELS: Record<BrainCompletenessFactorId, { en: string; de: string; ar: string }> = {
  profile_core: { en: "Basic profile", de: "Basisprofil", ar: "الملف الأساسي" },
  goal_defined: { en: "Goal", de: "Ziel", ar: "الهدف" },
  body_measurements: { en: "Body measurements", de: "Körpermaße", ar: "قياسات الجسم" },
  lifestyle_work: { en: "Work & daily life", de: "Arbeit & Alltag", ar: "العمل والحياة" },
  lifestyle_training: { en: "Training preferences", de: "Training", ar: "التدريب" },
  lifestyle_sleep: { en: "Sleep rhythm", de: "Schlaf", ar: "النوم" },
  lifestyle_food: { en: "Food preferences", de: "Ernährung", ar: "التغذية" },
  training_habits_known: { en: "Training habits", de: "Trainingsgewohnheiten", ar: "عادات التدريب" },
  nutrition_habits_known: { en: "Nutrition logs", de: "Ernährungs-Logs", ar: "سجلات التغذية" },
  sleep_habits_known: { en: "Sleep patterns", de: "Schlafmuster", ar: "أنماط النوم" },
};

type Factor = { id: BrainCompletenessFactorId; filled: boolean; partial: boolean };

export function ProfilePrivacySection({
  lang,
  brainScore,
  factors,
  onBrainReset,
}: {
  lang: Lang;
  brainScore: number | null;
  factors: Factor[];
  onBrainReset?: () => void;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const consentGranted =
    hasConsent("lifestyle_setup") && hasConsent("behavior_tracking");
  const disclaimer = getPrivacyDisclaimer(lang === "de" ? "de" : "en");
  const brainCopy = getBrainExplainer(appLangToBrainLocale(lang));

  const label = (id: BrainCompletenessFactorId) =>
    FACTOR_LABELS[id]?.[lang] ?? FACTOR_LABELS[id]?.en ?? id;

  const handleExport = () => {
    const bundle = exportBrainData();
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fitness-brain-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage(lang === "de" ? "Export gestartet." : "Export started.");
  };

  const handleDelete = () => {
    resetLocalBrainData("all_brain_data");
    requestBrainRefresh();
    onBrainReset?.();
    setMessage(lang === "de" ? "Brain-Daten gelöscht." : "Brain data deleted.");
  };

  const handleResetBrain = () => {
    resetLocalBrainData("all_brain_data", { resetInstallationId: true });
    requestBrainRefresh();
    onBrainReset?.();
    setMessage(lang === "de" ? "Fitness Brain zurückgesetzt." : "Fitness Brain reset.");
  };

  const handleConsent = () => {
    grantConsent("core_profile");
    grantConsent("lifestyle_setup");
    grantConsent("behavior_tracking");
    grantConsent("food_preferences");
    setMessage(lang === "de" ? "Einwilligung gespeichert." : "Consent saved.");
  };

  const known = factors.filter((f) => f.filled);
  const improvable = factors.filter((f) => !f.filled);

  return (
    <>
      <p className="mb-3 px-1 text-xs font-bold uppercase tracking-widest text-white/30">
        {brainScore !== null && brainScore >= 100
          ? lang === "de"
            ? "Fitness Brain Status"
            : "Fitness Brain Status"
          : lang === "de"
            ? "Fitness Brain"
            : "Fitness Brain"}
      </p>

      <GCard className="mb-5 p-5" style={GLASS}>
        {brainScore !== null ? (
          <>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-white/70">
                {lang === "de" ? "Profilkontext" : lang === "ar" ? "سياق الملف" : "Profile context"}
              </span>
              <span className="text-lg font-black text-white" style={{ fontFamily: "var(--font-display)" }}>
                {brainScore}%
              </span>
            </div>
            <p className="mb-4 text-xs leading-relaxed text-white/40">
              {lang === "ar"
                ? `Fitness Brain يستخدم ${brainScore}% من سياق ملفك المتاح.`
                : brainCopy.profileCompletenessBody(brainScore)}
            </p>
            {known.length > 0 ? (
              <div className="mb-3">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-400/80">
                  {lang === "ar" ? "مُؤخذ بالفعل في الاعتبار" : brainCopy.brainKnowsLabel}
                </p>
                <ul className="space-y-1">
                  {known.map((f) => (
                    <li key={f.id} className="text-xs text-white/55">
                      ✓ {label(f.id)}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {improvable.length > 0 ? (
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-white/35">
                  {lang === "ar" ? "يمكن إثراؤه" : brainCopy.canImproveLabel}
                </p>
                <ul className="space-y-1">
                  {improvable.map((f) => (
                    <li key={f.id} className="text-xs text-white/40">
                      · {label(f.id)}
                      {f.partial ? (lang === "de" ? " (teilweise)" : " (partial)") : ""}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        ) : null}
      </GCard>

      <p className="mb-3 px-1 text-xs font-bold uppercase tracking-widest text-white/30">
        {lang === "de" ? "Datenschutz" : lang === "ar" ? "الخصوصية" : "Privacy"}
      </p>

      <GCard className="mb-5 overflow-hidden">
        <p className="border-b border-white/5 px-5 py-4 text-xs leading-relaxed text-white/45">{disclaimer}</p>

        <PrivacyRow
          label={lang === "de" ? "Daten exportieren" : "Export data"}
          onClick={handleExport}
        />
        <PrivacyRow
          label={lang === "de" ? "Brain-Daten löschen" : "Delete Brain data"}
          onClick={handleDelete}
          danger
        />
        <PrivacyRow
          label={lang === "de" ? "Fitness Brain zurücksetzen" : "Reset Fitness Brain"}
          onClick={handleResetBrain}
          danger
        />
        <div className="border-t border-white/5 px-5 py-4">
          <p className="mb-3 text-sm font-semibold text-white/75">
            {lang === "de" ? "Einwilligung" : "Consent"}
          </p>
          <p className="mb-3 text-xs text-white/40">
            {consentGranted
              ? lang === "de"
                ? "Lokale Speicherung für Lifestyle & Logs ist aktiv."
                : "Local storage for lifestyle and logs is active."
              : lang === "de"
                ? "Erlaube lokale Speicherung für wissenschaftlich fundierte Empfehlungen."
                : "Allow local storage for science-based recommendations."}
          </p>
          {!consentGranted ? (
            <GBtn sm onClick={handleConsent}>
              {lang === "de" ? "Zustimmen" : "Grant consent"}
            </GBtn>
          ) : (
            <p className="text-xs text-emerald-400/80">
              {loadConsentRecords().filter((r) => r.granted).length}{" "}
              {lang === "de" ? "Bereiche aktiv" : "scopes active"}
            </p>
          )}
        </div>
      </GCard>

      {message ? <p className="mb-4 text-center text-xs text-cyan-400/80">{message}</p> : null}
    </>
  );
}

function PrivacyRow({ label, onClick, danger }: { label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full border-b border-white/5 px-5 py-4 text-left text-sm font-semibold transition-opacity hover:opacity-80"
      style={{ color: danger ? "rgba(248,113,113,0.85)" : "rgba(255,255,255,0.75)" }}
    >
      {label}
    </button>
  );
}
