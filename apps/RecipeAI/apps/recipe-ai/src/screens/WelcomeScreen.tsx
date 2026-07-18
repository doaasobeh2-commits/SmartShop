import { AtmosphereScreen, PrimaryButton } from "@recipe-ai/shared";
import { ShareYumLogo } from "../components/ShareYumLogo";
import { useI18n } from "../i18n/useI18n";

export function WelcomeScreen({ onContinue }: { onContinue: () => void }) {
  const { t } = useI18n();

  return (
    <div
      className="flex min-h-0 flex-1 flex-col"
      style={{ background: "var(--warm-white)" }}
    >
      <AtmosphereScreen atmosphere="kitchen-morning" variant="strip">
        <div aria-hidden className="h-full" />
      </AtmosphereScreen>

      <div className="flex min-h-0 flex-1 flex-col items-center px-8 pb-10 pt-6">
        <ShareYumLogo size={152} animationSlot="steam-ready" className="mb-8" />

        <h1
          className="mb-3 text-center text-4xl font-semibold leading-tight"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--brand-primary)",
          }}
        >
          {t("appName")}
        </h1>

        <p
          className="mb-10 max-w-xs text-center text-lg leading-relaxed"
          style={{ color: "var(--warm-gray)" }}
        >
          {t("welcomeTagline")}
        </p>

        <div className="mt-auto w-full">
          <PrimaryButton onClick={onContinue}>{t("letsCook")}</PrimaryButton>
        </div>
      </div>
    </div>
  );
}
