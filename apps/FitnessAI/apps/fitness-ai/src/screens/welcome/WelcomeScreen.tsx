import { ArrowRight, Sparkles } from "lucide-react";

import type { Lang } from "@fitness-ai/core/types";

import { GBtn } from "@fitness-ai/shared/components/fitness/GBtn";

import { T } from "@fitness-ai/shared/i18n/translations";

import { appLangToBrainLocale, getBrainExplainer } from "../../fitnessBrain/i18n/strings";

import { GRAD } from "@fitness-ai/shared/styles/design";



export function WelcomeScreen({

  lang,

  onStart,

  onLogin,

}: {

  lang: Lang;

  onStart: () => void;

  onLogin: () => void;

}) {

  const t = T[lang];
  const brainCopy = getBrainExplainer(appLangToBrainLocale(lang));

  return (

    <div

      className="relative flex min-h-full flex-col px-6 pb-8 pt-6"

      dir={t.dir}

      style={{ background: "radial-gradient(ellipse 100% 60% at 50% 0%, #0A1F4D 0%, #050A14  60%)" }}

    >

      <div

        className="pointer-events-none absolute top-20 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full opacity-20"

        style={{ background: "radial-gradient(circle, #0066FF 0%, transparent 70%)", filter: "blur(40px)" }}

      />



      <div className="relative z-10 flex flex-1 flex-col items-center justify-center text-center">

        <div

          className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl"

          style={{ background: GRAD, boxShadow: "0 8px 40px rgba(0,102,255,0.5)" }}

        >

          <Sparkles size={40} className="text-white" />

        </div>



        <h1 className="mb-3 text-4xl font-black tracking-tight text-white" style={{ fontFamily: "var(--font-display)" }}>

          {t.appName}

        </h1>

        <p className="mb-8 max-w-xs text-base leading-relaxed text-white/50">{t.tagline}</p>



        <p className="mb-2 max-w-sm text-sm font-semibold leading-relaxed text-white/70">

          {lang === "ar"

            ? "توجيه يومي — بدون تعقيد حياتك."

            : brainCopy.welcomeLead}

        </p>

        <p className="mb-10 max-w-sm text-sm leading-relaxed text-white/40">

          {lang === "ar"

            ? "Fitness Brain يحلل ملفك، استقلابك، التغذية، التدريب، التعافي ونمط حياتك — كل توصية مبنية على قواعد علمية وأهدافك."

            : brainCopy.welcomeBody}

        </p>



        <GBtn onClick={onStart} className="mb-4 w-full">

          {t.getStarted} <ArrowRight size={18} />

        </GBtn>

        <button type="button" onClick={onLogin} className="text-sm font-medium text-white/50 transition-colors hover:text-white/80">

          {lang === "ar" ? "لديك حساب؟" : lang === "de" ? "Bereits Mitglied?" : "Already a member?"}{" "}

          <span style={{ color: "#06B6D4" }}>{t.login}</span>

        </button>

      </div>

    </div>

  );

}


