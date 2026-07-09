import type { WeekDayPlan } from "@recipe-ai/core/types";
import { AtmosphereScreen, PrimaryButton, TextButton } from "@recipe-ai/shared";

type WeeklyPlanScreenProps = {
  plan: WeekDayPlan[];
  onUpdateDay: (day: string, mealTitle: string) => void;
  onSave: () => void;
  onBack: () => void;
};

export function WeeklyPlanScreen({ plan, onUpdateDay, onSave, onBack }: WeeklyPlanScreenProps) {
  return (
    <AtmosphereScreen atmosphere="planning-light" contentLayout="scroll">
      <div className="screen-scroll px-8 pb-12 pt-16">
        <h1 className="meal-title mb-3 text-4xl">This week</h1>
        <p className="mb-12 text-base leading-relaxed" style={{ color: "var(--warm-gray)" }}>
          One meal for each day. Simple as a notebook.
        </p>

        <ul className="mb-12 space-y-0">
          {plan.map(({ day, mealTitle }) => (
            <li
              key={day}
              className="flex flex-col gap-2 border-b py-6"
              style={{ borderColor: "var(--soft-beige)" }}
            >
              <span
                className="text-xs font-medium uppercase tracking-[0.1em]"
                style={{ color: "var(--warm-gray)" }}
              >
                {day}
              </span>
              <input
                type="text"
                value={mealTitle}
                onChange={(e) => onUpdateDay(day, e.target.value)}
                className="w-full border-0 bg-transparent text-xl font-medium outline-none"
                style={{
                  color: "var(--deep-charcoal)",
                  fontFamily: "var(--font-display)",
                }}
              />
            </li>
          ))}
        </ul>

        <PrimaryButton onClick={onSave} className="mb-4">
          Save
        </PrimaryButton>
        <TextButton onClick={onBack} className="mx-auto block py-2">
          Back
        </TextButton>
      </div>
    </AtmosphereScreen>
  );
}
