import { useEffect, useState } from "react";
import { ArrowRight, Check, ChevronLeft } from "lucide-react";
import type { Lang } from "@fitness-ai/core/types";
import { getPrimarySportOptions } from "../../fitnessBrain/i18n/sportStrings";
import type { PrimarySportId } from "../../fitnessBrain/i18n/sportStrings";
import type { ExperienceLevel } from "../../domain/models";
import { userProfileRepository } from "../../data/repositories/mockRepositories";
import {
  getLifestyleSetupStrings,
} from "../../fitnessBrain/lifestyle/i18n/setupStrings";
import { requestBrainDataRefresh } from "../../hooks/brainDataRefresh";
import { loadLifestyleProfile, updateLifestyleProfile } from "../../fitnessBrain/lifestyle";
import type {
  OccupationType,
  PreferredTrainingTime,
  WorkSchedule,
} from "../../fitnessBrain/lifestyle/lifestyleProfile";
import { GBtn } from "@fitness-ai/shared/components/fitness/GBtn";
import { GCard } from "@fitness-ai/shared/components/fitness/GCard";
import { GLASS, GRAD } from "@fitness-ai/shared/styles/design";

const TOTAL_STEPS = 5;

function parseCommaList(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function joinList(items: string[] | undefined): string {
  return items?.join(", ") ?? "";
}

type LifestyleSetupScreenProps = {
  lang: Lang;
  onClose: () => void;
  onSaved: () => void;
};

export function LifestyleSetupScreen({ lang, onClose, onSaved }: LifestyleSetupScreenProps) {
  const strings = getLifestyleSetupStrings(lang === "de" ? "de" : "en");
  const stored = loadLifestyleProfile();

  const [step, setStep] = useState(0);
  const [occupation, setOccupation] = useState<OccupationType>(
    stored.work.occupationType ?? "office",
  );
  const [schedule, setSchedule] = useState<WorkSchedule>(
    stored.work.schedule ?? "regular_daytime",
  );
  const [workHours, setWorkHours] = useState(stored.work.averageWorkingHours ?? 8);
  const [primarySport, setPrimarySport] = useState<PrimarySportId | undefined>(
    stored.training.primarySport as PrimarySportId | undefined,
  );
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | undefined>(undefined);
  const [trainingDays, setTrainingDays] = useState<number[]>(
    stored.training.usualTrainingDays ?? [1, 3, 5],
  );
  const [trainingTime, setTrainingTime] = useState<PreferredTrainingTime>(
    stored.training.preferredTrainingTime ?? "evening",
  );
  const [sessionMinutes, setSessionMinutes] = useState(
    stored.training.availableTrainingMinutes ?? 45,
  );
  const [exerciseCount, setExerciseCount] = useState(
    stored.training.preferredExerciseCount ?? 5,
  );
  const [bedtime, setBedtime] = useState(stored.sleep.usualBedtime ?? "23:00");
  const [wakeTime, setWakeTime] = useState(stored.sleep.usualWakeTime ?? "07:00");
  const [dietary, setDietary] = useState(joinList(stored.food.dietaryPreferences));
  const [allergies, setAllergies] = useState(joinList(stored.food.allergies));
  const [disliked, setDisliked] = useState(joinList(stored.food.dislikedFoods));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    userProfileRepository.getProfile().then((p) => {
      if (p.experienceLevel) setExperienceLevel(p.experienceLevel);
    });
  }, []);

  const sportOptions = getPrimarySportOptions(lang === "de" ? "de" : "en");

  const toggleDay = (day: number) => {
    setTrainingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort((a, b) => a - b),
    );
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
    else onClose();
  };

  const handleSkip = () => onClose();

  const handleSave = async () => {
    setSaving(true);
    if (experienceLevel) {
      await userProfileRepository.saveProfile({ experienceLevel });
    }
    updateLifestyleProfile({
      work: {
        occupationType: occupation,
        schedule,
        averageWorkingHours: workHours,
      },
      training: {
        ...(primarySport
          ? { primarySport, favouriteSports: [primarySport] }
          : {}),
        usualTrainingDays: trainingDays,
        preferredTrainingTime: trainingTime,
        availableTrainingMinutes: sessionMinutes,
        preferredExerciseCount: exerciseCount,
      },
      sleep: {
        usualBedtime: bedtime,
        usualWakeTime: wakeTime,
      },
      food: {
        dietaryPreferences: parseCommaList(dietary),
        allergies: parseCommaList(allergies),
        dislikedFoods: parseCommaList(disliked),
      },
      educationAcknowledged: true,
    });
    setSaving(false);
    requestBrainDataRefresh();
    onSaved();
    onClose();
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) setStep((s) => s + 1);
    else void handleSave();
  };

  const stepMeta = strings.steps[step];

  return (
    <div className="fixed inset-0 z-50 flex min-h-[var(--app-height)] flex-col bg-[#050A14]">
      <div className="flex-shrink-0 px-6 pt-4 pb-5">
        <div className="mb-5 flex items-center gap-4">
          <button
            type="button"
            onClick={handleBack}
            aria-label={strings.back}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl transition-opacity active:scale-95"
            style={GLASS}
          >
            <ChevronLeft size={20} className="text-white" />
          </button>
          <div className="flex-1">
            <div className="mb-2 flex gap-2">
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <div
                  key={i}
                  className="h-1.5 flex-1 rounded-full transition-all duration-500"
                  style={{ background: i <= step ? GRAD : "rgba(255,255,255,0.1)" }}
                />
              ))}
            </div>
            <p className="text-xs font-medium text-white/40">{strings.stepOf(step + 1, TOTAL_STEPS)}</p>
          </div>
          <button
            type="button"
            onClick={handleSkip}
            className="text-xs font-semibold text-white/45 transition-colors hover:text-white/70"
          >
            {strings.skip}
          </button>
        </div>
        <h2 className="text-2xl font-black text-white" style={{ fontFamily: "var(--font-display)" }}>
          {stepMeta.title}
        </h2>
        <p className="mt-1 text-sm text-white/40">{stepMeta.subtitle}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-4">
        {step === 0 && (
          <div className="flex flex-col gap-4">
            <GCard className="p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-white/40">
                {strings.work.occupationLabel}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {strings.work.occupations.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setOccupation(o.id as OccupationType)}
                    className="rounded-2xl py-3 text-xs font-bold text-white transition-all active:scale-95"
                    style={occupation === o.id ? { background: GRAD } : GLASS}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </GCard>

            <GCard className="p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-white/40">
                {strings.work.scheduleLabel}
              </p>
              <div className="flex flex-col gap-2">
                {strings.work.schedules.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSchedule(s.id as WorkSchedule)}
                    className="flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-bold text-white transition-all active:scale-[0.98]"
                    style={schedule === s.id ? { background: GRAD } : GLASS}
                  >
                    {s.label}
                    {schedule === s.id ? <Check size={16} /> : null}
                  </button>
                ))}
              </div>
            </GCard>

            <GCard className="p-5">
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-white/40">
                {strings.work.hoursLabel}
              </p>
              <div className="text-center">
                <p className="text-3xl font-black text-white" style={{ fontFamily: "var(--font-display)" }}>
                  {workHours}
                  <span className="ml-2 text-sm text-white/40">{strings.work.hoursUnit}</span>
                </p>
                <input
                  type="range"
                  min={4}
                  max={12}
                  value={workHours}
                  onChange={(e) => setWorkHours(+e.target.value)}
                  className="mt-3 w-full"
                  aria-label={strings.work.hoursLabel}
                />
              </div>
            </GCard>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <GCard className="p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-white/40">
                {lang === "de" ? "Trainingserfahrung" : "Training experience"}
              </p>
              <div className="grid grid-cols-1 gap-2">
                {(
                  [
                    { id: "beginner" as const, en: "Beginner", de: "Anfänger" },
                    { id: "intermediate" as const, en: "Intermediate", de: "Fortgeschritten" },
                    { id: "advanced" as const, en: "Advanced", de: "Erfahren" },
                  ] as const
                ).map((level) => (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => setExperienceLevel(level.id)}
                    className="flex items-center justify-between rounded-2xl px-3 py-2.5 text-xs font-bold text-white transition-all active:scale-95"
                    style={experienceLevel === level.id ? { background: GRAD } : GLASS}
                  >
                    <span>{lang === "de" ? level.de : level.en}</span>
                    {experienceLevel === level.id ? <Check size={14} className="flex-shrink-0" /> : null}
                  </button>
                ))}
              </div>
            </GCard>
            <GCard className="p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-white/40">
                {strings.training.sportsLabel}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {sportOptions.map((sport) => (
                  <button
                    key={sport.id}
                    type="button"
                    onClick={() => setPrimarySport(sport.id)}
                    className="flex items-center justify-between rounded-2xl px-3 py-2.5 text-xs font-bold text-white transition-all active:scale-95"
                    style={primarySport === sport.id ? { background: GRAD } : GLASS}
                  >
                    <span className="truncate pr-1">{sport.label}</span>
                    {primarySport === sport.id ? <Check size={14} className="flex-shrink-0" /> : null}
                  </button>
                ))}
              </div>
            </GCard>

            <GCard className="p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-white/40">
                {strings.training.daysLabel}
              </p>
              <div className="flex justify-between gap-1">
                {strings.training.weekdayShort.map((label, day) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold text-white transition-all active:scale-95"
                    style={trainingDays.includes(day) ? { background: GRAD } : GLASS}
                    aria-pressed={trainingDays.includes(day)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </GCard>

            <GCard className="p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-white/40">
                {strings.training.timeLabel}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {strings.training.times.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTrainingTime(t.id as PreferredTrainingTime)}
                    className="rounded-2xl py-3 text-xs font-bold text-white transition-all active:scale-95"
                    style={trainingTime === t.id ? { background: GRAD } : GLASS}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </GCard>

            <GCard className="p-5">
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-white/40">
                {lang === "de" ? "Session-Dauer" : "Session length"}
              </p>
              <div className="text-center">
                <p className="text-3xl font-black text-white" style={{ fontFamily: "var(--font-display)" }}>
                  {sessionMinutes}
                  <span className="ml-2 text-sm text-white/40">min</span>
                </p>
                <input
                  type="range"
                  min={20}
                  max={90}
                  value={sessionMinutes}
                  onChange={(e) => setSessionMinutes(+e.target.value)}
                  className="mt-3 w-full"
                  aria-label="Session length"
                />
              </div>
            </GCard>

            <GCard className="p-5">
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-white/40">
                {lang === "de" ? "Übungen pro Session" : "Exercises per session"}
              </p>
              <div className="text-center">
                <p className="text-3xl font-black text-white" style={{ fontFamily: "var(--font-display)" }}>
                  {exerciseCount}
                </p>
                <input
                  type="range"
                  min={2}
                  max={8}
                  value={exerciseCount}
                  onChange={(e) => setExerciseCount(+e.target.value)}
                  className="mt-3 w-full"
                  aria-label="Exercise count"
                />
              </div>
            </GCard>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <GCard className="p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-white/40">
                {strings.sleep.bedtimeLabel}
              </p>
              <input
                type="time"
                value={bedtime}
                onChange={(e) => setBedtime(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-lg font-bold text-white"
              />
            </GCard>
            <GCard className="p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-white/40">
                {strings.sleep.wakeLabel}
              </p>
              <input
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-lg font-bold text-white"
              />
            </GCard>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-4">
            {[
              {
                label: strings.food.preferencesLabel,
                hint: strings.food.preferencesHint,
                value: dietary,
                set: setDietary,
              },
              {
                label: strings.food.allergiesLabel,
                hint: strings.food.allergiesHint,
                value: allergies,
                set: setAllergies,
              },
              {
                label: strings.food.dislikedLabel,
                hint: strings.food.dislikedHint,
                value: disliked,
                set: setDisliked,
              },
            ].map((field) => (
              <GCard key={field.label} className="p-5">
                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-white/40">{field.label}</p>
                <p className="mb-3 text-xs text-white/30">{field.hint}</p>
                <input
                  type="text"
                  value={field.value}
                  onChange={(e) => field.set(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25"
                  placeholder={field.hint}
                />
              </GCard>
            ))}
          </div>
        )}

        {step === 4 && (
          <GCard
            className="p-6"
            style={{
              background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(0,102,255,0.08))",
              border: "1px solid rgba(139,92,246,0.2)",
            }}
          >
            <p className="mb-3 text-lg font-black text-white" style={{ fontFamily: "var(--font-display)" }}>
              {strings.final.title}
            </p>
            <p className="text-sm leading-relaxed text-white/70">{strings.final.message}</p>
          </GCard>
        )}
      </div>

      <div className="flex-shrink-0 px-6 py-6">
        <GBtn onClick={saving ? undefined : handleNext} className="w-full">
          {saving
            ? "…"
            : step < TOTAL_STEPS - 1
              ? strings.continue
              : strings.save}{" "}
          {!saving ? <ArrowRight size={18} /> : null}
        </GBtn>
      </div>
    </div>
  );
}
