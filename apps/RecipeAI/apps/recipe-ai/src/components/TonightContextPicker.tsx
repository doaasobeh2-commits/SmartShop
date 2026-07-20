import { useEffect } from "react";
import { Chip } from "@recipe-ai/shared";
import type {
  CuisineFamilyId,
  TonightMealIntent,
  TonightOccasion,
} from "@recipe-ai/core/types";
import { getCuisineOnboardingOptions } from "../data/cuisineOnboarding";
import { useI18n } from "../i18n/useI18n";
import type { MessageKey } from "../i18n/types";

const OCCASION_OPTIONS: { value: TonightOccasion; labelKey: MessageKey }[] = [
  { value: "household", labelKey: "tonightOccasionHousehold" },
  { value: "guests", labelKey: "tonightOccasionGuests" },
];

const INTENT_OPTIONS: { value: TonightMealIntent; labelKey: MessageKey }[] = [
  { value: "familiar", labelKey: "tonightIntentFamiliar" },
  { value: "special", labelKey: "tonightIntentSpecial" },
  { value: "surprise", labelKey: "tonightIntentSurprise" },
];

type TonightContextPickerProps = {
  occasion: TonightOccasion;
  intent?: TonightMealIntent;
  guestPrimaryCuisineId?: CuisineFamilyId;
  guestPreferredCuisineIds: CuisineFamilyId[];
  onOccasionChange: (occasion: TonightOccasion) => void;
  onIntentChange: (intent: TonightMealIntent) => void;
  onGuestPrimaryCuisineChange: (cuisineId: CuisineFamilyId) => void;
  onToggleGuestPreferredCuisine: (cuisineId: CuisineFamilyId) => void;
};

export function TonightContextPicker({
  occasion,
  intent,
  guestPrimaryCuisineId,
  guestPreferredCuisineIds,
  onOccasionChange,
  onIntentChange,
  onGuestPrimaryCuisineChange,
  onToggleGuestPreferredCuisine,
}: TonightContextPickerProps) {
  const { t, locale } = useI18n();
  const cuisineOptions = getCuisineOnboardingOptions(locale);
  const showGuestCuisine = occasion === "guests";
  const showIntent =
    occasion === "guests" && guestPrimaryCuisineId !== undefined;

  useEffect(() => {
    if (occasion === "friend") {
      onOccasionChange("household");
    }
  }, [occasion, onOccasionChange]);

  return (
    <div className="mb-3 space-y-2.5">
      <div>
        <p
          className="mb-1.5 text-xs font-medium"
          style={{ color: "var(--warm-gray)" }}
        >
          {t("tonightOccasionPrompt")}
        </p>
        <div className="flex flex-wrap gap-1.5" dir="auto">
          {OCCASION_OPTIONS.map(({ value, labelKey }) => (
            <Chip
              key={value}
              selected={occasion === value}
              onClick={() => onOccasionChange(value)}
            >
              {t(labelKey)}
            </Chip>
          ))}
        </div>
      </div>

      {showGuestCuisine ? (
        <div
          className="rounded-2xl border px-3 py-2.5"
          style={{
            borderColor: "var(--soft-beige)",
            background: "rgba(255, 253, 249, 0.9)",
          }}
        >
          <p
            className="mb-0.5 text-xs font-semibold"
            style={{ color: "var(--deep-charcoal)" }}
          >
            {t("guestCuisinePrompt")}
          </p>
          <p
            className="mb-2 text-[0.7rem] leading-snug"
            style={{ color: "var(--warm-gray)" }}
          >
            {t("guestCuisineHelp")}
          </p>
          <select
            value={guestPrimaryCuisineId ?? ""}
            onChange={(event) =>
              onGuestPrimaryCuisineChange(event.target.value as CuisineFamilyId)
            }
            className="mb-2.5 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none"
            style={{
              borderColor: "var(--soft-beige)",
              color: "var(--deep-charcoal)",
            }}
            aria-label={t("guestPrimaryCuisine")}
          >
            <option value="" disabled>
              {t("guestPrimaryCuisine")}
            </option>
            {cuisineOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>

          <p
            className="mb-1.5 text-[0.7rem] font-medium"
            style={{ color: "var(--warm-gray)" }}
          >
            {t("guestPreferredCuisines")}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {cuisineOptions
              .filter((option) => option.id !== guestPrimaryCuisineId)
              .map((option) => {
                const id = option.id as CuisineFamilyId;
                return (
                  <Chip
                    key={id}
                    selected={guestPreferredCuisineIds.includes(id)}
                    onClick={() => onToggleGuestPreferredCuisine(id)}
                  >
                    {option.label}
                  </Chip>
                );
              })}
          </div>
          <p
            className="mt-1.5 text-[0.65rem]"
            style={{ color: "var(--warm-gray)" }}
          >
            {t("guestPreferredLimit")}
          </p>
        </div>
      ) : null}

      {showIntent ? (
        <div>
          <p
            className="mb-1.5 text-xs font-medium"
            style={{ color: "var(--warm-gray)" }}
          >
            {t("tonightIntentPrompt")}
          </p>
          <div className="grid grid-cols-1 gap-1.5">
            {INTENT_OPTIONS.map(({ value, labelKey }) => (
              <button
                key={value}
                type="button"
                aria-pressed={intent === value}
                onClick={() => onIntentChange(value)}
                className="rounded-xl border px-3 py-2 text-start text-sm font-medium transition-colors"
                style={{
                  borderColor:
                    intent === value
                      ? "var(--brand-primary)"
                      : "var(--soft-beige)",
                  background:
                    intent === value
                      ? "rgba(92, 60, 38, 0.08)"
                      : "rgba(255, 253, 249, 0.92)",
                  color:
                    intent === value
                      ? "var(--brand-primary)"
                      : "var(--deep-charcoal)",
                }}
              >
                {t(labelKey)}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
