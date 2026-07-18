import { ALLERGY_OPTIONS } from "@recipe-ai/core/types";
import { AtmosphereScreen, Chip, PrimaryButton } from "@recipe-ai/shared";

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
  return (
    <AtmosphereScreen atmosphere="kitchen-ingredients" contentLayout="scroll">
      <div className="flex min-h-full flex-col px-8 pb-12 pt-16">
        <h1
          className="mb-3 text-4xl font-semibold leading-tight"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--brand-primary)",
          }}
        >
          Any allergies?
        </h1>
        <p
          className="mb-10 max-w-sm text-base leading-relaxed"
          style={{ color: "var(--warm-gray)" }}
        >
          We never suggest meals that aren&apos;t safe for your household.
        </p>

        <div
          className="mb-12 flex flex-wrap gap-3 rounded-3xl p-6"
          style={{ background: "rgba(250, 249, 247, 0.9)", backdropFilter: "blur(16px)" }}
        >
          {ALLERGY_OPTIONS.map((allergy) => (
            <Chip
              key={allergy}
              selected={selected.includes(allergy)}
              onClick={() => onToggle(allergy)}
            >
              {allergy}
            </Chip>
          ))}
        </div>

        <div className="mt-auto">
          <PrimaryButton onClick={onContinue}>Continue</PrimaryButton>
        </div>
      </div>
    </AtmosphereScreen>
  );
}
