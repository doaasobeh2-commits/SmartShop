import type { Lang } from "@fitness-ai/core/types";
import { BackHeader, GCard } from "@fitness-ai/shared/components";
import { T } from "@fitness-ai/shared/i18n/translations";

export function PremiumScreen({ lang, onClose }: { lang: Lang; onClose: () => void }) {  const t = T[lang];
  const comingSoon =
    lang === "ar" ? "قريباً" : lang === "de" ? "Demnächst" : "Coming soon";

  return (
    <div className="flex min-h-full flex-col bg-[#050A14] pb-8" dir={t.dir}>
      <BackHeader lang={lang} onBack={onClose} title={t.premium} />

      <div className="px-5">
        <GCard
          className="mb-6 p-6"
          style={{
            background: "linear-gradient(135deg, #0A1F4D 0%, #1A0A3D 100%)",
            border: "1px solid rgba(139,92,246,0.25)",
          }}
        >
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-violet-300/90">{comingSoon}</p>
          <p className="text-sm leading-relaxed text-white/60">
            {lang === "ar"
              ? "Premium غير متاح في النسخة التجريبية — Fitness Brain الأساسي مجاني بالكامل."
              : lang === "de"
                ? "Premium ist in der Closed Beta noch nicht verfügbar — Fitness Brain bleibt vollständig kostenlos."
                : "Premium is not available in Closed Beta — core Fitness Brain remains fully free."}
          </p>
        </GCard>

        <p className="text-center text-xs leading-relaxed text-white/35">
          {lang === "de"
            ? "Abonnements und Testphasen folgen nach dem Beta-Feedback."
            : "Subscriptions and trials will follow after Beta feedback."}
        </p>
      </div>
    </div>
  );
}
