import type { MealRecommendation } from "@recipe-ai/core/types";
import { AtmosphereScreen, PrimaryButton, TextButton } from "@recipe-ai/shared";
import { useI18n } from "../i18n/useI18n";

type CookModeScreenProps = {
  meal: MealRecommendation;
  stepIndex: number;
  onNext: () => void;
  onBack: () => void;
  onExit: () => void;
};

export function CookModeScreen({
  meal,
  stepIndex,
  onNext,
  onBack,
  onExit,
}: CookModeScreenProps) {
  const { t } = useI18n();
  const step = meal.steps[stepIndex];
  const progress = ((stepIndex + 1) / meal.steps.length) * 100;
  const isLast = stepIndex >= meal.steps.length - 1;

  return (
    <AtmosphereScreen atmosphere="cookbook-dark" dark contentLayout="scroll">
      <div className="flex min-h-full flex-col px-8 pb-12 pt-14">
        <div className="mb-12 flex items-center justify-between">
          <TextButton onClick={onExit} className="!text-[var(--cook-muted)]">
            {t("exit")}
          </TextButton>
          <span className="text-sm" style={{ color: "var(--cook-muted)" }}>
            {t("stepOf", { current: step.order, total: meal.steps.length })}
          </span>
        </div>

        <div
          className="mb-16 h-[3px] w-full overflow-hidden rounded-full"
          style={{ background: "var(--cook-progress-track)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              background: isLast ? "var(--primary)" : "rgba(245, 243, 240, 0.45)",
            }}
          />
        </div>

        <p
          className="cook-instruction mb-auto text-[1.75rem] leading-snug md:text-[2rem]"
          style={{ maxWidth: "18ch" }}
        >
          {step.instruction}
        </p>

        {step.timerMinutes && (
          <p className="mb-12 text-base" style={{ color: "var(--cook-muted)" }}>
            {t("timerMinutes", { n: step.timerMinutes })}
          </p>
        )}

        <div className="mt-auto flex flex-col gap-4">
          <PrimaryButton onClick={onNext}>{isLast ? t("finish") : t("next")}</PrimaryButton>
          {stepIndex > 0 && (
            <TextButton onClick={onBack} className="mx-auto !text-[var(--cook-muted)]">
              {t("previous")}
            </TextButton>
          )}
        </div>
      </div>
    </AtmosphereScreen>
  );
}
