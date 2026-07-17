import type { MealRecommendation } from "@recipe-ai/core/types";
import { AtmosphereScreen, InventoryRow, PrimaryButton, TextButton } from "@recipe-ai/shared";
import { useI18n } from "../i18n/useI18n";

type RecipePreviewScreenProps = {
  meal: MealRecommendation;
  onStartCook: () => void;
  onBack: () => void;
};

export function RecipePreviewScreen({ meal, onStartCook, onBack }: RecipePreviewScreenProps) {
  const { t } = useI18n();
  const haveItems = meal.ingredients.filter((i) => i.status === "have");
  const needItems = meal.ingredients.filter((i) => i.status === "need");

  return (
    <AtmosphereScreen atmosphere="meal-preview" contentLayout="scroll">
      <div className="screen-scroll">
        <div className="h-[42vh] shrink-0" aria-hidden />

        <div
          className="relative -mt-8 rounded-t-[2rem] px-8 pb-12 pt-10"
          style={{ background: "var(--warm-white)" }}
        >
          <h1 className="meal-title mb-2 text-4xl">{meal.title}</h1>
          <p className="mb-10 text-base" style={{ color: "var(--warm-gray)" }}>
            {t("minutesCuisine", {
              minutes: meal.prepMinutes,
              cuisine: meal.cuisine,
            })}
          </p>

          {haveItems.length > 0 && (
            <section className="mb-10">
              <p
                className="mb-4 text-xs font-medium uppercase tracking-[0.12em]"
                style={{ color: "var(--warm-gray)" }}
              >
                {t("fromYourKitchen")}
              </p>
              {haveItems.map((item) => (
                <InventoryRow key={item.id} item={item} />
              ))}
            </section>
          )}

          {needItems.length > 0 && (
            <section className="mb-12">
              <p
                className="mb-4 text-xs font-medium uppercase tracking-[0.12em]"
                style={{ color: "var(--warm-gray)" }}
              >
                {t("pickUp")}
              </p>
              {needItems.map((item) => (
                <InventoryRow key={item.id} item={item} />
              ))}
            </section>
          )}

          <PrimaryButton onClick={onStartCook} className="mb-4">
            {t("startCooking")}
          </PrimaryButton>
          <TextButton onClick={onBack} className="mx-auto block py-2">
            {t("back")}
          </TextButton>
        </div>
      </div>
    </AtmosphereScreen>
  );
}
