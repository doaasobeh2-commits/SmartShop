import { useState } from "react";

import { ArrowRight, Check, ChevronLeft } from "lucide-react";

import type { Lang } from "@fitness-ai/core/types";

import type { Gender, UserGoal, ExperienceLevel } from "../../domain/models";

import { onboardingService, type OnboardingPath } from "../../services/onboardingService";

import {
  getPrimarySportOptions,
  type PrimarySportId,
} from "../../fitnessBrain/i18n/sportStrings";

import { GBtn } from "@fitness-ai/shared/components/fitness/GBtn";

import { GCard } from "@fitness-ai/shared/components/fitness/GCard";

import { T } from "@fitness-ai/shared/i18n/translations";

import { GLASS, GRAD } from "@fitness-ai/shared/styles/design";



const GOALS: {

  id: UserGoal;

  icon: string;

  label: string;

  de: string;

  ar: string;

  desc: string;

  deDesc: string;

  arDesc: string;

}[] = [

  {

    id: "lose",

    icon: "🔥",

    label: "Lose weight",

    de: "Abnehmen",

    ar: "خسارة الوزن",

    desc: "Sustainable fat loss with enough energy for daily life.",

    deDesc: "Nachhaltig abnehmen — mit genug Energie für den Alltag.",

    arDesc: "خسارة وزن مستدامة مع طاقة كافية للحياة اليومية.",

  },

  {

    id: "muscle",

    icon: "💪",

    label: "Build muscle",

    de: "Muskeln aufbauen",

    ar: "بناء العضلات",

    desc: "Protein and training aligned for strength and growth.",

    deDesc: "Protein und Training für Kraft und Muskelaufbau.",

    arDesc: "بروtein وتدريب متوافقان مع القوة والنمو.",

  },

  {

    id: "fit",

    icon: "⚡",

    label: "Get fit",

    de: "Fit werden",

    ar: "الحصول على لياقة",

    desc: "Balanced movement and nutrition for overall fitness.",

    deDesc: "Ausgewogene Bewegung und Ernährung für mehr Fitness.",

    arDesc: "حركة وتغذية متوازنة للياقة العامة.",

  },

  {

    id: "health",

    icon: "❤️",

    label: "Feel healthier",

    de: "Gesünder fühlen",

    ar: "صحة أفضل",

    desc: "Simple habits that support long-term wellbeing.",

    deDesc: "Einfache Gewohnheiten für langfristiges Wohlbefinden.",

    arDesc: "عادات بسيطة تدعم الصحة على المدى الطويل.",

  },

];



const PATHS: {
  id: OnboardingPath;
  icon: string;
  label: string;
  de: string;
  ar: string;
  desc: string;
  deDesc: string;
  arDesc: string;
}[] = [
  {
    id: "healthy_lifestyle",
    icon: "❤️",
    label: "Healthy lifestyle",
    de: "Gesünder leben",
    ar: "حياة صحية",
    desc: "Nutrition, hydration, and light movement — no sport program required.",
    deDesc: "Ernährung, Hydration und leichte Bewegung — kein Sportprogramm nötig.",
    arDesc: "تغذية وترطيب وحركة خفيفة — دون برنامج رياضي.",
  },
  {
    id: "beginner_exercise",
    icon: "🌱",
    label: "Beginner starting exercise",
    de: "Einsteiger im Training",
    ar: "مبتدئ في التمارين",
    desc: "Build a training habit — Fitness Brain guides you until you add a sport.",
    deDesc: "Trainingsgewohnheit aufbauen — Fitness Brain begleitet dich bis du einen Sport wählst.",
    arDesc: "بناء عادة التمرين — Fitness Brain يرشدك حتى تختار رياضة.",
  },
  {
    id: "existing_athlete",
    icon: "🏆",
    label: "Existing athlete",
    de: "Bereits sportlich aktiv",
    ar: "رياضي نشط",
    desc: "Sport-specific training, recovery, and nutrition from day one.",
    deDesc: "Sport-spezifisches Training, Erholung und Ernährung ab Tag eins.",
    arDesc: "تدريب وتعافٍ وتغذية مخصصة لرياضتك من اليوم الأول.",
  },
];



function totalStepsForPath(path: OnboardingPath | null): number {
  if (path === "healthy_lifestyle") return 3;
  if (path === "beginner_exercise") return 4;
  if (path === "existing_athlete") return 5;
  return 3;
}



function clampNum(n: number, min: number, max: number): number {

  return Math.min(Math.max(n, min), max);

}



export function OnboardingScreen({

  lang,

  onDone,

  onBack,

}: {

  lang: Lang;

  onDone: () => void;

  onBack: () => void;

}) {

  const [step, setStep] = useState(0);

  const [path, setPath] = useState<OnboardingPath | null>(null);

  const [goal, setGoal] = useState<UserGoal>("lose");

  const [primarySport, setPrimarySport] = useState<PrimarySportId | null>(null);

  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | null>(null);

  const [gender, setGender] = useState<Gender>("male");

  const [age, setAge] = useState(28);

  const [height, setHeight] = useState(175);

  const [weight, setWeight] = useState(75);

  const [saving, setSaving] = useState(false);

  const t = T[lang];

  const totalSteps = totalStepsForPath(path);

  const isLastStep =
    (path === "healthy_lifestyle" && step === 2) ||
    (path === "beginner_exercise" && step === 3) ||
    (path === "existing_athlete" && step === 4);

  const pickPath = (nextPath: OnboardingPath) => {
    setPath(nextPath);
    if (nextPath === "healthy_lifestyle") {
      setExperienceLevel(null);
      setPrimarySport(null);
    } else if (nextPath === "beginner_exercise") {
      setExperienceLevel((prev) => prev ?? "beginner");
      setPrimarySport(null);
    } else {
      setPrimarySport(null);
    }
  };

  const saveAndFinish = async () => {
    if (!path) return;
    setSaving(true);
    await onboardingService.save({
      goal,
      gender,
      age,
      heightCm: height,
      weightKg: weight,
      activityLevel: "mod",
      lang,
      path,
      ...(primarySport ? { primarySport } : {}),
      ...(experienceLevel ? { experienceLevel } : {}),
    });
    setSaving(false);
    onDone();
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
    else onBack();
  };

  const next = async () => {
    if (step === 2 && !path) return;
    if (step === 3 && !experienceLevel) return;
    if (step === 4 && !primarySport) return;

    if (isLastStep) {
      await saveAndFinish();
      return;
    }

    if (step < totalSteps - 1) {
      setStep((s) => s + 1);
    }
  };

  const steps = [

    {

      title: lang === "ar" ? "ما هدفك؟" : lang === "de" ? "Was ist dein Ziel?" : "What's your goal?",

      subtitle:

        lang === "ar"

          ? "هدف واحد فقط — يمكنك تغييره لاحقاً في الملف الشخصي."

          : lang === "de"

            ? "Nur ein Ziel — du kannst es später im Profil ändern."

            : "One goal only — you can change it anytime in Profile.",

    },

    {

      title: lang === "ar" ? "ملفك الأساسي" : lang === "de" ? "Dein Basisprofil" : "Your basics",

      subtitle:

        lang === "ar"

          ? "Fitness Brain يحسب السعرات والبروtein — لا حاجة لإدخالها."

          : lang === "de"

            ? "Fitness Brain berechnet Kalorien & Makros aus deinem Körperprofil und Stoffwechsel — nichts zu schätzen."

            : "Fitness Brain calculates calories and macros from your body profile and metabolism — nothing to guess.",

    },

    {

      title:

        lang === "ar"

          ? "أين أنت في رحلتك؟"

          : lang === "de"

            ? "Wo stehst du auf deiner Reise?"

            : "Where are you on your journey?",

      subtitle:

        lang === "ar"

          ? "Fitness Brain يتكيف مع مسارك — Lifestyle-Modus حتى تختار رياضة."

          : lang === "de"

            ? "Fitness Brain passt sich deinem Weg an — Lifestyle-Modus, bis du einen Sport wählst."

            : "Fitness Brain adapts to your path — lifestyle mode until you choose a sport.",

    },

    {

      title: lang === "ar" ? "خبرتك" : lang === "de" ? "Deine Erfahrung" : "Your experience",

      subtitle:

        lang === "de"

          ? "Fitness Brain nutzt dein Level für die Sport-Rotation — nichts wird erraten."

          : "Fitness Brain uses your level for sport rotation — nothing is guessed.",

    },

    {

      title: lang === "ar" ? "رياضتك الأساسية" : lang === "de" ? "Dein Hauptsport" : "Your primary sport",

      subtitle:

        lang === "ar"

          ? "Fitness Brain يبني تدريب اليوم على علم رياضتك — لا برنامج ثابت."

          : lang === "de"

            ? "Fitness Brain leitet dein heutiges Training aus sport-spezifischem Wissen ab — kein festes Workout."

            : "Fitness Brain builds today's training from your sport's science — not a fixed workout.",

    },

  ];

  const stepMeta = steps[step] ?? steps[0];

  const sportOptions = getPrimarySportOptions(lang === "de" ? "de" : "en");

  const continueBlocked =
    (step === 2 && !path) ||
    (step === 3 && !experienceLevel) ||
    (step === 4 && !primarySport);



  return (

    <div className="flex min-h-full flex-col bg-[#050A14]" dir={t.dir}>

      <div className="flex-shrink-0 px-6 pt-4 pb-5">

        <div className="mb-5 flex items-center gap-4">

          <button

            type="button"

            onClick={handleBack}

            aria-label={t.back}

            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl transition-opacity active:scale-95"

            style={GLASS}

          >

            <ChevronLeft size={20} className="text-white" />

          </button>

          <div className="flex-1">

            <div className="mb-2 flex gap-2">

              {Array.from({ length: totalSteps }, (_, i) => (

                <div

                  key={i}

                  className="h-1.5 flex-1 rounded-full transition-all duration-500"

                  style={{ background: i <= step ? GRAD : "rgba(255,255,255,0.1)" }}

                />

              ))}

            </div>

            <p className="text-xs font-medium text-white/40">

              {lang === "ar"

                ? `الخطوة ${step + 1} من ${totalSteps}`

                : lang === "de"

                  ? `Schritt ${step + 1} von ${totalSteps}`

                  : `Step ${step + 1} of ${totalSteps}`}

            </p>

          </div>

        </div>

        <h2 className="text-2xl font-black text-white" style={{ fontFamily: "var(--font-display)" }}>

          {stepMeta.title}

        </h2>

        <p className="mt-1 text-sm text-white/40">{stepMeta.subtitle}</p>

      </div>



      <div className="flex-1 overflow-y-auto px-6 pb-4">

        {step === 0 && (

          <>

            <p className="mb-4 text-xs leading-relaxed text-white/35">

              {lang === "ar"

                ? "يحتاج Fitness Brain هدفك لتخصيص التغذية والتدريب."

                : lang === "de"

                  ? "Fitness Brain braucht dein Ziel, um Ernährungs- und Trainingsregeln gezielt anzuwenden."

                  : "Fitness Brain needs your goal to apply nutrition and training rules to you."}

            </p>

            <div className="grid grid-cols-2 gap-3">

              {GOALS.map((g) => (

                <button

                  key={g.id}

                  type="button"

                  onClick={() => setGoal(g.id)}

                  className="flex flex-col items-start gap-2 rounded-3xl p-5 text-left transition-all active:scale-95"

                  style={goal === g.id ? { background: GRAD, boxShadow: "0 4px 24px rgba(0,102,255,0.3)" } : GLASS}

                >

                  <span className="text-3xl">{g.icon}</span>

                  <span className="text-sm font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>

                    {lang === "ar" ? g.ar : lang === "de" ? g.de : g.label}

                  </span>

                  <span className="text-xs leading-relaxed text-white/55">

                    {lang === "ar" ? g.arDesc : lang === "de" ? g.deDesc : g.desc}

                  </span>

                  {goal === g.id ? <Check size={16} className="text-white/80" /> : null}

                </button>

              ))}

            </div>

          </>

        )}



        {step === 1 && (

          <div className="flex flex-col gap-4">

            <p className="text-xs leading-relaxed text-white/35">

              {lang === "ar"

                ? "هذه القيم تُستخدم لحساب الاستقلاب — لا BMI ولا دهون الجسم."

                : lang === "de"

                  ? "Diese Werte berechnen deinen Stoffwechsel — kein BMI, keine Körperfett-Schätzung."

                  : "These values power metabolism calculations — no BMI or body fat estimates."}

            </p>



            <GCard className="p-5">

              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-white/40">{t.gender}</p>

              <div className="flex gap-2">

                {[

                  { id: "male" as const, label: lang === "ar" ? "ذكر" : lang === "de" ? "Männlich" : "Male" },

                  { id: "female" as const, label: lang === "ar" ? "أنثى" : lang === "de" ? "Weiblich" : "Female" },

                  { id: "other" as const, label: lang === "ar" ? "آخر" : lang === "de" ? "Divers" : "Other" },

                ].map((g) => (

                  <button

                    key={g.id}

                    type="button"

                    onClick={() => setGender(g.id)}

                    className="flex-1 rounded-2xl py-3.5 text-xs font-bold text-white transition-all active:scale-95"

                    style={gender === g.id ? { background: GRAD } : GLASS}

                  >

                    {g.label}

                  </button>

                ))}

              </div>

            </GCard>



            <GCard className="p-5">

              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-white/40">{t.age}</p>

              <div className="flex items-center justify-center gap-3">

                <input

                  type="number"

                  min={16}

                  max={90}

                  value={age}

                  onChange={(e) => setAge(clampNum(+e.target.value || 16, 16, 90))}

                  className="w-20 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center text-2xl font-black text-white"

                  aria-label={t.age}

                />

                <span className="text-sm text-white/40">

                  {lang === "ar" ? "سنة" : lang === "de" ? "Jahre" : "years"}

                </span>

              </div>

              <input

                type="range"

                min={16}

                max={90}

                value={age}

                onChange={(e) => setAge(+e.target.value)}

                className="mt-3 w-full"

                aria-label={t.age}

              />

            </GCard>



            <GCard className="p-5">

              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-white/40">

                {t.height} · {t.weight}

              </p>

              <div className="grid grid-cols-2 gap-4">

                <div>

                  <div className="mb-2 flex items-center justify-center gap-1">

                    <input

                      type="number"

                      min={140}

                      max={220}

                      value={height}

                      onChange={(e) => setHeight(clampNum(+e.target.value || 140, 140, 220))}

                      className="w-20 rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-center text-xl font-black text-white"

                      aria-label={t.height}

                    />

                    <span className="text-sm text-white/40">cm</span>

                  </div>

                  <input

                    type="range"

                    min={140}

                    max={220}

                    value={height}

                    onChange={(e) => setHeight(+e.target.value)}

                    className="w-full"

                    aria-label={t.height}

                  />

                </div>

                <div>

                  <div className="mb-2 flex items-center justify-center gap-1">

                    <input

                      type="number"

                      min={40}

                      max={160}

                      value={weight}

                      onChange={(e) => setWeight(clampNum(+e.target.value || 40, 40, 160))}

                      className="w-20 rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-center text-xl font-black text-white"

                      aria-label={t.weight}

                    />

                    <span className="text-sm text-white/40">kg</span>

                  </div>

                  <input

                    type="range"

                    min={40}

                    max={160}

                    value={weight}

                    onChange={(e) => setWeight(+e.target.value)}

                    className="w-full"

                    aria-label={t.weight}

                  />

                </div>

              </div>

            </GCard>



            <p className="text-xs leading-relaxed text-white/30">

              {lang === "ar"

                ? "مستوى النشاط يُقدّر لاحقاً من التدريب وسجلاتك اليومية."

                : lang === "de"

                  ? "Aktivitätslevel leitet Fitness Brain aus Training, Arbeit und Logs ab — regelbasiert."

                  : "Activity level is derived from training, work, and logs — rule-based, not guessed."}

            </p>

          </div>

        )}

        {step === 2 && (

          <div className="flex flex-col gap-4">

            <p className="text-xs leading-relaxed text-white/35">

              {lang === "de"

                ? "Gesünder leben braucht keinen Hauptsport — Fitness Brain arbeitet im Lifestyle-Modus. Sport ist nur für den Athleten-Weg Pflicht."

                : "Healthy lifestyle needs no primary sport — Fitness Brain runs in lifestyle mode. Sport is only required on the athlete path."}

            </p>

            <div className="flex flex-col gap-3">

              {PATHS.map((p) => (

                <button

                  key={p.id}

                  type="button"

                  onClick={() => pickPath(p.id)}

                  className="flex flex-col items-start gap-2 rounded-3xl p-5 text-left transition-all active:scale-95"

                  style={path === p.id ? { background: GRAD, boxShadow: "0 4px 24px rgba(0,102,255,0.3)" } : GLASS}

                >

                  <span className="text-2xl">{p.icon}</span>

                  <span className="text-sm font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>

                    {lang === "ar" ? p.ar : lang === "de" ? p.de : p.label}

                  </span>

                  <span className="text-xs leading-relaxed text-white/55">

                    {lang === "ar" ? p.arDesc : lang === "de" ? p.deDesc : p.desc}

                  </span>

                  {path === p.id ? <Check size={16} className="text-white/80" /> : null}

                </button>

              ))}

            </div>

          </div>

        )}

        {step === 3 && (

          <div className="flex flex-col gap-4">

            <p className="text-xs leading-relaxed text-white/35">

              {lang === "de"

                ? "Dein Trainingslevel steuert die Sport-Rotation — Fitness Brain erfindet nichts."

                : "Your training level drives sport rotation — Fitness Brain never guesses."}

            </p>

            <GCard className="p-5">

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

                    className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold text-white transition-all active:scale-95"

                    style={experienceLevel === level.id ? { background: GRAD } : GLASS}

                  >

                    <span>{lang === "de" ? level.de : level.en}</span>

                    {experienceLevel === level.id ? <Check size={14} /> : null}

                  </button>

                ))}

              </div>

            </GCard>

          </div>

        )}



        {step === 4 && (

          <div className="flex flex-col gap-4">

            <p className="text-xs leading-relaxed text-white/35">

              {lang === "de"

                ? "Wähle einen Hauptsport — Training, Erholung und Ernährung folgen den Regeln dieser Sportart."

                : "Choose one primary sport — training, recovery, and nutrition follow that sport's rules."}

            </p>

            <GCard className="p-5">

              <div className="grid grid-cols-2 gap-2">

                {sportOptions.map((sport) => (

                  <button

                    key={sport.id}

                    type="button"

                    onClick={() => setPrimarySport(sport.id)}

                    className="flex items-center justify-between rounded-2xl px-3 py-3 text-xs font-bold text-white transition-all active:scale-95"

                    style={primarySport === sport.id ? { background: GRAD } : GLASS}

                  >

                    <span className="truncate pr-1">{sport.label}</span>

                    {primarySport === sport.id ? <Check size={14} className="flex-shrink-0" /> : null}

                  </button>

                ))}

              </div>

            </GCard>

          </div>

        )}

      </div>



      <div className="flex-shrink-0 px-6 py-6">

        <GBtn
          onClick={next}
          className="w-full"
          style={continueBlocked ? { opacity: 0.45, pointerEvents: "none" } : undefined}
        >

          {saving

            ? t.loading

            : isLastStep

              ? lang === "ar"

                ? "ابدأ"

                : lang === "de"

                  ? "Los geht's"

                  : "Start today"

              : t.continue}{" "}

          {!saving ? <ArrowRight size={18} /> : null}

        </GBtn>

      </div>

    </div>

  );

}


