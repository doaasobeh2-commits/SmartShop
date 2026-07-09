import type { MealRecommendation } from "@recipe-ai/core/types";
import { AtmosphereScreen, PrimaryButton, TextButton } from "@recipe-ai/shared";

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
  const step = meal.steps[stepIndex];
  const progress = ((stepIndex + 1) / meal.steps.length) * 100;
  const isLast = stepIndex >= meal.steps.length - 1;

  return (
    <AtmosphereScreen atmosphere="cookbook-dark" dark contentLayout="scroll">
      <div className="flex min-h-full flex-col px-8 pb-12 pt-14">
        <div className="mb-12 flex items-center justify-between">
          <TextButton onClick={onExit} className="!text-[#9A9590]">
            Exit
          </TextButton>
          <span className="text-sm" style={{ color: "#9A9590" }}>
            Step {step.order} of {meal.steps.length}
          </span>
        </div>

        <div
          className="mb-16 h-[3px] w-full overflow-hidden rounded-full"
          style={{ background: "#3D3A37" }}
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
          <p className="mb-12 text-base" style={{ color: "#9A9590" }}>
            {step.timerMinutes} min
          </p>
        )}

        <div className="mt-auto flex flex-col gap-4">
          <PrimaryButton onClick={onNext}>{isLast ? "Finish" : "Next"}</PrimaryButton>
          {stepIndex > 0 && (
            <TextButton onClick={onBack} className="mx-auto !text-[#9A9590]">
              Previous
            </TextButton>
          )}
        </div>
      </div>
    </AtmosphereScreen>
  );
}
