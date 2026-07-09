import { BookOpen, Sparkles } from "lucide-react";
import type { Lang } from "@fitness-ai/core/types";
import { useCoachInsights } from "../../hooks/useCoachInsights";
import { appLangToBrainLocale, getBrainExplainer } from "../../fitnessBrain/i18n/strings";
import { GCard, ScreenLoading, ScreenPage, TabScreenHeader } from "@fitness-ai/shared/components";
import { T } from "@fitness-ai/shared/i18n/translations";
import { GLASS, GRAD, GRAD_SOFT } from "@fitness-ai/shared/styles/design";

const TONE_LABEL: Record<string, { en: string; de: string; ar: string }> = {
  motivation: { en: "Decision", de: "Entscheidung", ar: "قرار" },
  nutrition: { en: "Nutrition", de: "Ernährung", ar: "تغذية" },
  recovery: { en: "Recovery", de: "Erholung", ar: "تعافٍ" },
  workout: { en: "Training", de: "Training", ar: "تمرين" },
};

export function CoachScreen({
  lang,
  onReturn,
}: {
  lang: Lang;
  onReturn?: () => void;
}) {
  const { insights, loading } = useCoachInsights();
  const t = T[lang];
  const brainCopy = getBrainExplainer(appLangToBrainLocale(lang));

  if (loading) return <ScreenLoading lang={lang} />;

  return (
    <ScreenPage dir={t.dir as "ltr" | "rtl"}>
      <TabScreenHeader
        lang={lang}
        question={
          lang === "ar"
            ? "لماذا يبدو اليوم هكذا؟"
            : lang === "de"
              ? "Warum sieht heute so aus?"
              : "Why does today look like this?"
        }
        title={t.coach}
        onBack={onReturn}
        backLabel={t.backToToday}
      />

      <GCard className="mb-6 flex gap-3 p-4" style={{ ...GLASS, border: "1px solid rgba(139,92,246,0.15)" }}>
        <BookOpen size={18} className="mt-0.5 flex-shrink-0 text-violet-300" />
        <p className="text-sm leading-relaxed text-white/55">
          {lang === "ar"
            ? "اليوم يخبرك ماذا تفعل. المدرب يشرح كيف جمع Fitness Brain جسمك واستقلابك وتعافيك وتغذيتك وتدريبك وأهدافك — بقواعد علمية."
            : brainCopy.coachIntro}
        </p>
      </GCard>

      <div className="flex flex-col gap-3">
        {insights.map((item, index) => {
          const label = TONE_LABEL[item.tone]?.[lang] ?? item.tone;
          return (
            <GCard
              key={item.id}
              className="p-5"
              style={
                index === 0
                  ? { background: GRAD_SOFT, border: "1px solid rgba(139,92,246,0.22)" }
                  : GLASS
              }
            >
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: GRAD }}>
                  <Sparkles size={14} className="text-white" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-violet-300/90">{label}</span>
              </div>
              <p className="mb-2 font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
                {item.title}
              </p>
              <p className="text-sm leading-relaxed text-white/70">{item.body}</p>
              {item.explanation?.steps && item.explanation.steps.length > 1 ? (
                <ul className="mt-3 space-y-1 border-t border-white/5 pt-3">
                  {item.explanation.steps.map((step) => (
                    <li key={step.label} className="text-xs leading-relaxed text-white/40">
                      {step.value}
                    </li>
                  ))}
                </ul>
              ) : null}
            </GCard>
          );
        })}
      </div>
    </ScreenPage>
  );
}
