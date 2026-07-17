import { AtmosphereScreen, PrimaryButton } from "@recipe-ai/shared";
import { useI18n } from "../i18n/useI18n";

export function WelcomeScreen({ onContinue }: { onContinue: () => void }) {
  const { t } = useI18n();

  return (
    <AtmosphereScreen atmosphere="kitchen-morning" contentLayout="bottom">
      <div className="flex min-h-full flex-col justify-end px-8 pb-12 pt-16">
        <div className="mb-8 text-center text-white">
          <h1
            className="mb-3 text-5xl font-semibold leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Recipe AI
          </h1>

          <p className="mx-auto max-w-xs text-lg leading-relaxed text-white/85">
            {t("welcomeTagline")}
          </p>
        </div>

        <PrimaryButton onClick={onContinue}>{t("letsCook")}</PrimaryButton>
      </div>
    </AtmosphereScreen>
  );
}
