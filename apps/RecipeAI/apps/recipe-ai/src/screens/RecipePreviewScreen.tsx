import type { MealRecommendation } from "@recipe-ai/core/types";
import { AtmosphereScreen, InventoryRow, PrimaryButton, TextButton } from "@recipe-ai/shared";

type RecipePreviewScreenProps = {
  meal: MealRecommendation;
  onStartCook: () => void;
  onBack: () => void;
};

export function RecipePreviewScreen({ meal, onStartCook, onBack }: RecipePreviewScreenProps) {
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
            {meal.prepMinutes} minutes · {meal.cuisine}
          </p>

          {haveItems.length > 0 && (
            <section className="mb-10">
              <p
                className="mb-4 text-xs font-medium uppercase tracking-[0.12em]"
                style={{ color: "var(--warm-gray)" }}
              >
                From your kitchen
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
                Pick up
              </p>
              {needItems.map((item) => (
                <InventoryRow key={item.id} item={item} />
              ))}
            </section>
          )}

          <PrimaryButton onClick={onStartCook} className="mb-4">
            Start cooking
          </PrimaryButton>
          <TextButton onClick={onBack} className="mx-auto block py-2">
            Back
          </TextButton>
        </div>
      </div>
    </AtmosphereScreen>
  );
}
