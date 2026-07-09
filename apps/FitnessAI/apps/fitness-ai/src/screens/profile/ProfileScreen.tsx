import { useState } from "react";
import { ChevronRight, Crown, Globe, Target, TrendingUp, Zap } from "lucide-react";
import type { Lang } from "@fitness-ai/core/types";
import { APP_VERSION } from "@fitness-ai/core/constants";
import { useBrainCompleteness } from "../../hooks/useBrainCompleteness";
import { useUserProfile } from "../../hooks/useUserProfile";
import { getLifestyleSetupStrings } from "../../fitnessBrain/lifestyle/i18n/setupStrings";
import { goalLabel } from "../../utils/profileLabels";
import { LifestyleSetupScreen } from "./LifestyleSetupScreen";
import { ProfilePrivacySection } from "./ProfilePrivacySection";
import { GCard, ScreenPage, TabScreenHeader, Tag } from "@fitness-ai/shared/components";
import { T } from "@fitness-ai/shared/i18n/translations";
import { GLASS, GRAD, GRAD_SOFT } from "@fitness-ai/shared/styles/design";

export function ProfileScreen({
  lang,
  setLang,
  onOpenPremium,
}: {
  lang: Lang;
  setLang: (l: Lang) => void;
  onOpenPremium?: () => void;
}) {
  const { profile } = useUserProfile();
  const { score: brainCompleteness, factors, refresh: refreshCompleteness } = useBrainCompleteness(profile);
  const [showLifestyleSetup, setShowLifestyleSetup] = useState(false);
  const t = T[lang];
  const setupStrings = getLifestyleSetupStrings(lang === "de" ? "de" : "en");
  const name = profile?.displayName?.trim() || profile?.email?.split("@")[0] || (lang === "de" ? "Profil" : "Profile");
  const streak = profile?.streakDays ?? 0;
  const streakLabel =
    streak > 0
      ? `🔥 ${streak} ${lang === "de" ? "Tage" : "days"}`
      : lang === "ar"
        ? "لم يبدأ بعد"
        : lang === "de"
          ? "Noch nicht gestartet"
          : "Not started yet";
  const dash = "—";
  const brainComplete = brainCompleteness !== null && brainCompleteness >= 100;

  return (
    <>
      <ScreenPage dir={t.dir as "ltr" | "rtl"}>
        <TabScreenHeader
          lang={lang}
          question={lang === "ar" ? "من أنت في رحلتك؟" : lang === "de" ? "Wer bist du auf deiner Reise?" : "Who you are on your journey"}
          title={t.profile}
        />

        <GCard
          className="mb-5 p-6"
          style={{
            background: "linear-gradient(135deg, rgba(0,102,255,0.1), rgba(6,182,212,0.05))",
            border: "1px solid rgba(0,102,255,0.18)",
          }}
        >
          <div className="mb-5 flex items-center gap-4">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-3xl text-3xl font-black text-white"
              style={{ background: GRAD, fontFamily: "var(--font-display)" }}
            >
              {name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-xl font-black text-white" style={{ fontFamily: "var(--font-display)" }}>
                {name}
              </p>
              <p className="text-sm text-white/40">{profile?.email}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Tag color="#10B981">
                  {streakLabel}
                </Tag>
                {profile ? <Tag color="#0066FF">{goalLabel(profile.goal, lang)}</Tag> : null}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <GCard className="p-4" style={GLASS}>
              <TrendingUp size={18} className="mb-2 text-cyan-400" />
              <p className="text-xs text-white/40">{t.weight}</p>
              <p className="font-black text-white" style={{ fontFamily: "var(--font-display)" }}>
                {profile?.weightKg ? `${profile.weightKg} kg` : dash}
              </p>
            </GCard>
            <GCard className="p-4" style={GLASS}>
              <Target size={18} className="mb-2 text-violet-400" />
              <p className="text-xs text-white/40">{t.age}</p>
              <p className="font-black text-white" style={{ fontFamily: "var(--font-display)" }}>
                {profile?.age ? profile.age : dash}
              </p>
            </GCard>
            <GCard className="p-4" style={GLASS}>
              <p className="text-xs text-white/40">{t.height}</p>
              <p className="font-black text-white" style={{ fontFamily: "var(--font-display)" }}>
                {profile?.heightCm ? `${profile.heightCm} cm` : dash}
              </p>
            </GCard>
            <GCard className="p-4" style={GLASS}>
              <p className="text-xs text-white/40">{lang === "de" ? "Ziel" : "Goal"}</p>
              <p className="text-sm font-black leading-snug text-white" style={{ fontFamily: "var(--font-display)" }}>
                {profile ? goalLabel(profile.goal, lang) : "—"}
              </p>
            </GCard>
          </div>
        </GCard>

        <ProfilePrivacySection
          lang={lang}
          brainScore={brainCompleteness}
          factors={factors}
          onBrainReset={refreshCompleteness}
        />

        <button type="button" onClick={() => setShowLifestyleSetup(true)} className="mb-5 w-full text-left">
          <GCard className="p-5" style={{ background: GRAD_SOFT, border: "1px solid rgba(139,92,246,0.22)" }}>
            <div className="flex items-center gap-4">
              <div
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl"
                style={{ background: "rgba(139,92,246,0.25)" }}
              >
                <Zap size={20} className="text-violet-300" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-black text-white" style={{ fontFamily: "var(--font-display)" }}>
                  {brainComplete
                    ? lang === "de"
                      ? "Lifestyle & Ziele anpassen"
                      : "Adjust lifestyle & goals"
                    : setupStrings.entryTitle}
                </p>
                <p className="mt-0.5 text-sm text-white/55">
                  {brainComplete
                    ? lang === "de"
                      ? "Ziel, Training, Schlaf und Ernährung — jederzeit änderbar."
                      : "Goal, training, sleep, and food — change anytime."
                    : setupStrings.entrySubtitle}
                </p>
              </div>
              <ChevronRight size={18} className="flex-shrink-0 text-white/30" aria-hidden />
            </div>
          </GCard>
        </button>

        <p className="mb-3 px-1 text-xs font-bold uppercase tracking-widest text-white/30">
          {lang === "de" ? "Einstellungen" : "Settings"}
        </p>
        <GCard className="mb-5 overflow-hidden">
          {(["en", "ar", "de"] as Lang[]).map((code, i) => (
            <button
              key={code}
              type="button"
              onClick={() => setLang(code)}
              className={`flex w-full items-center gap-4 px-5 py-4 text-left ${i < 2 ? "border-b border-white/5" : ""}`}
            >
              <Globe size={18} className="text-white/50" />
              <span className="flex-1 text-sm font-semibold text-white/80">
                {code === "en" ? "English" : code === "ar" ? "العربية" : "Deutsch"}
              </span>
              {lang === code ? <span className="text-xs font-bold text-cyan-400">✓</span> : null}
            </button>
          ))}
        </GCard>

        <button
          type="button"
          onClick={onOpenPremium}
          className="flex w-full items-center justify-between rounded-3xl px-5 py-4"
          style={{ ...GLASS, border: "1px solid rgba(139,92,246,0.15)" }}
        >
          <div className="flex items-center gap-3">
            <Crown size={18} className="text-violet-300" />
            <span className="text-sm font-semibold text-white/80">
              {lang === "de" ? "Premium (Demnächst)" : lang === "ar" ? "Premium (قريباً)" : "Premium (Coming soon)"}
            </span>
          </div>
          <ChevronRight size={16} className="text-white/25" aria-hidden />
        </button>

        <p className="mt-6 text-center text-xs text-white/20">Fitness AI v{APP_VERSION}</p>
      </ScreenPage>

      {showLifestyleSetup ? (
        <LifestyleSetupScreen
          lang={lang}
          onClose={() => setShowLifestyleSetup(false)}
          onSaved={refreshCompleteness}
        />
      ) : null}
    </>
  );
}
