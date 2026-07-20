import type {
  CuisineFamilyId,
  MealRecommendation,
  TonightDecisionContext,
} from "@recipe-ai/core/types";
import { PrimaryButton, TextButton } from "@recipe-ai/shared";
import { DishHeroCard } from "../components/DishHeroCard";
import { DishThumbnail } from "../components/DishThumbnail";
import { LivingKitchenPanel } from "../components/LivingKitchenPanel";
import { TonightContextPicker } from "../components/TonightContextPicker";
import { ONBOARDING_HERO_IMAGES } from "../data/onboardingImagery";
import { imageObjectPosition } from "../data/imageFocalPoints";
import { useI18n } from "../i18n/useI18n";

function PlannedCompanions({
  companions,
}: {
  companions: NonNullable<MealRecommendation["companions"]>;
}) {
  const { t } = useI18n();
  if (companions.length === 0) return null;
  return (
    <div className="mb-1 mt-3">
      <p
        className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.11em]"
        style={{ color: "var(--warm-gray)" }}
      >
        {t("servedWith")}
      </p>
      <ul className="space-y-2">
        {companions.map((companion) => (
          <li
            key={companion.recipeId}
            className="flex items-center gap-3 rounded-2xl border px-2.5 py-2"
            style={{
              borderColor: "rgba(240, 237, 232, 0.95)",
              background: "rgba(255, 253, 249, 0.94)",
            }}
          >
            <DishThumbnail
              imageUrl={companion.imageUrl}
              title={companion.title}
              size="md"
            />
            <span
              className="min-w-0 truncate text-[0.95rem] font-semibold leading-tight"
              style={{
                color: "var(--deep-charcoal)",
                fontFamily: "var(--font-display)",
              }}
            >
              {companion.title}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

type TonightScreenProps = {
  meal: MealRecommendation;
  candidateMeals?: MealRecommendation[];
  tonightContext: TonightDecisionContext;
  candidateCount: number;
  safetyBlocked?: boolean;
  fromWeeklyPlan?: boolean;
  onOccasionChange: (occasion: TonightDecisionContext["occasion"]) => void;
  onIntentChange: (
    intent: NonNullable<TonightDecisionContext["intent"]>,
  ) => void;
  onGuestPrimaryCuisineChange: (cuisineId: CuisineFamilyId) => void;
  onToggleGuestPreferredCuisine: (cuisineId: CuisineFamilyId) => void;
  onCook: () => void;
  onPreview: () => void;
  onSelectCandidate: (recipeId: string) => void;
  onCookWithWhatIHave: () => void;
  onOpenWeekPlan?: () => void;
  showWeekPlanLink?: boolean;
};

function needsMoreGuestContext(context: TonightDecisionContext): boolean {
  if (context.occasion === "guests") {
    return !context.guestPrimaryCuisineId || !context.intent;
  }
  return false;
}

export function TonightScreen({
  meal,
  candidateMeals = [],
  tonightContext,
  candidateCount,
  safetyBlocked = false,
  fromWeeklyPlan = false,
  onOccasionChange,
  onIntentChange,
  onGuestPrimaryCuisineChange,
  onToggleGuestPreferredCuisine,
  onCook,
  onPreview,
  onSelectCandidate,
  onCookWithWhatIHave,
  onOpenWeekPlan,
  showWeekPlanLink,
}: TonightScreenProps) {
  const { t } = useI18n();
  const missingCount = meal.ingredients.filter(
    (i) => i.status === "need",
  ).length;
  const incomplete = needsMoreGuestContext(tonightContext);
  const multiChoice =
    !fromWeeklyPlan && tonightContext.occasion === "guests";
  const rankedChoices = multiChoice ? candidateMeals.slice(0, 3) : [];

  return (
    <LivingKitchenPanel>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-7 pb-8 pt-3">
        <p
          className="mb-1 text-xs tracking-wide"
          style={{ color: "var(--warm-gray)" }}
        >
          {t("tonight")}
        </p>

        <TonightContextPicker
          occasion={tonightContext.occasion}
          intent={tonightContext.intent}
          guestPrimaryCuisineId={tonightContext.guestPrimaryCuisineId}
          guestPreferredCuisineIds={tonightContext.guestPreferredCuisineIds}
          onOccasionChange={onOccasionChange}
          onIntentChange={onIntentChange}
          onGuestPrimaryCuisineChange={onGuestPrimaryCuisineChange}
          onToggleGuestPreferredCuisine={onToggleGuestPreferredCuisine}
        />

        {incomplete ? (
          <div
            className="relative mb-4 overflow-hidden rounded-[1.35rem] border"
            style={{
              borderColor: "var(--soft-beige)",
              background: "rgba(255, 253, 249, 0.96)",
              boxShadow: "0 10px 28px rgba(58, 36, 22, 0.05)",
            }}
          >
            <div
              className="h-28 w-full bg-cover"
              style={{
                backgroundImage: `url(${ONBOARDING_HERO_IMAGES.cuisine})`,
                backgroundPosition: imageObjectPosition(
                  ONBOARDING_HERO_IMAGES.cuisine,
                ),
              }}
              aria-hidden
            />
            <div className="px-4 py-3.5">
              <p
                className="text-base font-semibold"
                style={{
                  color: "var(--brand-primary)",
                  fontFamily: "var(--font-display)",
                }}
              >
                {t("tonightContextTitle")}
              </p>
              <p
                className="mt-1 text-sm leading-relaxed"
                style={{ color: "var(--warm-gray)" }}
              >
                {t("tonightPickIntentHint")}
              </p>
            </div>
          </div>
        ) : candidateCount === 0 ? (
          <div
            className="mb-4 rounded-2xl border px-4 py-5"
            style={{
              background: "rgba(255, 253, 249, 0.94)",
              borderColor: "var(--soft-beige)",
            }}
          >
            <h2
              className="mb-2 text-xl font-semibold"
              style={{
                color: "var(--brand-primary)",
                fontFamily: "var(--font-display)",
              }}
            >
              {t(
                safetyBlocked
                  ? "guestSafetyBlockedTitle"
                  : "guestCatalogGapTitle",
              )}
            </h2>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--warm-gray)" }}
            >
              {t(
                safetyBlocked
                  ? "guestSafetyBlockedBody"
                  : "guestCatalogGapBody",
              )}
            </p>
          </div>
        ) : multiChoice ? (
          <div className="space-y-3">
            <p
              className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.11em]"
              style={{ color: "var(--warm-gray)" }}
            >
              {t("guestTopChoices")}
            </p>
            {rankedChoices.map((choice, index) => (
              <article
                key={choice.recipeId}
                className="overflow-hidden rounded-[1.35rem] border"
                style={{
                  borderColor: "rgba(240, 237, 232, 0.95)",
                  background: "rgba(255, 253, 249, 0.98)",
                  boxShadow: "0 10px 28px rgba(58, 36, 22, 0.05)",
                }}
              >
                <div className="flex gap-3 p-2.5">
                  <DishThumbnail
                    imageUrl={choice.imageUrl}
                    title={choice.title}
                    size="lg"
                    className="h-24 w-24"
                  />
                  <div className="min-w-0 flex-1 py-1">
                    <span
                      className="mb-1 block text-[0.62rem] font-semibold uppercase tracking-[0.12em]"
                      style={{ color: "var(--warm-gray)" }}
                    >
                      {t("rankedChoice", { number: index + 1 })}
                    </span>
                    <h2
                      className="truncate text-[1.2rem] font-semibold leading-tight"
                      style={{
                        color: "var(--brand-primary)",
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      {choice.title}
                    </h2>
                    <p
                      className="mt-1 line-clamp-2 text-xs leading-snug"
                      style={{ color: "var(--deep-charcoal)" }}
                    >
                      {choice.reason}
                    </p>
                    {choice.companions?.length ? (
                      <p
                        className="mt-1 truncate text-[0.7rem]"
                        style={{ color: "var(--warm-gray)" }}
                      >
                        {t("mealWithCompanion", {
                          name: choice.companions
                            .map((companion) => companion.title)
                            .join(", "),
                        })}
                      </p>
                    ) : null}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectCandidate(choice.recipeId)}
                  className="w-full border-t px-4 py-2.5 text-sm font-semibold"
                  style={{
                    borderColor: "rgba(240, 237, 232, 0.95)",
                    color: "var(--brand-primary)",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {t("chooseThisMeal")}
                </button>
              </article>
            ))}
          </div>
        ) : (
          <>
            <p
              className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.11em]"
              style={{ color: "var(--warm-gray)" }}
            >
              {fromWeeklyPlan
                ? t("tonightFromWeekPlan")
                : t("chosenForTonight")}
              {meal.recommendationBasis ? (
                <>
                  {" · "}
                  {t(
                    meal.recommendationBasis === "easy_familiar"
                      ? "recommendationHostFamiliar"
                      : meal.recommendationBasis === "guest_cuisine"
                        ? "recommendationGuestCuisine"
                        : "recommendationCuratedSpecial",
                  )}
                </>
              ) : null}
            </p>
            <DishHeroCard
              title={meal.title}
              imageUrl={meal.imageUrl}
              prepMinutes={meal.prepMinutes}
              cuisine={meal.cuisine}
              reason={meal.reason}
              servings={meal.servings}
              minutesCuisineLabel={t("minutesCuisine", {
                minutes: meal.prepMinutes,
                cuisine: meal.cuisine,
              })}
              servingsLabel={
                meal.servings
                  ? t("servingsCount", { count: meal.servings })
                  : undefined
              }
            />

            {meal.companions && meal.companions.length > 0 ? (
              <PlannedCompanions companions={meal.companions} />
            ) : null}

            {missingCount > 0 ? (
              <p
                className="mb-3 mt-3 text-sm"
                style={{ color: "var(--warm-gray)" }}
              >
                {t(missingCount === 1 ? "needItems" : "needItemsPlural", {
                  count: missingCount,
                })}
                <span className="ms-1 text-xs opacity-80">
                  ({t("inventoryDemoLabel")})
                </span>
              </p>
            ) : (
              <div className="mb-3 mt-3" />
            )}

            <PrimaryButton onClick={onCook} className="mb-2">
              {t("cookThis")}
            </PrimaryButton>

            <button
              type="button"
              onClick={onPreview}
              className="mb-1 text-center text-sm font-medium"
              style={{ color: "var(--warm-gray)" }}
            >
              {t("viewRecipe")}
            </button>

          </>
        )}

        <div className="mt-auto space-y-1 pt-3">
          <TextButton
            onClick={onCookWithWhatIHave}
            className="mx-auto block py-1.5"
          >
            {t("cookWithWhatIHave")}
          </TextButton>
          {showWeekPlanLink && onOpenWeekPlan ? (
            <TextButton
              onClick={onOpenWeekPlan}
              className="mx-auto block py-1.5"
            >
              {t("thisWeek")}
            </TextButton>
          ) : null}
        </div>
      </div>
    </LivingKitchenPanel>
  );
}
