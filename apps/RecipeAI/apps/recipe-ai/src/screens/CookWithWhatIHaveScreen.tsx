import { useState } from "react";
import { AtmosphereScreen, PrimaryButton, TextButton } from "@recipe-ai/shared";
import { useI18n } from "../i18n/useI18n";

type CookWithWhatIHaveScreenProps = {
  onFindMeal: (query: string) => void;
  onBack: () => void;
};

export function CookWithWhatIHaveScreen({ onFindMeal, onBack }: CookWithWhatIHaveScreenProps) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");

  return (
    <AtmosphereScreen atmosphere="vegetables-fresh" contentLayout="bottom">
      <div className="flex min-h-full flex-col px-8 pb-12 pt-16">
        <h1 className="meal-title mb-4 text-4xl text-white">{t("whatDoYouHave")}</h1>
        <p className="mb-10 max-w-sm text-base leading-relaxed text-white/70">
          {t("whatDoYouHaveBody")}
        </p>

        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("haveIngredientsPlaceholder")}
          rows={3}
          className="mb-10 w-full resize-none rounded-2xl border-0 p-5 text-base outline-none"
          style={{
            background: "rgba(250, 249, 247, 0.92)",
            color: "var(--deep-charcoal)",
          }}
        />

        <PrimaryButton onClick={() => query.trim() && onFindMeal(query.trim())} disabled={!query.trim()}>
          {t("findMeal")}
        </PrimaryButton>
        <TextButton onClick={onBack} className="mx-auto mt-6 block py-2 !text-white/70">
          {t("back")}
        </TextButton>
      </div>
    </AtmosphereScreen>
  );
}
