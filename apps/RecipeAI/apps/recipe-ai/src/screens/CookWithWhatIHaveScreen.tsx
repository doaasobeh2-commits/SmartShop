import { useState } from "react";
import { AtmosphereScreen, PrimaryButton, TextButton } from "@recipe-ai/shared";

type CookWithWhatIHaveScreenProps = {
  onFindMeal: (query: string) => void;
  onBack: () => void;
};

export function CookWithWhatIHaveScreen({ onFindMeal, onBack }: CookWithWhatIHaveScreenProps) {
  const [query, setQuery] = useState("");

  return (
    <AtmosphereScreen atmosphere="vegetables-fresh" contentLayout="bottom">
      <div className="flex min-h-full flex-col px-8 pb-12 pt-16">
        <h1 className="meal-title mb-4 text-4xl text-white">What do you have?</h1>
        <p className="mb-10 max-w-sm text-base leading-relaxed text-white/70">
          Tell us what&apos;s in your kitchen. We&apos;ll find the best match.
        </p>

        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="I have chicken and yogurt…"
          rows={3}
          className="mb-10 w-full resize-none rounded-2xl border-0 p-5 text-base outline-none"
          style={{
            background: "rgba(250, 249, 247, 0.92)",
            color: "var(--deep-charcoal)",
          }}
        />

        <PrimaryButton onClick={() => query.trim() && onFindMeal(query.trim())} disabled={!query.trim()}>
          Find a meal
        </PrimaryButton>
        <TextButton onClick={onBack} className="mx-auto mt-6 block py-2 !text-white/70">
          Back
        </TextButton>
      </div>
    </AtmosphereScreen>
  );
}
