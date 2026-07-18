import type { MealFeedbackRating, MealRecommendation } from "@recipe-ai/core/types";
import { AtmosphereScreen, TextButton } from "@recipe-ai/shared";
import { useI18n } from "../i18n/useI18n";
import type { MessageKey } from "../i18n/types";

type FeedbackScreenProps = {
  meal: MealRecommendation;
  onSubmit: (rating: MealFeedbackRating) => void;
  onSkip: () => void;
};

const options: { rating: MealFeedbackRating; labelKey: MessageKey }[] = [
  { rating: "loved", labelKey: "lovedIt" },
  { rating: "good", labelKey: "itWasGood" },
  { rating: "not-for-us", labelKey: "notForUs" },
];

export function FeedbackScreen({ meal, onSubmit, onSkip }: FeedbackScreenProps) {
  const { t } = useI18n();

  return (
    <AtmosphereScreen atmosphere="dinner-complete" contentLayout="bottom">
      <div className="flex min-h-full flex-col items-center px-8 pb-12 pt-16 text-center">
        <div
          className="mb-8 h-20 w-20 shrink-0 rounded-2xl"
          style={{
            background:
              "linear-gradient(135deg, var(--decorative-gold) 0%, var(--brand-primary) 100%)",
            boxShadow: "0 8px 32px rgba(26, 25, 24, 0.12)",
          }}
          aria-hidden
        />

        <h1 className="meal-title mb-4 text-4xl">{t("howWasDinner")}</h1>
        <p className="mb-12 max-w-xs text-sm leading-relaxed" style={{ color: "var(--warm-gray)" }}>
          {t("feedbackHelps")}
        </p>

        <div className="mb-8 w-full max-w-sm space-y-3">
          {options.map(({ rating, labelKey }) => (
            <button
              key={rating}
              type="button"
              onClick={() => onSubmit(rating)}
              className="w-full rounded-2xl py-4 text-base font-medium transition-opacity hover:opacity-90"
              style={{
                background: "var(--soft-beige)",
                color: "var(--deep-charcoal)",
              }}
            >
              {t(labelKey)}
            </button>
          ))}
        </div>

        <TextButton onClick={onSkip} className="py-2">
          {t("skip")}
        </TextButton>

        <span className="sr-only">{meal.title}</span>
      </div>
    </AtmosphereScreen>
  );
}
