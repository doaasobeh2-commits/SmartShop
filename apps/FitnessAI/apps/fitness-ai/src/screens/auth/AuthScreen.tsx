import { useState } from "react";

import { Eye, EyeOff, Sparkles } from "lucide-react";

import type { Lang } from "@fitness-ai/core/types";

import { ensureUserProfileFromAuth } from "../../data/repositories/mockRepositories";

import { BackHeader, GBtn } from "@fitness-ai/shared/components";

import { T } from "@fitness-ai/shared/i18n/translations";

import { GRAD } from "@fitness-ai/shared/styles/design";



export function AuthScreen({

  lang,

  onDone,

  onBack,

}: {

  lang: Lang;

  onDone: () => void;

  onBack: () => void;

}) {

  const [tab, setTab] = useState<"login" | "register">("login");

  const [showPass, setShowPass] = useState(false);

  const [email, setEmail] = useState("");

  const [displayName, setDisplayName] = useState("");

  const [error, setError] = useState("");

  const t = T[lang];



  const submit = () => {

    if (!email.trim()) {

      setError(t.emailRequired);

      return;

    }

    setError("");

    ensureUserProfileFromAuth(email.trim(), tab === "register" ? displayName : undefined);

    onDone();

  };



  return (

    <div className="flex min-h-full flex-col bg-[#050A14] px-6 pb-8" dir={t.dir}>

      <BackHeader lang={lang} onBack={onBack} />



      <div className="mb-8">

        <div

          className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"

          style={{ background: GRAD, boxShadow: "0 4px 20px rgba(0,102,255,0.4)" }}

        >

          <Sparkles size={24} className="text-white" />

        </div>

        <h1 className="text-3xl font-black text-white" style={{ fontFamily: "var(--font-display)" }}>

          {tab === "login"

            ? lang === "ar"

              ? "مرحباً بعودتك"

              : lang === "de"

                ? "Willkommen zurück"

                : "Welcome back"

            : lang === "ar"

              ? "إنشاء حساب"

              : lang === "de"

                ? "Konto erstellen"

                : "Create account"}

        </h1>

        <p className="mt-1 text-sm text-white/40">

          {lang === "ar" ? "سجّل دخولك للمتابعة" : lang === "de" ? "Melde dich an" : "Sign in to see your plan for today"}

        </p>

        <p className="mt-3 rounded-2xl px-4 py-3 text-xs leading-relaxed text-amber-200/75" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)" }}>

          {lang === "ar"

            ? "نسخة تجريبية مغلقة — الحساب محلي على هذا الجهاز فقط، وليس أماناً للإنتاج."

            : lang === "de"

              ? "Closed Beta — Konto wird nur lokal auf diesem Gerät gespeichert, kein Produktions-Login."

              : "Closed Beta — account is stored locally on this device only, not production-grade security."}

        </p>

      </div>



      <div className="mb-6 flex rounded-2xl p-1" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>

        {(["login", "register"] as const).map((tt) => (

          <button

            key={tt}

            type="button"

            onClick={() => setTab(tt)}

            className="flex-1 rounded-xl py-3 text-sm font-bold transition-all"

            style={tab === tt ? { background: GRAD, color: "white" } : { color: "rgba(255,255,255,0.4)" }}

          >

            {tt === "login"

              ? lang === "ar"

                ? "دخول"

                : lang === "de"

                  ? "Anmelden"

                  : "Sign in"

              : lang === "ar"

                ? "تسجيل"

                : lang === "de"

                  ? "Registrieren"

                  : "Sign up"}

          </button>

        ))}

      </div>



      <div className="flex flex-1 flex-col gap-4">

        {tab === "register" ? (

          <label className="block">

            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">

              {lang === "ar" ? "الاسم" : lang === "de" ? "Name" : "Name"}

            </span>

            <input

              value={displayName}

              onChange={(e) => setDisplayName(e.target.value)}

              placeholder={lang === "de" ? "Dein Name" : "Your name"}

              className="w-full rounded-2xl px-5 py-4 text-base text-white outline-none focus:ring-2 focus:ring-cyan-500/40"

              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}

            />

          </label>

        ) : null}

        <label className="block">

          <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">Email</span>

          <input

            type="email"

            value={email}

            onChange={(e) => setEmail(e.target.value)}

            placeholder="you@example.com"

            className="w-full rounded-2xl px-5 py-4 text-base text-white outline-none focus:ring-2 focus:ring-cyan-500/40"

            style={{

              background: "rgba(255,255,255,0.06)",

              border: error ? "1px solid rgba(239,68,68,0.5)" : "1px solid rgba(255,255,255,0.08)",

            }}

          />

          {error ? <p className="mt-2 text-xs text-red-400">{error}</p> : null}

        </label>

        <label className="block">

          <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">

            {lang === "ar" ? "كلمة المرور" : lang === "de" ? "Passwort" : "Password"}

          </span>

          <div className="relative">

            <input

              type={showPass ? "text" : "password"}

              placeholder="••••••••"

              className="w-full rounded-2xl px-5 py-4 pr-14 text-base text-white outline-none focus:ring-2 focus:ring-cyan-500/40"

              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}

            />

            <button

              type="button"

              onClick={() => setShowPass(!showPass)}

              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40"

              aria-label={showPass ? "Hide password" : "Show password"}

            >

              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}

            </button>

          </div>

        </label>

      </div>



      <GBtn onClick={submit} className="mt-8 w-full">

        {tab === "login"

          ? lang === "ar"

            ? "تسجيل الدخول"

            : lang === "de"

              ? "Anmelden"

              : "Continue"

          : lang === "ar"

            ? "إنشاء حساب"

            : lang === "de"

              ? "Konto erstellen"

              : "Create account"}

      </GBtn>

    </div>

  );

}


