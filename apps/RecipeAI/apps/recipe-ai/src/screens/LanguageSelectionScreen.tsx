import { useState } from "react";
import { Chip, PrimaryButton } from "@recipe-ai/shared";
import { OnboardingScreenLayout } from "../components/OnboardingScreenLayout";
import { CONTENT_SURFACE } from "../components/livingKitchenVisual";
import { languages } from "../data/onboarding/onboardingOptions";
import { ONBOARDING_HERO_IMAGES } from "../data/onboardingImagery";
import { tForLanguage } from "../i18n/useI18n";
import type { AppLocale } from "../i18n/types";
import { normalizeAppLocale } from "../i18n/types";

type LanguageSelectionScreenProps = {
  selectedLanguage: string | undefined;
  onContinue: (language: AppLocale) => void;
};

export function LanguageSelectionScreen({
  selectedLanguage,
  onContinue,
}: LanguageSelectionScreenProps) {
  const initial = normalizeAppLocale(selectedLanguage);
  const [pending, setPending] = useState<AppLocale>(initial);

  return (
    <OnboardingScreenLayout
      heroImage={ONBOARDING_HERO_IMAGES.language}
      atmosphere="kitchen-morning"
      heroPresence="strong"
      contentOffset="moderate"
    >
      <div className="flex min-h-0 flex-1 flex-col pt-2">
        <h1
          className="mb-2 text-[2.15rem] font-semibold leading-tight"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--brand-primary)",
          }}
        >
          {tForLanguage(pending, "languageSelectionTitle")}
        </h1>
        <p
          className="mb-5 max-w-sm text-sm leading-relaxed"
          style={{ color: "var(--warm-gray)" }}
        >
          {tForLanguage(pending, "languageSelectionBody")}
        </p>

        <div
          className="mb-6 flex flex-wrap gap-2.5 rounded-[1.25rem] border p-4"
          style={CONTENT_SURFACE}
        >
          {languages.map((lang) => (
            <Chip
              key={lang.id}
              selected={pending === lang.id}
              onClick={() => setPending(normalizeAppLocale(lang.id))}
            >
              {lang.label}
            </Chip>
          ))}
        </div>

        <div className="mt-auto w-full pt-1">
          <PrimaryButton onClick={() => onContinue(pending)}>
            {tForLanguage(pending, "continue")}
          </PrimaryButton>
        </div>
      </div>
    </OnboardingScreenLayout>
  );
}
