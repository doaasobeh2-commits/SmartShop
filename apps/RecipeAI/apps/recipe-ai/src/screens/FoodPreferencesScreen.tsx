import { ALLERGY_OPTIONS } from "@recipe-ai/core/types";
import { Chip, PrimaryButton } from "@recipe-ai/shared";
import { OnboardingScreenLayout } from "../components/OnboardingScreenLayout";
import { CONTENT_SURFACE } from "../components/livingKitchenVisual";
import { ONBOARDING_HERO_IMAGES } from "../data/onboardingImagery";
import { useI18n } from "../i18n/useI18n";
import type { MessageKey } from "../i18n/types";

const ALLERGY_LABEL_KEYS: Record<(typeof ALLERGY_OPTIONS)[number], MessageKey> =
  {
    Gluten: "allergyGluten",
    Dairy: "allergyDairy",
    Eggs: "allergyEggs",
    Nuts: "allergyNuts",
    Peanuts: "allergyPeanuts",
    Fish: "allergyFish",
    Shellfish: "allergyShellfish",
    Soy: "allergySoy",
    Sesame: "allergySesame",
  };

type FoodPreferencesScreenProps = {
  selected: string[];
  onToggle: (allergy: string) => void;
  onContinue: () => void;
};

export function FoodPreferencesScreen({
  selected,
  onToggle,
  onContinue,
}: FoodPreferencesScreenProps) {
  const { t } = useI18n();

  return (
    <OnboardingScreenLayout
      heroImage={ONBOARDING_HERO_IMAGES.allergies}
      atmosphere="kitchen-ingredients"
      heroPresence="default"
      contentOffset="moderate"
    >
      <h1
        className="mb-2 text-[2.15rem] font-semibold leading-tight"
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--brand-primary)",
        }}
      >
        {t("allergiesTitle")}
      </h1>
      <p
        className="mb-5 max-w-sm text-sm leading-relaxed"
        style={{ color: "var(--warm-gray)" }}
      >
        {t("allergiesBody")}
      </p>

      <div
        className="mb-6 flex flex-wrap gap-2.5 rounded-[1.25rem] border p-4"
        style={CONTENT_SURFACE}
      >
        {ALLERGY_OPTIONS.map((allergy) => (
          <Chip
            key={allergy}
            selected={selected.includes(allergy)}
            onClick={() => onToggle(allergy)}
          >
            {t(ALLERGY_LABEL_KEYS[allergy])}
          </Chip>
        ))}
      </div>

      <div className="mt-auto">
        <PrimaryButton onClick={onContinue}>{t("continue")}</PrimaryButton>
      </div>
    </OnboardingScreenLayout>
  );
}
