import { Check, Play, RefreshCw, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import type { Lang } from "@fitness-ai/core/types";
import type { WorkoutExercise } from "../../domain/models";
import { ACTIVITY_LOG_STRINGS } from "../../fitnessBrain/activity";
import { useActivityLog } from "../../hooks/useActivityLog";
import { appLangToBrainLocale } from "../../fitnessBrain/i18n/strings";
import { useDailyPlan } from "../../hooks/useDailyPlan";
import { useFitnessBrain } from "../../hooks/useFitnessBrain";
import { useTodayWorkout } from "../../hooks/useTodayWorkout";
import { GBtn, GCard, ScreenLoading, ScreenPage, TabScreenHeader } from "@fitness-ai/shared/components";
import { T } from "@fitness-ai/shared/i18n/translations";
import { GLASS } from "@fitness-ai/shared/styles/design";
import { ActivityLogFlow } from "./ActivityLogFlow";

export function WorkoutScreen({ lang, onReturn }: { lang: Lang; onReturn?: () => void }) {
  const { plan, loading: planLoading } = useDailyPlan();
  const brainLocale = appLangToBrainLocale(lang);
  const { state, loading: brainLoading } = useFitnessBrain(brainLocale);
  const { exercises: loggedExercises, toggleExercise, loading: workoutLoading } = useTodayWorkout();
  const { logActivity, repeatLast, canQuickRepeat, lastActivityLabel, todaySummary } = useActivityLog();
  const [started, setStarted] = useState(false);
  const [showLogFlow, setShowLogFlow] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [sessionExercises, setSessionExercises] = useState<WorkoutExercise[]>([]);
  const t = T[lang];
  const workout = plan?.workout;
  const strings = ACTIVITY_LOG_STRINGS;

  useEffect(() => {
    if (workout?.exercises?.length) {
      setSessionExercises(workout.exercises);
    } else if (loggedExercises.length) {
      setSessionExercises(loggedExercises);
    }
  }, [workout?.exercises, loggedExercises]);

  const exercises = sessionExercises;
  const total = exercises.length;
  const completed = exercises.filter((e) => e.done).length;
  const progress = total ? (completed / total) * 100 : 0;

  const handleToggle = async (id: string, done: boolean) => {
    setSessionExercises((prev) => prev.map((e) => (e.id === id ? { ...e, done } : e)));
    const inRepo = loggedExercises.some((e) => e.id === id);
    if (inRepo) await toggleExercise(id, done);
  };
  const handleSaved = () => {
    setSavedToast(true);
    window.setTimeout(() => setSavedToast(false), 2500);
  };

  if (planLoading || workoutLoading || brainLoading) return <ScreenLoading lang={lang} />;

  const recoveryNote = plan?.recoveryNote ?? state?.recovery.summary;
  const nextRec = state?.training.detail;

  return (
    <>
      <ScreenPage dir={t.dir as "ltr" | "rtl"}>
        <TabScreenHeader
          lang={lang}
          question={lang === "ar" ? "ماذا تتمرن اليوم؟" : lang === "de" ? "Was trainierst du heute?" : "What are you training today?"}
          title={t.workout}
          onBack={onReturn}
          backLabel={t.backToToday}
        />

        {savedToast ? (
          <GCard
            className="mb-4 px-4 py-3 text-sm font-semibold text-emerald-300"
            style={{ border: "1px solid rgba(16,185,129,0.25)", background: "rgba(16,185,129,0.08)" }}
          >
            {strings.saved}
          </GCard>
        ) : null}

        <GCard className="mb-4 p-5" style={GLASS}>
          <p className="text-sm font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
            {strings.logActivity}
          </p>
          <p className="mt-1 text-xs text-white/45">
            {todaySummary.count > 0
              ? `${todaySummary.count} heute · ${todaySummary.totalMinutes} Min.`
              : strings.emptyLogHint}
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <GBtn className="w-full" onClick={() => setShowLogFlow(true)}>
              {strings.logActivity}
            </GBtn>
            {canQuickRepeat && lastActivityLabel ? (
              <button
                type="button"
                onClick={() => {
                  if (repeatLast()) handleSaved();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-white/80 transition-all active:scale-[0.98]"
                style={GLASS}
              >
                <RotateCcw size={16} />
                {strings.repeatLast}
                <span className="text-white/40">· {lastActivityLabel}</span>
              </button>
            ) : null}
          </div>
        </GCard>

        {recoveryNote ? (
          <GCard className="mb-4 p-4" style={{ ...GLASS, border: "1px solid rgba(16,185,129,0.12)" }}>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-400/80">
              {lang === "de" ? "Erholung" : lang === "ar" ? "التعافي" : "Recovery impact"}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/70">{recoveryNote}</p>
          </GCard>
        ) : null}

        <GCard
          className="mb-4 p-6"
          style={{
            background: "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(239,68,68,0.06))",
            border: "1px solid rgba(245,158,11,0.2)",
          }}
        >
          <p className="text-xl font-black text-white" style={{ fontFamily: "var(--font-display)" }}>
            {workout?.title ?? "Today's session"}
          </p>
          <p className="mt-1 text-sm text-white/50">{workout?.subtitle}</p>
          <p className="mt-3 text-sm leading-relaxed text-white/60">{workout?.focus}</p>

          <div className="mt-5 flex items-center justify-between text-sm">
            <span className="text-white/45">
              {completed}/{total} {lang === "ar" ? "مكتمل" : lang === "de" ? "erledigt" : "done"}
            </span>
            <span className="font-bold text-amber-400">{Math.round(progress)}%</span>
          </div>
          <div className="mt-2 h-2 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${progress}%`, background: "linear-gradient(90deg, #F59E0B, #EF4444)" }}
            />
          </div>

          <div className="mt-5">
            <GBtn
              className="w-full"
              onClick={() => setStarted(!started)}
              style={{
                background: started
                  ? "linear-gradient(135deg, #EF4444, #DC2626)"
                  : "linear-gradient(135deg, #F59E0B, #EF4444)",
              }}
            >
              {started ? <RefreshCw size={18} /> : <Play size={18} />}
              {started
                ? lang === "de"
                  ? "Pause"
                  : "Pause"
                : lang === "de"
                  ? "Starten"
                  : "Start workout"}
            </GBtn>
          </div>
        </GCard>

        {nextRec ? (
          <GCard className="mb-5 p-4" style={GLASS}>
            <p className="text-xs font-bold uppercase tracking-wider text-white/35">
              {lang === "de" ? "Fitness Brain · heute" : lang === "ar" ? "التوصية" : "Fitness Brain · today"}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/65">{nextRec}</p>
          </GCard>
        ) : null}

        <div className="flex flex-col gap-3">
          {exercises.map((ex, i) => (
            <button
              key={ex.id}
              type="button"
              onClick={() => handleToggle(ex.id, !ex.done)}
              className="w-full text-left"
              aria-pressed={ex.done}
            >
              <GCard
                className="flex items-center gap-4 p-4"
                style={
                  ex.done
                    ? { border: "1px solid rgba(16,185,129,0.2)", background: "rgba(16,185,129,0.05)" }
                    : GLASS
                }
              >
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl"
                  style={{ background: ex.done ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.06)" }}
                >
                  {ex.done ? (
                    <Check size={18} style={{ color: "#10B981" }} />
                  ) : (
                    <span className="text-sm font-bold text-white/40">{i + 1}</span>
                  )}
                </div>
                <div>
                  <p className="font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
                    {ex.name}
                  </p>
                  <p className="text-xs text-white/40">{ex.detail}</p>
                </div>
              </GCard>
            </button>
          ))}
        </div>
      </ScreenPage>

      {showLogFlow ? (
        <ActivityLogFlow
          onClose={() => setShowLogFlow(false)}
          onSave={(input) => {
            const entry = logActivity(input);
            if (entry) handleSaved();
            return !!entry;
          }}
        />
      ) : null}
    </>
  );
}
