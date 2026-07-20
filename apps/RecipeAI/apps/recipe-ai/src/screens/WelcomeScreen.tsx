import { AtmosphereScreen, PrimaryButton } from "@recipe-ai/shared";
import { LivingKitchenPanel } from "../components/LivingKitchenPanel";
import { ShareYumLogo } from "../components/ShareYumLogo";
import { imageObjectPosition } from "../data/imageFocalPoints";
import { ONBOARDING_HERO_IMAGES } from "../data/onboardingImagery";
import { useI18n } from "../i18n/useI18n";

export function WelcomeScreen({ onContinue }: { onContinue: () => void }) {
  const { t } = useI18n();
  const hero = ONBOARDING_HERO_IMAGES.welcome;

  return (
    <LivingKitchenPanel className="flex min-h-0 flex-1 flex-col">
      <AtmosphereScreen
        atmosphere="kitchen-morning"
        variant="strip"
        imageUrl={hero}
        objectPosition={imageObjectPosition(hero)}
        className="!h-[32vh] !max-h-[272px] !min-h-[196px]"
      >
        <div aria-hidden className="h-full" />
      </AtmosphereScreen>

      <div className="relative z-10 -mt-3 flex min-h-0 flex-1 flex-col items-center px-7 pb-9 pt-2">
        <ShareYumLogo size={128} animationSlot="steam-ready" className="mb-4" />

        <h1
          className="mb-2 text-center text-[2.35rem] font-semibold leading-tight"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--brand-primary)",
          }}
        >
          {t("appName")}
        </h1>

        <p
          className="mb-8 max-w-xs text-center text-base leading-relaxed"
          style={{ color: "var(--warm-gray)" }}
        >
          {t("welcomeTagline")}
        </p>

        <div className="mt-auto w-full">
          <PrimaryButton onClick={onContinue}>{t("letsCook")}</PrimaryButton>
        </div>
      </div>
    </LivingKitchenPanel>
  );
}
