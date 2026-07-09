import type { MealRecommendation } from "@recipe-ai/core/types";
import { AtmosphereScreen, PrimaryButton, TextButton } from "@recipe-ai/shared";

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
  const missingCount = meal.ingredients.filter((i) => i.status === "need").length;

  return (
    <AtmosphereScreen atmosphere="meal-evening" contentLayout="bottom">
      <div className="flex min-h-full flex-col">
        <div className="flex-[0.6]" aria-hidden />

        <div className="flex flex-col px-8 pb-12">
          <p className="mb-2 text-sm tracking-wide" style={{ color: "var(--warm-gray)" }}>
            Tonight
          </p>
          <h1 className="meal-title mb-4 text-[2.125rem]">{meal.title}</h1>
          <p className="mb-2 max-w-md text-base leading-relaxed" style={{ color: "var(--warm-gray)" }}>
            {meal.reason}
          </p>
          {missingCount > 0 && (
            <p className="mb-8 text-sm" style={{ color: "var(--warm-gray)" }}>
              Need {missingCount} item{missingCount > 1 ? "s" : ""}
            </p>
          )}
          {missingCount === 0 && <div className="mb-8" />}

          <PrimaryButton onClick={onCook} className="mb-4">
            Cook
          </PrimaryButton>

          <button
            type="button"
            onClick={onPreview}
            className="mb-3 text-center text-sm font-medium"
            style={{ color: "var(--warm-gray)" }}
          >
            View recipe
          </button>

          <TextButton onClick={onNotTonight} className="mx-auto block py-2">
            Not tonight
          </TextButton>

          <TextButton onClick={onCookWithWhatIHave} className="mx-auto mt-4 block py-2">
            Cook with what I have
          </TextButton>

          {showWeekPlanLink && onOpenWeekPlan && (
            <TextButton onClick={onOpenWeekPlan} className="mx-auto mt-2 block py-2">
              This week
            </TextButton>
          )}
        </div>
      </div>
    </AtmosphereScreen>
  );
}
