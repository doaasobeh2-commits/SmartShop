import { PrimaryButton, TextButton } from "@recipe-ai/shared";
import { OnboardingScreenLayout } from "../components/OnboardingScreenLayout";
import { CONTENT_SURFACE } from "../components/livingKitchenVisual";
import { ONBOARDING_HERO_IMAGES } from "../data/onboardingImagery";
import { useI18n } from "../i18n/useI18n";

type WeeklyPlanOptInScreenProps = {
  onYes: () => void;
  onNotNow: () => void;
  onBack?: () => void;
};

export function WeeklyPlanOptInScreen({
  onYes,
  onNotNow,
  onBack,
}: WeeklyPlanOptInScreenProps) {
  const { t } = useI18n();

  return (
    <OnboardingScreenLayout
      heroImage={ONBOARDING_HERO_IMAGES.weeklyPlanOptIn}
      atmosphere="kitchen-morning"
      compactHero
    >
      <h1
        className="mb-2.5 text-[2.15rem] font-semibold leading-tight"
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--brand-primary)",
        }}
      >
        {t("planWeekTitle")}
      </h1>
      <p
        className="mb-6 max-w-sm text-base leading-relaxed"
        style={{ color: "var(--warm-gray)" }}
      >
        {t("planWeekBody")}
      </p>

      <div
        className="mb-5 space-y-3 rounded-[1.35rem] border px-4 py-3.5"
        style={CONTENT_SURFACE}
        aria-hidden
      >
        {[68, 82, 58].map((width, index) => (
          <div key={width} className="flex items-center gap-3">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{
                background:
                  index === 0 ? "var(--accent)" : "var(--decorative-gold)",
              }}
            />
            <span
              className="h-1.5 rounded-full"
              style={{
                width: `${width}%`,
                background: "rgba(90, 64, 48, 0.12)",
              }}
            />
          </div>
        ))}
        <p
          className="pt-1 text-xs leading-relaxed"
          style={{ color: "var(--warm-gray)" }}
        >
          {t("thisWeekBody")}
        </p>
      </div>

      <div className="mt-auto space-y-3 pt-2">
        <PrimaryButton onClick={onYes}>{t("yes")}</PrimaryButton>
        <TextButton onClick={onNotNow} className="mx-auto block py-2">
          {t("notNow")}
        </TextButton>
        {onBack ? (
          <TextButton onClick={onBack} className="mx-auto block py-1">
            {t("back")}
          </TextButton>
        ) : null}
      </div>
    </OnboardingScreenLayout>
  );
}
