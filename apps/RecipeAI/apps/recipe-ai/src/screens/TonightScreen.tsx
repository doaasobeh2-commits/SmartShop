import type { MealRecommendation } from "@recipe-ai/core/types";
import { AtmosphereScreen, PrimaryButton, TextButton } from "@recipe-ai/shared";
import { useI18n } from "../i18n/useI18n";

type TonightScreenProps = {
  meal: MealRecommendation;
  onCook: () => void;
  onPreview: () => void;
  onNotTonight: () => void;
  onCookWithWhatIHave: () => void;
  onOpenWeekPlan?: () => void;
  showWeekPlanLink?: boolean;
};

export function TonightScreen({
  meal,
  onCook,
  onPreview,
  onNotTonight,
  onCookWithWhatIHave,
  onOpenWeekPlan,
  showWeekPlanLink,
}: TonightScreenProps) {
  const { t } = useI18n();
  const missingCount = meal.ingredients.filter((i) => i.status === "need").length;

  return (
    <AtmosphereScreen atmosphere="meal-evening" contentLayout="bottom">
      <div className="flex min-h-full flex-col">
        <div className="flex-[0.6]" aria-hidden />

        <div className="flex flex-col px-8 pb-12">
          <p className="mb-2 text-sm tracking-wide" style={{ color: "var(--warm-gray)" }}>
            {t("tonight")}
          </p>
          <h1 className="meal-title mb-4 text-[2.125rem]">{meal.title}</h1>
          <p className="mb-2 max-w-md text-base leading-relaxed" style={{ color: "var(--warm-gray)" }}>
            {meal.reason}
          </p>
          {missingCount > 0 && (
            <p className="mb-8 text-sm" style={{ color: "var(--warm-gray)" }}>
              {t(missingCount === 1 ? "needItems" : "needItemsPlural", {
                count: missingCount,
              })}
            </p>
          )}
          {missingCount === 0 && <div className="mb-8" />}

          <PrimaryButton onClick={onCook} className="mb-4">
            {t("cook")}
          </PrimaryButton>

          <button
            type="button"
            onClick={onPreview}
            className="mb-3 text-center text-sm font-medium"
            style={{ color: "var(--warm-gray)" }}
          >
            {t("viewRecipe")}
          </button>

          <TextButton onClick={onNotTonight} className="mx-auto block py-2">
            {t("notTonight")}
          </TextButton>

          <TextButton onClick={onCookWithWhatIHave} className="mx-auto mt-4 block py-2">
            {t("cookWithWhatIHave")}
          </TextButton>

          {showWeekPlanLink && onOpenWeekPlan && (
            <TextButton onClick={onOpenWeekPlan} className="mx-auto mt-2 block py-2">
              {t("thisWeek")}
            </TextButton>
          )}
        </div>
      </div>
    </AtmosphereScreen>
  );
}
