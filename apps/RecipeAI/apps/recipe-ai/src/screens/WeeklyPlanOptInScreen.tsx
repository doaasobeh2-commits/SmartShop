import { AtmosphereScreen, PrimaryButton, TextButton } from "@recipe-ai/shared";

type WeeklyPlanOptInScreenProps = {
  onYes: () => void;
  onNotNow: () => void;
};

export function WeeklyPlanOptInScreen({ onYes, onNotNow }: WeeklyPlanOptInScreenProps) {
  return (
    <AtmosphereScreen atmosphere="planning-light" contentLayout="bottom">
      <div className="flex min-h-full flex-col justify-end px-8 pb-12 pt-16">
        <h1 className="meal-title mb-4 text-4xl">Plan your week?</h1>
        <p className="mb-12 max-w-sm text-base leading-relaxed" style={{ color: "var(--warm-gray)" }}>
          Would you like Recipe AI to help plan your week&apos;s meals?
        </p>

        <PrimaryButton onClick={onYes} className="mb-4">
          Yes
        </PrimaryButton>
        <TextButton onClick={onNotNow} className="mx-auto block py-2">
          Not now
        </TextButton>
      </div>
    </AtmosphereScreen>
  );
}
