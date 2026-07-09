import { ChevronRight, Dumbbell, Sparkles, Zap } from "lucide-react";

import type { Lang, MainTab } from "@fitness-ai/core/types";

import { useDailyPlan } from "../../hooks/useDailyPlan";

import { useFitnessBrain } from "../../hooks/useFitnessBrain";

import { useUserProfile } from "../../hooks/useUserProfile";

import { appLangToBrainLocale, getBrainExplainer } from "../../fitnessBrain/i18n/strings";

import { formatKcal, formatLiters } from "../../utils/formatters";

import { GCard } from "@fitness-ai/shared/components/fitness/GCard";

import { ProgressRing } from "@fitness-ai/shared/components/fitness/ProgressRing";

import { ScreenLoading, ScreenPage } from "@fitness-ai/shared/components";

import { greetingKey, T } from "@fitness-ai/shared/i18n/translations";

import { GLASS, GRAD, GRAD_SOFT } from "@fitness-ai/shared/styles/design";



type TodayScreenProps = {

  lang: Lang;

  onGoTo?: (tab: MainTab) => void;

};



export function TodayScreen({ lang, onGoTo }: TodayScreenProps) {

  const { plan, loading } = useDailyPlan();

  const { profile } = useUserProfile();

  const brainLocale = appLangToBrainLocale(lang);
  const brainCopy = getBrainExplainer(brainLocale);
  const { smartFocus, smartFocusLabel, loading: brainLoading } = useFitnessBrain(brainLocale);

  const t = T[lang];

  const hour = new Date().getHours();

  const greet = greetingKey(lang, hour);

  const name = profile?.displayName?.trim() || (lang === "de" ? "du" : "there");



  if (loading || !plan || brainLoading || !smartFocus) {

    return <ScreenLoading lang={lang} />;

  }



  const { nutrition, workout } = plan;

  const caloriesKnown = nutrition.caloriesKnown !== false;
  const waterKnown = nutrition.waterKnown !== false;
  const proteinKnown = nutrition.proteinKnown !== false;

  const eatenPct =
    caloriesKnown && nutrition.eatenKcal !== undefined && nutrition.goalKcal > 0
      ? Math.round((nutrition.eatenKcal / nutrition.goalKcal) * 100)
      : undefined;

  const waterPct =
    waterKnown && nutrition.waterLiters !== undefined && nutrition.waterGoalLiters > 0
      ? Math.min(Math.round((nutrition.waterLiters / nutrition.waterGoalLiters) * 100), 100)
      : undefined;

  const proteinPct =
    proteinKnown && nutrition.proteinGoalG && nutrition.proteinEatenG !== undefined
      ? Math.min(Math.round((nutrition.proteinEatenG / nutrition.proteinGoalG) * 100), 100)
      : undefined;

  const unknownLabel =
    lang === "ar" ? "غير مسجل" : lang === "de" ? "Nicht erfasst" : "Not logged";
  const waitingLabel =
    lang === "ar" ? "بانتظار البيانات" : lang === "de" ? "Warte auf Daten" : "Waiting for data";



  return (

    <ScreenPage dir={t.dir as "ltr" | "rtl"}>

      <p className="mb-1 text-sm text-white/40">

        {lang === "ar" ? "ماذا أفعل اليوم؟" : lang === "de" ? "Was soll ich heute tun?" : "What should I do today?"}

      </p>

      <h1 className="mb-6 text-2xl font-black text-white" style={{ fontFamily: "var(--font-display)" }}>

        {greet}, {name}

      </h1>



      <GCard

        className="mb-4 p-5"

        style={{ background: GRAD_SOFT, border: "1px solid rgba(139,92,246,0.25)" }}

      >

        <div className="mb-3 flex items-center gap-2">

          <Zap size={16} className="text-violet-300" />

          <p className="text-xs font-bold uppercase tracking-widest text-violet-300/90">

            {smartFocusLabel}

          </p>

        </div>

        <p className="mb-2 font-black text-white" style={{ fontFamily: "var(--font-display)" }}>

          {smartFocus.title}

        </p>

        <p className="text-sm leading-relaxed text-white/75">{smartFocus.message}</p>

        <p className="mt-3 text-xs leading-relaxed text-white/40">{smartFocus.reason}</p>

        <p className="mt-2 text-xs leading-relaxed text-white/30">{brainCopy.todayRecommendationFooter}</p>

      </GCard>



      <GCard className="mb-4 p-5" style={GLASS}>

        <p className="mb-4 text-xs font-bold uppercase tracking-widest text-white/40">

          {lang === "ar" ? "تقدم اليوم" : lang === "de" ? "Heutiger Fortschritt" : "Today's progress"}

        </p>

        <div className="flex items-center gap-5">

          <ProgressRing progress={eatenPct} size={88} sw={8} color="#0066FF">

            <div className="text-center">

              <p className="text-lg font-black leading-none text-white" style={{ fontFamily: "var(--font-display)" }}>

                {caloriesKnown && nutrition.remainingKcal !== undefined
                  ? formatKcal(nutrition.remainingKcal)
                  : unknownLabel}

              </p>

              <p className="mt-0.5 text-[10px] text-white/40">

                {lang === "ar" ? "سعرات" : lang === "de" ? "kcal" : "kcal left"}

              </p>

            </div>

          </ProgressRing>

          <div className="min-w-0 flex-1 space-y-3">

            <div>

              <div className="mb-1 flex justify-between text-xs text-white/45">

                <span>{t.water}</span>

                <span className="font-semibold text-white/70">

                  {waterKnown && nutrition.waterLiters !== undefined
                    ? `${formatLiters(nutrition.waterLiters)} / ${formatLiters(nutrition.waterGoalLiters)}`
                    : unknownLabel}

                </span>

              </div>

              {waterPct !== undefined ? (
              <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>

                <div

                  className="h-full rounded-full transition-all"

                  style={{ width: `${waterPct}%`, background: "#06B6D4" }}

                />

              </div>
              ) : (
                <p className="text-[10px] text-white/30">{waitingLabel}</p>
              )}

            </div>

            <div>

              <div className="mb-1 flex justify-between text-xs text-white/45">

                <span>{lang === "de" ? "Protein" : "Protein"}</span>

                <span className="font-semibold text-white/70">

                  {proteinKnown && nutrition.proteinEatenG !== undefined
                    ? `${nutrition.proteinEatenG}g / ${nutrition.proteinGoalG}g`
                    : unknownLabel}

                </span>

              </div>

              {proteinPct !== undefined ? (
              <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>

                <div

                  className="h-full rounded-full transition-all"

                  style={{ width: `${proteinPct}%`, background: "#8B5CF6" }}

                />

              </div>
              ) : (
                <p className="text-[10px] text-white/30">{waitingLabel}</p>
              )}

            </div>

          </div>

        </div>

      </GCard>



      <button type="button" onClick={() => onGoTo?.("workout")} className="mb-4 w-full text-left">

        <GCard className="p-5" style={GLASS}>

          <div className="flex items-center gap-4">

            <div

              className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl"

              style={{ background: GRAD, boxShadow: "0 4px 16px rgba(0,102,255,0.35)" }}

            >

              <Dumbbell size={22} className="text-white" />

            </div>

            <div className="min-w-0 flex-1">

              <p className="text-xs font-bold uppercase tracking-wider text-cyan-400/80">

                {lang === "ar" ? "الخطوة التالية" : lang === "de" ? "Nächster Schritt" : "Next action"}

              </p>

              <p className="font-black text-white" style={{ fontFamily: "var(--font-display)" }}>

                {workout.title}

              </p>

              <p className="text-sm text-white/45">{workout.subtitle}</p>

            </div>

            <ChevronRight size={18} className="text-white/30" aria-hidden />

          </div>

        </GCard>

      </button>



      <button type="button" onClick={() => onGoTo?.("coach")} className="w-full text-left">

        <GCard className="flex items-center gap-3 p-4" style={{ ...GLASS, border: "1px solid rgba(139,92,246,0.12)" }}>

          <Sparkles size={16} className="flex-shrink-0 text-violet-300/80" />

          <p className="flex-1 text-sm text-white/55">

            {lang === "ar"

              ? "كيف تم اشتقاق هذه التوصية؟ المدرب يشرح العوامل."

              : brainCopy.coachLink}

          </p>

          <ChevronRight size={16} className="text-white/25" aria-hidden />

        </GCard>

      </button>

    </ScreenPage>

  );

}


