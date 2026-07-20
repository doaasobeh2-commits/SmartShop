import type { MealRecommendation } from "@recipe-ai/core/types";
import { InventoryRow, PrimaryButton, TextButton } from "@recipe-ai/shared";
import { LivingKitchenPanel } from "../components/LivingKitchenPanel";
import { ResponsiveDishImage } from "../components/DishImageSurface";
import { SAFE_BOTTOM, STRIP_HERO_BRIDGE } from "../components/livingKitchenVisual";
import { useI18n } from "../i18n/useI18n";

type RecipePreviewScreenProps = {
  meal: MealRecommendation;
  onStartCook: () => void;
  onBack: () => void;
  /** Pantry-origin actions — omit for Tonight preview */
  pantryActions?: {
    canReplaceToday: boolean;
    plannedTitle?: string;
    replaceConfirming: boolean;
    futureSaved: boolean;
    onRequestReplaceToday: () => void;
    onConfirmReplaceToday: () => void;
    onCancelReplaceToday: () => void;
    onSaveForFuturePlan: () => void;
  };
};

export function RecipePreviewScreen({
  meal,
  onStartCook,
  onBack,
  pantryActions,
}: RecipePreviewScreenProps) {
  const { t } = useI18n();
  const haveItems = meal.ingredients.filter((i) => i.status === "have");
  const needItems = meal.ingredients.filter((i) => i.status === "need");
  const fromPantry = Boolean(pantryActions);

  return (
    <LivingKitchenPanel>
      <div
        className="flex min-h-0 flex-1 flex-col overflow-y-auto"
        style={{ paddingBottom: SAFE_BOTTOM }}
      >
        <div className="relative w-full shrink-0 overflow-hidden">
          <ResponsiveDishImage
            imageUrl={meal.imageUrl}
            alt={meal.title}
            preset="mobile-lg"
            className="max-h-[240px] min-h-[168px]"
            aspectRatio="16 / 10"
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[48%]"
            style={{ background: STRIP_HERO_BRIDGE }}
            aria-hidden
          />
        </div>

        <div className="relative z-10 -mt-4 px-7 pb-4">
          <h1
            className="mb-1.5 text-[2.15rem] font-semibold leading-tight"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--brand-primary)",
            }}
          >
            {meal.title}
          </h1>
          <p className="mb-2 text-sm" style={{ color: "var(--warm-gray)" }}>
            {t("minutesCuisine", {
              minutes: meal.prepMinutes,
              cuisine: meal.cuisine,
            })}
            {meal.servings
              ? ` · ${t("servingsCount", { count: meal.servings })}`
              : null}
          </p>
          <p
            className="mb-5 text-sm leading-relaxed"
            style={{ color: "var(--deep-charcoal)" }}
          >
            {meal.reason}
          </p>

          {haveItems.length > 0 && (
            <section className="mb-5">
              <p
                className="mb-2 text-xs font-medium uppercase tracking-[0.12em]"
                style={{ color: "var(--warm-gray)" }}
              >
                {t("fromYourKitchen")}
                <span className="ms-1 normal-case tracking-normal opacity-80">
                  ({t("inventoryDemoLabel")})
                </span>
              </p>
              {haveItems.map((item) => (
                <InventoryRow key={item.id} item={item} />
              ))}
            </section>
          )}

          {needItems.length > 0 && (
            <section className="mb-6">
              <p
                className="mb-2 text-xs font-medium uppercase tracking-[0.12em]"
                style={{ color: "var(--warm-gray)" }}
              >
                {t("pickUp")}
              </p>
              {needItems.map((item) => (
                <InventoryRow key={item.id} item={item} />
              ))}
            </section>
          )}

          {meal.tips.length > 0 ? (
            <section className="mb-6">
              <p
                className="mb-1.5 text-xs font-medium uppercase tracking-[0.12em]"
                style={{ color: "var(--warm-gray)" }}
              >
                {t("recipeTips")}
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--deep-charcoal)" }}
              >
                {meal.tips[0]}
              </p>
            </section>
          ) : null}

          {pantryActions?.replaceConfirming ? (
            <div
              className="mb-4 rounded-2xl border px-4 py-3"
              style={{
                borderColor: "rgba(240, 237, 232, 0.95)",
                background: "rgba(255, 253, 249, 0.96)",
              }}
            >
              <p
                className="mb-3 text-sm leading-relaxed"
                style={{ color: "var(--deep-charcoal)" }}
              >
                {t("replaceTodayConfirmBody", {
                  planned: pantryActions.plannedTitle ?? "",
                  next: meal.title,
                })}
              </p>
              <PrimaryButton
                onClick={pantryActions.onConfirmReplaceToday}
                className="mb-2"
              >
                {t("replaceTodayConfirm")}
              </PrimaryButton>
              <TextButton
                onClick={pantryActions.onCancelReplaceToday}
                className="mx-auto block py-2"
              >
                {t("cancel")}
              </TextButton>
            </div>
          ) : (
            <>
              <PrimaryButton onClick={onStartCook} className="mb-3">
                {fromPantry ? t("cookThisNow") : t("startCooking")}
              </PrimaryButton>

              {pantryActions?.canReplaceToday ? (
                <button
                  type="button"
                  onClick={pantryActions.onRequestReplaceToday}
                  className="mb-2 w-full rounded-2xl border px-4 py-3 text-center text-sm font-semibold"
                  style={{
                    borderColor: "rgba(240, 237, 232, 0.95)",
                    background: "rgba(255, 253, 249, 0.96)",
                    color: "var(--brand-primary)",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {t("replaceTodayMeal")}
                </button>
              ) : null}

              {pantryActions ? (
                <button
                  type="button"
                  onClick={pantryActions.onSaveForFuturePlan}
                  disabled={pantryActions.futureSaved}
                  className="mb-3 w-full rounded-2xl px-4 py-2.5 text-center text-sm"
                  style={{
                    color: "var(--warm-gray)",
                    background: "rgba(90, 64, 48, 0.04)",
                  }}
                >
                  {pantryActions.futureSaved
                    ? t("savedForFuturePlan")
                    : t("saveForFuturePlan")}
                </button>
              ) : null}
            </>
          )}

          <TextButton onClick={onBack} className="mx-auto block py-2">
            {fromPantry ? t("back") : t("backToTonight")}
          </TextButton>
        </div>
      </div>
    </LivingKitchenPanel>
  );
}
