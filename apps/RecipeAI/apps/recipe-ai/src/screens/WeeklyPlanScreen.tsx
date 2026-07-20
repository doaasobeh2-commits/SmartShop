import type { WeekDayPlan } from "@recipe-ai/core/types";
import { PrimaryButton, TextButton } from "@recipe-ai/shared";
import { DishThumbnail } from "../components/DishThumbnail";
import { LivingKitchenPanel } from "../components/LivingKitchenPanel";
import { ScreenHeroBand } from "../components/ScreenHeroBand";
import {
  CONTENT_SURFACE,
  SAFE_BOTTOM,
} from "../components/livingKitchenVisual";
import { getDishById } from "../data/catalog/dishes";
import { ONBOARDING_HERO_IMAGES } from "../data/onboardingImagery";
import { useI18n } from "../i18n/useI18n";
import { weekdayLabelKey } from "../i18n/weekdays";
import { INTENT_LABEL } from "./WeeklyPlanIntentScreen";

type WeeklyPlanScreenProps = {
  plan: WeekDayPlan[];
  onSelectRecipe: (dayOffset: number, recipeId: string) => void;
  onRemoveCompanion: (dayOffset: number, companionId: string) => void;
  onContinue: () => void;
  onBack?: () => void;
};

export function WeeklyPlanScreen({
  plan,
  onSelectRecipe,
  onRemoveCompanion,
  onContinue,
  onBack,
}: WeeklyPlanScreenProps) {
  const { t } = useI18n();

  return (
    <LivingKitchenPanel>
      <div
        className="flex min-h-0 flex-1 flex-col overflow-y-auto"
        style={{ paddingBottom: SAFE_BOTTOM }}
      >
        <ScreenHeroBand
          imageUrl={ONBOARDING_HERO_IMAGES.weeklyPlanOptIn}
          size="default"
        />

        <div className="relative z-10 -mt-4 px-7 pb-4">
          <h1
            className="mb-1.5 text-[2.15rem] font-semibold leading-tight"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--brand-primary)",
            }}
          >
            {t("thisWeekTitle")}
          </h1>
          <p
            className="mb-4 text-sm leading-relaxed"
            style={{ color: "var(--warm-gray)" }}
          >
            {t("thisWeekBody")}
          </p>

          <ul className="mb-5 space-y-3">
            {plan.map((day) => {
              const dish = getDishById(day.recipeId);
              const alternate = day.alternateRecipeId
                ? getDishById(day.alternateRecipeId)
                : undefined;
              const companions = (day.meal?.companionRecipeIds ?? [])
                .map((id) => getDishById(id))
                .filter(Boolean) as NonNullable<ReturnType<typeof getDishById>>[];
              const intent = day.dayIntent ?? "auto";

              return (
                <li
                  key={`${day.date}-${day.dayOffset}`}
                  className="rounded-2xl border px-3 py-3"
                  style={{
                    ...CONTENT_SURFACE,
                    boxShadow: "0 6px 18px rgba(58, 36, 22, 0.04)",
                  }}
                >
                  <div className="mb-2.5 flex items-center justify-between gap-2">
                    <span
                      className="text-xs font-semibold uppercase tracking-[0.1em]"
                      style={{ color: "var(--brand-primary)" }}
                    >
                      {t(weekdayLabelKey(day.weekdayIndex))}
                    </span>
                    <span
                      className="rounded-full px-2 py-0.5 text-[0.68rem] font-medium"
                      style={{
                        background: "rgba(90, 64, 48, 0.08)",
                        color: "var(--warm-gray)",
                      }}
                    >
                      {t(INTENT_LABEL[intent])}
                    </span>
                  </div>

                  {dish ? (
                    <div className="flex items-start gap-3">
                      <DishThumbnail
                        imageUrl={dish.imageUrl}
                        title={dish.title}
                        size="lg"
                      />
                      <div className="min-w-0 flex-1 pt-0.5">
                        <span
                          className="block text-[1.08rem] font-semibold leading-tight"
                          style={{
                            color: "var(--deep-charcoal)",
                            fontFamily: "var(--font-display)",
                          }}
                        >
                          {dish.title}
                        </span>
                      </div>
                    </div>
                  ) : null}

                  {companions.length > 0 ? (
                    <div className="mt-2.5 space-y-1.5 border-t pt-2.5 ps-1">
                      <p
                        className="text-[0.58rem] font-semibold uppercase tracking-[0.1em]"
                        style={{ color: "var(--warm-gray)" }}
                      >
                        {t("companionIncluded")}
                      </p>
                      {companions.map((companion) => (
                        <div
                          key={companion.id}
                          className="flex items-center gap-2.5 rounded-xl px-2 py-1.5"
                          style={{ background: "rgba(90, 64, 48, 0.04)" }}
                        >
                          <DishThumbnail
                            imageUrl={companion.imageUrl}
                            title={companion.title}
                            size="sm"
                          />
                          <span
                            className="min-w-0 flex-1 truncate text-[0.82rem]"
                            style={{ color: "var(--deep-charcoal)" }}
                          >
                            {companion.title}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              onRemoveCompanion(day.dayOffset, companion.id)
                            }
                            className="shrink-0 text-[0.72rem] font-medium"
                            style={{ color: "var(--warm-gray)" }}
                          >
                            {t("removeCompanion")}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p
                      className="mt-2 text-[0.72rem]"
                      style={{ color: "var(--warm-gray)" }}
                    >
                      {t("mainOnlyMeal")}
                    </p>
                  )}

                  {alternate ? (
                    <button
                      type="button"
                      onClick={() =>
                        onSelectRecipe(day.dayOffset, alternate.id)
                      }
                      className="mt-2 w-full rounded-xl px-2 py-1.5 text-start text-[0.78rem]"
                      style={{
                        color: "var(--warm-gray)",
                        background: "rgba(90, 64, 48, 0.04)",
                      }}
                    >
                      {t("weekDayAlternate", { name: alternate.title })}
                    </button>
                  ) : null}
                </li>
              );
            })}
          </ul>

          <PrimaryButton onClick={onContinue}>{t("save")}</PrimaryButton>
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
