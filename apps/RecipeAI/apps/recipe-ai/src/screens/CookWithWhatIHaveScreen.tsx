import { PrimaryButton, TextButton } from "@recipe-ai/shared";
import { DishThumbnail } from "../components/DishThumbnail";
import { OnboardingScreenLayout } from "../components/OnboardingScreenLayout";
import { CONTENT_SURFACE } from "../components/livingKitchenVisual";
import { getDishById } from "../data/catalog/dishes";
import { ONBOARDING_HERO_IMAGES } from "../data/onboardingImagery";
import { useI18n } from "../i18n/useI18n";

type CookWithWhatIHaveScreenProps = {
  query: string;
  onQueryChange: (query: string) => void;
  matchIds: string[];
  noStrongMatch: boolean;
  missingById?: Record<string, number>;
  coverageById?: Record<string, number>;
  plannedConflict?: {
    mayNotHaveEnough: boolean;
    plannedTitle: string;
    alternativeIds: string[];
  } | null;
  onFindMeal: (query: string) => void;
  onChooseMatch: (recipeId: string) => void;
  onBack: () => void;
};

export function CookWithWhatIHaveScreen({
  query,
  onQueryChange,
  matchIds,
  noStrongMatch,
  missingById = {},
  coverageById = {},
  plannedConflict,
  onFindMeal,
  onChooseMatch,
  onBack,
}: CookWithWhatIHaveScreenProps) {
  const { t } = useI18n();
  const showResults =
    matchIds.length > 0 || (noStrongMatch && query.trim().length > 0);

  const resultIds =
    plannedConflict?.mayNotHaveEnough && plannedConflict.alternativeIds.length
      ? [
          ...plannedConflict.alternativeIds,
          ...matchIds.filter((id) => !plannedConflict.alternativeIds.includes(id)),
        ].slice(0, 3)
      : matchIds;

  return (
    <OnboardingScreenLayout
      heroImage={ONBOARDING_HERO_IMAGES.allergies}
      atmosphere="kitchen-ingredients"
      compactHero
    >
      <h1
        className="mb-2 text-[2.15rem] font-semibold leading-tight"
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--brand-primary)",
        }}
      >
        {t("whatDoYouHave")}
      </h1>
      <p
        className="mb-4 max-w-sm text-sm leading-relaxed"
        style={{ color: "var(--warm-gray)" }}
      >
        {t("whatDoYouHaveBody")}
      </p>
      <p className="mb-4 text-xs" style={{ color: "var(--warm-gray)" }}>
        {t("pantryMatcherDemoNote")}
      </p>

      <textarea
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder={t("haveIngredientsPlaceholder")}
        rows={3}
        className="mb-4 w-full resize-none rounded-[1.25rem] border p-4 text-base outline-none"
        style={{
          background: "rgba(255, 253, 249, 0.96)",
          borderColor: "rgba(240, 237, 232, 0.95)",
          color: "var(--deep-charcoal)",
          boxShadow: "0 8px 22px rgba(58, 36, 22, 0.04)",
        }}
      />

      <PrimaryButton
        onClick={() => {
          if (!query.trim()) return;
          onFindMeal(query.trim());
        }}
        disabled={!query.trim()}
        className="mb-4"
      >
        {t("findMeal")}
      </PrimaryButton>

      {showResults && plannedConflict?.mayNotHaveEnough ? (
        <div
          className="mb-4 rounded-2xl border px-4 py-3"
          style={{
            borderColor: "rgba(240, 237, 232, 0.95)",
            background: "rgba(255, 253, 249, 0.96)",
          }}
        >
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--deep-charcoal)" }}
          >
            {t("plannedMealMayNotFit", { name: plannedConflict.plannedTitle })}
          </p>
          <p
            className="mt-1 text-xs leading-relaxed"
            style={{ color: "var(--warm-gray)" }}
          >
            {t("plannedMealAlternativesHint")}
          </p>
        </div>
      ) : null}

      {showResults && noStrongMatch ? (
        <div
          className="mb-4 rounded-2xl border px-4 py-4"
          style={{
            borderColor: "var(--soft-beige)",
            background: "rgba(255, 253, 249, 0.96)",
          }}
        >
          <p
            className="text-base font-semibold"
            style={{
              color: "var(--brand-primary)",
              fontFamily: "var(--font-display)",
            }}
          >
            {t("pantryNoMatchTitle")}
          </p>
          <p
            className="mt-1 text-sm leading-relaxed"
            style={{ color: "var(--warm-gray)" }}
          >
            {t("pantryNoMatchBody")}
          </p>
        </div>
      ) : null}

      {showResults && resultIds.length > 0 ? (
        <ul className="mb-4 space-y-2">
          {resultIds.map((id) => {
            const dish = getDishById(id);
            if (!dish) return null;
            const missing = missingById[id] ?? 0;
            const coverage = coverageById[id] ?? 0;
            const coverageNote =
              missing === 0 || coverage >= 0.75
                ? t("pantryMostlyReady")
                : t("pantryMissingCount", { count: missing });
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => onChooseMatch(id)}
                  className="flex w-full items-center gap-3 rounded-2xl border px-2.5 py-2 text-start"
                  style={{
                    borderColor: "rgba(240, 237, 232, 0.95)",
                    background: "rgba(255, 253, 249, 0.96)",
                  }}
                >
                  <DishThumbnail
                    imageUrl={dish.imageUrl}
                    title={dish.title}
                    size="md"
                  />
                  <span className="min-w-0 flex-1">
                    <span
                      className="block truncate text-base font-semibold"
                      style={{
                        fontFamily: "var(--font-display)",
                        color: "var(--deep-charcoal)",
                      }}
                    >
                      {dish.title}
                    </span>
                    <span
                      className="mt-0.5 block text-xs leading-snug"
                      style={{ color: "var(--warm-gray)" }}
                    >
                      {coverageNote}
                      {" · "}
                      {t("pantryDemoCoverageNote")}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      <TextButton onClick={onBack} className="mx-auto mt-auto block py-2">
        {t("backToTonight")}
      </TextButton>
    </OnboardingScreenLayout>
  );
}
