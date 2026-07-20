import { useCallback, useEffect, useRef, useState } from "react";
import { CuisinePreferenceCard } from "../components/CuisinePreferenceCard";
import { OnboardingScreenLayout } from "../components/OnboardingScreenLayout";
import {
  CONTENT_SURFACE,
  SAFE_BOTTOM,
  STICKY_FOOTER_GRADIENT,
} from "../components/livingKitchenVisual";
import { getCuisineOnboardingOptions } from "../data/cuisineOnboarding";
import { MAX_PREFERRED_CUISINES } from "../data/catalog/decision/householdCuisine";
import { ONBOARDING_HERO_IMAGES } from "../data/onboardingImagery";
import { PrimaryButton } from "@recipe-ai/shared";
import { useI18n } from "../i18n/useI18n";
import { resolveCuisineContinueAction } from "./cuisinePreferencesFlow";

type CuisinePreferencesScreenProps = {
  primaryCuisine?: string;
  preferredCuisines: string[];
  onSelectPrimary: (cuisineId: string) => void;
  onTogglePreferred: (cuisineId: string) => void;
  onContinue: () => void;
};

export function CuisinePreferencesScreen({
  primaryCuisine,
  preferredCuisines,
  onSelectPrimary,
  onTogglePreferred,
  onContinue,
}: CuisinePreferencesScreenProps) {
  const { t, locale } = useI18n();
  const options = getCuisineOnboardingOptions(locale);
  const canContinue = Boolean(primaryCuisine);
  const preferredFull =
    preferredCuisines.length >= MAX_PREFERRED_CUISINES;

  const preferredSectionRef = useRef<HTMLElement>(null);
  const [preferredStepReached, setPreferredStepReached] = useState(false);
  const [showPreferredHint, setShowPreferredHint] = useState(false);

  useEffect(() => {
    setPreferredStepReached(false);
    setShowPreferredHint(false);
  }, [primaryCuisine]);

  const handleContinue = useCallback(() => {
    const action = resolveCuisineContinueAction({
      primarySelected: Boolean(primaryCuisine),
      preferredStepReached,
    });

    if (action === "blocked") return;

    if (action === "reveal_preferred") {
      setPreferredStepReached(true);
      setShowPreferredHint(true);
      requestAnimationFrame(() => {
        preferredSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
      return;
    }

    onContinue();
  }, [onContinue, preferredStepReached, primaryCuisine]);

  return (
    <OnboardingScreenLayout
      heroImage={ONBOARDING_HERO_IMAGES.cuisine}
      atmosphere="kitchen-ingredients"
      compactHero
    >
      <h1
        className="mb-2 text-[2.05rem] font-semibold leading-tight"
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--brand-primary)",
        }}
      >
        {t("cuisinePreferencesTitle")}
      </h1>
      <p
        className="mb-4 max-w-sm text-sm leading-relaxed"
        style={{ color: "var(--warm-gray)" }}
      >
        {t("cuisinePreferencesBody")}
      </p>

      <section
        aria-labelledby="primary-cuisine-heading"
        className="mb-5 rounded-[1.25rem] border p-3.5"
        style={CONTENT_SURFACE}
      >
        <h2
          id="primary-cuisine-heading"
          className="mb-1 text-base font-semibold"
          style={{ color: "var(--brand-primary)" }}
        >
          {t("primaryCuisineTitle")}
        </h2>
        <p
          className="mb-3 text-xs leading-relaxed"
          style={{ color: "var(--warm-gray)" }}
        >
          {t("primaryCuisineBody")}
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          {options.map((option) => (
            <CuisinePreferenceCard
              key={`primary-${option.id}`}
              label={option.label}
              imageUrl={option.imageUrl}
              selected={primaryCuisine === option.id}
              tier="primary"
              onToggle={() => onSelectPrimary(option.id)}
            />
          ))}
        </div>
      </section>

      {preferredStepReached ? (
        <section
          ref={preferredSectionRef}
          aria-labelledby="preferred-cuisines-heading"
          className="scroll-mt-4 rounded-2xl border p-3.5 transition-shadow duration-300"
          style={{
            ...CONTENT_SURFACE,
            background: "rgba(255, 253, 249, 0.82)",
            ...(showPreferredHint
              ? { boxShadow: "0 0 0 2px var(--brand-primary)" }
              : {}),
          }}
        >
          <h2
            id="preferred-cuisines-heading"
            className="mb-1 text-sm font-medium"
            style={{ color: "var(--warm-gray)" }}
          >
            {t("preferredCuisinesTitle")}
          </h2>
          <p
            className="mb-2 text-xs leading-relaxed"
            style={{ color: "var(--warm-gray)" }}
          >
            {t("preferredCuisinesBody")} {t("preferredCuisinesLimit")}
          </p>
          {showPreferredHint ? (
            <p
              className="mb-3 text-sm leading-relaxed"
              style={{ color: "var(--brand-primary)" }}
              aria-live="polite"
            >
              {t("preferredCuisinesRevealHint")}
            </p>
          ) : null}
          <div className="mb-2 grid grid-cols-2 gap-2.5">
            {options.map((option) => {
              const isPrimary = primaryCuisine === option.id;
              const selected = preferredCuisines.includes(option.id);
              const disabled =
                !primaryCuisine ||
                isPrimary ||
                (preferredFull && !selected);
              return (
                <CuisinePreferenceCard
                  key={`preferred-${option.id}`}
                  label={option.label}
                  imageUrl={option.imageUrl}
                  selected={selected}
                  tier="secondary"
                  disabled={disabled}
                  onToggle={() => {
                    if (!disabled) onTogglePreferred(option.id);
                  }}
                />
              );
            })}
          </div>
        </section>
      ) : null}

      <div
        className="sticky bottom-0 z-20 -mx-1 mt-3 pt-4"
        style={{
          background: STICKY_FOOTER_GRADIENT,
          paddingBottom: SAFE_BOTTOM,
        }}
      >
        <PrimaryButton onClick={handleContinue} disabled={!canContinue}>
          {t("continue")}
        </PrimaryButton>
      </div>
    </OnboardingScreenLayout>
  );
}
