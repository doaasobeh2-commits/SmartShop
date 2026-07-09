import { Droplets, Plus } from "lucide-react";

import type { Lang } from "@fitness-ai/core/types";

import { buildNutritionAssistantView } from "../../fitnessBrain/presentation";

import { buildFitnessBrainUserData } from "../../fitnessBrain/buildBrainInput";

import { runBrainPipeline } from "../../fitnessBrain/pipeline";

import { nutritionRepository } from "../../data/repositories/mockRepositories";

import { useTodayMeals } from "../../hooks/useTodayMeals";

import { useUserProfile } from "../../hooks/useUserProfile";

import { formatKcal, formatLiters } from "../../utils/formatters";

import { GBtn, GCard, ScreenEmpty, ScreenLoading, ScreenPage, TabScreenHeader } from "@fitness-ai/shared/components";

import { T } from "@fitness-ai/shared/i18n/translations";

import { GLASS, GRAD_SOFT } from "@fitness-ai/shared/styles/design";

import { useEffect, useState } from "react";

import type { NutritionAssistantView } from "../../fitnessBrain/presentation";

import { MealLogFlow } from "./MealLogFlow";



export function NutritionScreen({ lang, onReturn }: { lang: Lang; onReturn?: () => void }) {

  const { meals, loading: mealsLoading } = useTodayMeals();

  const { profile } = useUserProfile();

  const [view, setView] = useState<NutritionAssistantView | null>(null);

  const [loading, setLoading] = useState(true);

  const [showMealLog, setShowMealLog] = useState(false);

  const t = T[lang];



  useEffect(() => {

    let active = true;

    setLoading(true);

    buildFitnessBrainUserData().then((userData) => {

      if (!active) return;

      const { state } = runBrainPipeline(userData, { appProfile: profile ?? undefined });

      setView(buildNutritionAssistantView(state, userData, meals));

      setLoading(false);

    });

    return () => {

      active = false;

    };

  }, [meals, profile]);



  if (loading || mealsLoading || !view) return <ScreenLoading lang={lang} />;



  const unknownLabel =

    lang === "ar" ? "غير مسجل" : lang === "de" ? "Nicht erfasst" : "Not logged";

  const waitingLabel =

    lang === "ar" ? "بانتظار البيانات" : lang === "de" ? "Warte auf Daten" : "Waiting for data";



  const calPct =

    view.calories.known && view.calories.eaten !== undefined && view.calories.goal > 0

      ? Math.min((view.calories.eaten / view.calories.goal) * 100, 100)

      : undefined;

  const proteinPct =

    view.protein.known && view.protein.eaten !== undefined && view.protein.goal > 0

      ? Math.min((view.protein.eaten / view.protein.goal) * 100, 100)

      : undefined;

  const waterPct =

    view.water.known && view.water.consumed !== undefined && view.water.goal > 0

      ? Math.min((view.water.consumed / view.water.goal) * 100, 100)

      : undefined;



  const logWater = async (liters: number) => {

    await nutritionRepository.addWater(liters);

  };



  return (

    <>

      <ScreenPage dir={t.dir as "ltr" | "rtl"}>

        <TabScreenHeader

          lang={lang}

          question={

            lang === "ar"

              ? "مساعد التغذية"

              : lang === "de"

                ? "Dein Ernährungs-Assistent"

                : "Your nutrition assistant"

          }

          title={t.nutrition}

          onBack={onReturn}

          backLabel={t.backToToday}

          action={

            <GBtn sm outline onClick={() => setShowMealLog(true)}>

              <Plus size={16} />

              {lang === "ar" ? "إضافة" : lang === "de" ? "Hinzufügen" : "Log food"}

            </GBtn>

          }

        />



        <GCard className="mb-4 p-5" style={{ background: GRAD_SOFT, border: "1px solid rgba(0,102,255,0.18)" }}>

          <p className="text-xs font-bold uppercase tracking-widest text-cyan-400/80">

            {lang === "ar" ? "تركيز اليوم" : lang === "de" ? "Heutiger Fokus" : "Today's focus"}

          </p>

          <p className="mt-2 font-black text-white" style={{ fontFamily: "var(--font-display)" }}>

            {view.focusTitle}

          </p>

          <p className="mt-2 text-sm leading-relaxed text-white/60">{view.focusHint}</p>

          {view.quietHint ? (

            <p className="mt-3 text-xs leading-relaxed text-white/35">{view.quietHint}</p>

          ) : null}

          {view.gapMessages.length > 0 ? (

            <p className="mt-2 text-xs leading-relaxed text-white/30">{view.gapMessages[0]}</p>

          ) : null}

        </GCard>



        <GCard className="mb-5 p-5" style={GLASS}>

          <div className="grid grid-cols-2 gap-4">

            <MacroCell

              label={t.calories}

              value={

                view.calories.known && view.calories.remaining !== undefined

                  ? formatKcal(view.calories.remaining)

                  : unknownLabel

              }

              sub={lang === "de" ? "übrig" : "left"}

              pct={calPct}

              color="#0066FF"

            />

            <MacroCell

              label="Protein"

              value={

                view.protein.known && view.protein.remaining !== undefined

                  ? `${view.protein.remaining}g`

                  : unknownLabel

              }

              sub={lang === "de" ? "übrig" : "left"}

              pct={proteinPct}

              color="#8B5CF6"

            />

            <MacroCell

              label={lang === "de" ? "Kohlenhydrate" : "Carbs"}

              value={`${view.carbs.goal}g`}

              sub={lang === "de" ? "Ziel" : "goal"}

              pct={undefined}

              color="#06B6D4"

              hideBar

            />

            <MacroCell

              label={lang === "de" ? "Fett" : "Fat"}

              value={`${view.fat.goal}g`}

              sub={lang === "de" ? "Ziel" : "goal"}

              pct={undefined}

              color="#F59E0B"

              hideBar

            />

          </div>

          <div className="mt-4 border-t border-white/5 pt-4">

            <div className="mb-2 flex items-center justify-between">

              <div className="flex items-center gap-2 text-sm text-white/60">

                <Droplets size={16} className="text-cyan-400" />

                {t.water}

              </div>

              <span className="text-sm font-bold text-white">

                {view.water.known && view.water.consumed !== undefined

                  ? `${formatLiters(view.water.consumed)} / ${formatLiters(view.water.goal)}`

                  : unknownLabel}

              </span>

            </div>

            {waterPct !== undefined ? (

              <div className="mb-3 h-2 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>

                <div

                  className="h-full rounded-full"

                  style={{ width: `${waterPct}%`, background: "#06B6D4" }}

                />

              </div>

            ) : (

              <p className="mb-3 text-xs text-white/35">{waitingLabel}</p>

            )}

            <div className="flex flex-wrap gap-2">

              {[0.25, 0.5, 1].map((l) => (

                <button

                  key={l}

                  type="button"

                  onClick={() => void logWater(l)}

                  className="rounded-xl px-3 py-2 text-xs font-bold text-white transition-all active:scale-95"

                  style={GLASS}

                >

                  +{formatLiters(l)}

                </button>

              ))}

            </div>

          </div>

        </GCard>



        <p className="mb-3 px-1 text-xs font-bold uppercase tracking-widest text-white/30">

          {lang === "ar" ? "جدول الوجبات" : lang === "de" ? "Mahlzeiten heute" : "Meal timeline"}

        </p>



        {meals.length === 0 ? (

          <ScreenEmpty

            message={

              lang === "de"

                ? "Noch keine Mahlzeiten — Fitness Brain braucht Logs, bevor Ernährung bewertet werden kann."

                : "No meals logged yet — Fitness Brain needs meal data before nutrition can be analyzed."

            }

            action={

              <GBtn sm outline onClick={() => setShowMealLog(true)}>

                {t.logFirstMeal}

              </GBtn>

            }

          />

        ) : (

          <div className="flex flex-col gap-3">

            {meals.map((meal) => (

              <GCard key={meal.id} className="p-4" style={GLASS}>

                <div className="flex items-start justify-between gap-3">

                  <div>

                    <p className="font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>

                      {meal.name}

                    </p>

                    <p className="text-xs text-white/40">{meal.timeLabel}</p>

                    {meal.proteinG ? (

                      <p className="mt-1 text-xs text-white/35">{meal.proteinG}g protein</p>

                    ) : null}

                  </div>

                  <span className="text-sm font-bold text-white/80">{meal.kcal} kcal</span>

                </div>

              </GCard>

            ))}

            <button

              type="button"

              className="py-2 text-sm font-semibold text-cyan-400"

              onClick={() => setShowMealLog(true)}

            >

              + {lang === "ar" ? "إضافة وجبة" : lang === "de" ? "Mahlzeit hinzufügen" : "Add a meal"}

            </button>

          </div>

        )}

      </ScreenPage>



      {showMealLog ? (

        <MealLogFlow

          lang={lang}

          onClose={() => setShowMealLog(false)}

          onSave={(input) => {

            void nutritionRepository.addMeal(input);

            return true;

          }}

        />

      ) : null}

    </>

  );

}



function MacroCell({

  label,

  value,

  sub,

  pct,

  color,

  hideBar,

}: {

  label: string;

  value: string;

  sub: string;

  pct?: number;

  color: string;

  hideBar?: boolean;

}) {

  return (

    <div>

      <p className="text-xs text-white/40">{label}</p>

      <p className="mt-1 text-xl font-black text-white" style={{ fontFamily: "var(--font-display)" }}>

        {value}

        <span className="ml-1 text-xs font-medium text-white/35">{sub}</span>

      </p>

      {!hideBar && pct !== undefined ? (

        <div className="mt-2 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>

          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />

        </div>

      ) : null}

    </div>

  );

}


