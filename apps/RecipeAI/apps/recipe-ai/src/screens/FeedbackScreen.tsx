import type { MealFeedbackRating, MealRecommendation } from "@recipe-ai/core/types";
import { AtmosphereScreen, TextButton } from "@recipe-ai/shared";

type FeedbackScreenProps = {
  meal: MealRecommendation;
  onSubmit: (rating: MealFeedbackRating) => void;
  onSkip: () => void;
};

const options: { rating: MealFeedbackRating; label: string }[] = [
  { rating: "loved", label: "Loved it" },
  { rating: "good", label: "It was good" },
  { rating: "not-for-us", label: "Not for us" },
];

export function FeedbackScreen({ meal, onSubmit, onSkip }: FeedbackScreenProps) {
  return (
    <AtmosphereScreen atmosphere="dinner-complete" contentLayout="bottom">
      <div className="flex min-h-full flex-col items-center px-8 pb-12 pt-16 text-center">
        <div
          className="mb-8 h-20 w-20 shrink-0 rounded-2xl"
          style={{
            background: "linear-gradient(135deg, #C4A574 0%, #8B6914 100%)",
            boxShadow: "0 8px 32px rgba(26, 25, 24, 0.12)",
          }}
          aria-hidden
        />

        <h1 className="meal-title mb-4 text-4xl">How was dinner tonight?</h1>
        <p className="mb-12 max-w-xs text-sm leading-relaxed" style={{ color: "var(--warm-gray)" }}>
          Your feedback helps Recipe AI learn your household.
        </p>

        <div className="mb-8 w-full max-w-sm space-y-3">
          {options.map(({ rating, label }) => (
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
              {label}
            </button>
          ))}
        </div>

        <TextButton onClick={onSkip} className="py-2">
          Skip
        </TextButton>

        <span className="sr-only">{meal.title}</span>
      </div>
    </AtmosphereScreen>
  );
}
