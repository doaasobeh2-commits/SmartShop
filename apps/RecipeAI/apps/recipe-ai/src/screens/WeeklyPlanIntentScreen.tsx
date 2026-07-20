import type { DayCuisineSource, DayPlanIntent } from "@recipe-ai/core/types";
import { Chip, PrimaryButton, TextButton } from "@recipe-ai/shared";
import { LivingKitchenPanel } from "../components/LivingKitchenPanel";
import { ScreenHeroBand } from "../components/ScreenHeroBand";
import {
  CONTENT_SURFACE,
  SAFE_BOTTOM,
} from "../components/livingKitchenVisual";
import { ONBOARDING_HERO_IMAGES } from "../data/onboardingImagery";
import { useI18n } from "../i18n/useI18n";
import type { MessageKey } from "../i18n/types";
import { weekdayLabelKey } from "../i18n/weekdays";

const INTENT_OPTIONS: DayPlanIntent[] = [
  "auto",
  "budget",
  "healthy",
  "light",
  "high_calorie",
  "special",
  "quick",
  "vegetarian",
];

const CUISINE_SOURCE_OPTIONS: DayCuisineSource[] = [
  "auto",
  "primary",
  "preferred",
];

const INTENT_LABEL: Record<DayPlanIntent, MessageKey> = {
  auto: "dayIntentAuto",
  budget: "dayIntentBudget",
  healthy: "dayIntentHealthy",
  light: "dayIntentLight",
  high_calorie: "dayIntentHighCalorie",
  special: "dayIntentSpecial",
  quick: "dayIntentQuick",
  vegetarian: "dayIntentVegetarian",
};

const CUISINE_SOURCE_LABEL: Record<DayCuisineSource, MessageKey> = {
  auto: "dayCuisineAuto",
  primary: "dayCuisinePrimary",
  preferred: "dayCuisinePreferred",
};

type WeeklyPlanIntentScreenProps = {
  /** YYYY-MM-DD for each of the 7 rolling days */
  dayDates: string[];
  weekdayIndexes: number[];
  dayIntents: DayPlanIntent[];
  dayCuisineSources: DayCuisineSource[];
  onChangeDayIntent: (dayOffset: number, intent: DayPlanIntent) => void;
  onChangeDayCuisineSource: (
    dayOffset: number,
    source: DayCuisineSource,
  ) => void;
  onContinue: () => void;
  onBack?: () => void;
};

export function WeeklyPlanIntentScreen({
  dayDates,
  weekdayIndexes,
  dayIntents,
  dayCuisineSources,
  onChangeDayIntent,
  onChangeDayCuisineSource,
  onContinue,
  onBack,
}: WeeklyPlanIntentScreenProps) {
  const { t } = useI18n();

  return (
    <LivingKitchenPanel>
      <div
        className="flex min-h-0 flex-1 flex-col overflow-y-auto"
        style={{ paddingBottom: SAFE_BOTTOM }}
      >
        <ScreenHeroBand
          imageUrl={ONBOARDING_HERO_IMAGES.weeklyPlanOptIn}
          size="compact"
        />

        <div className="relative z-10 -mt-4 px-7 pb-4">
          <h1
            className="mb-1.5 text-[2.05rem] font-semibold leading-tight"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--brand-primary)",
            }}
          >
            {t("weeklyIntentsTitle")}
          </h1>
          <p
            className="mb-4 text-sm leading-relaxed"
            style={{ color: "var(--warm-gray)" }}
          >
            {t("weeklyIntentsBody")}
          </p>

          <ul className="mb-5 space-y-2.5">
            {dayDates.map((date, dayOffset) => {
              const weekdayIndex = weekdayIndexes[dayOffset] ?? 0;
              const intent = dayIntents[dayOffset] ?? "auto";
              const cuisineSource = dayCuisineSources[dayOffset] ?? "auto";

              return (
                <li
                  key={date}
                  className="rounded-2xl border px-3 py-2.5"
                  style={CONTENT_SURFACE}
                >
                  <span
                    className="mb-2 block text-xs font-semibold uppercase tracking-[0.1em]"
                    style={{ color: "var(--brand-primary)" }}
                  >
                    {t(weekdayLabelKey(weekdayIndex))}
                  </span>

                  <div className="flex flex-wrap gap-1.5">
                    {INTENT_OPTIONS.map((option) => (
                      <Chip
                        key={option}
                        selected={intent === option}
                        onClick={() => onChangeDayIntent(dayOffset, option)}
                      >
                        {t(INTENT_LABEL[option])}
                      </Chip>
                    ))}
                  </div>

                  <div
                    className="mt-2.5 border-t pt-2"
                    style={{ borderColor: "rgba(240, 237, 232, 0.85)" }}
                  >
                    <p
                      className="mb-1.5 text-[0.58rem] font-medium uppercase tracking-[0.08em]"
                      style={{ color: "var(--warm-gray)" }}
                    >
                      {t("weeklyDayCuisineLabel")}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {CUISINE_SOURCE_OPTIONS.map((option) => (
                        <Chip
                          key={option}
                          selected={cuisineSource === option}
                          onClick={() =>
                            onChangeDayCuisineSource(dayOffset, option)
                          }
                        >
                          {t(CUISINE_SOURCE_LABEL[option])}
                        </Chip>
                      ))}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <PrimaryButton onClick={onContinue}>
            {t("generateWeekPlan")}
          </PrimaryButton>
          {onBack ? (
            <TextButton onClick={onBack} className="mx-auto mt-3 block py-2">
              {t("back")}
            </TextButton>
          ) : null}
        </div>
      </div>
    </LivingKitchenPanel>
  );
}

export {
  INTENT_LABEL,
  INTENT_OPTIONS,
  CUISINE_SOURCE_LABEL,
  CUISINE_SOURCE_OPTIONS,
};
