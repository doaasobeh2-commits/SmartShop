import type {
  MealFeedbackRating,
  MealRecommendation,
} from "@recipe-ai/core/types";
import { TextButton } from "@recipe-ai/shared";
import { DishThumbnail } from "../components/DishThumbnail";
import { LivingKitchenPanel } from "../components/LivingKitchenPanel";
import { SAFE_BOTTOM } from "../components/livingKitchenVisual";
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

export function FeedbackScreen({
  meal,
  onSubmit,
  onSkip,
}: FeedbackScreenProps) {
  const { t } = useI18n();

  return (
    <LivingKitchenPanel>
      <div
        className="flex min-h-0 flex-1 flex-col items-center px-7 pt-5 text-center"
        style={{ paddingBottom: SAFE_BOTTOM }}
      >
        <div
          className="mb-4 w-full max-w-[16rem] overflow-hidden rounded-[1.35rem] border"
          style={{
            borderColor: "rgba(240, 237, 232, 0.95)",
            boxShadow: "0 14px 32px rgba(58, 36, 22, 0.08)",
            background: "rgba(255, 253, 249, 0.96)",
          }}
        >
          <DishThumbnail
            imageUrl={meal.imageUrl}
            title={meal.title}
            size="hero"
            className="aspect-[4/3]"
          />
        </div>

        <h1
          className="mb-1.5 text-[1.85rem] font-semibold leading-tight"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--brand-primary)",
          }}
        >
          {t("howWasDinner")}
        </h1>
        <p
          className="mb-1.5 text-base font-medium"
          style={{ color: "var(--deep-charcoal)" }}
        >
          {meal.title}
        </p>
        <p
          className="mb-6 max-w-xs text-sm leading-relaxed"
          style={{ color: "var(--warm-gray)" }}
        >
          {t("feedbackHelps")}
        </p>

        <div className="mb-4 w-full max-w-sm space-y-2.5">
          {options.map(({ rating, labelKey }) => (
            <button
              key={rating}
              type="button"
              onClick={() => onSubmit(rating)}
              className="w-full rounded-2xl py-3.5 text-base font-medium transition-opacity hover:opacity-90"
              style={{
                background: "rgba(255, 253, 249, 0.96)",
                color: "var(--deep-charcoal)",
                border: "1px solid rgba(240, 237, 232, 0.95)",
                boxShadow: "0 6px 16px rgba(58, 36, 22, 0.04)",
              }}
            >
              {t(labelKey)}
            </button>
          ))}
        </div>

        <TextButton onClick={onSkip} className="py-2">
          {t("backToTonight")}
        </TextButton>
      </div>
    </LivingKitchenPanel>
  );
}
