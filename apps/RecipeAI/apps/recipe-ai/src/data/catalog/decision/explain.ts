import type { RecommendationReasonCode } from "@recipe-ai/core/types";
import type { AppLocale } from "../../../i18n/types";
import type { MessageKey } from "../../../i18n/types";

export const REASON_MESSAGE_KEYS: Record<RecommendationReasonCode, MessageKey> =
  {
    FROM_WEEKLY_PLAN: "reasonFromWeeklyPlan",
    USES_AVAILABLE_INGREDIENTS: "reasonUsesAvailableIngredients",
    FAMILY_FAMILIAR: "reasonFamilyFamiliar",
    GUEST_FAMILIAR: "reasonGuestFamiliar",
    EASY_FOR_HOST: "reasonEasyForHost",
    CONTROLLED_DISCOVERY: "reasonControlledDiscovery",
    SPECIAL_OCCASION: "reasonSpecialOccasion",
    GOOD_PANTRY_MATCH: "reasonGoodPantryMatch",
    GUEST_SURPRISE: "reasonGuestSurprise",
    SOMEONE_SPECIAL: "reasonSomeoneSpecial",
  };

/** Calm 1–2 line reason from winning codes + optional dish blurb. */
export function composeReasonText(
  codes: RecommendationReasonCode[],
  dishReason: string,
  t: (key: MessageKey) => string,
  locale: AppLocale,
): string {
  void locale;
  const parts = codes.slice(0, 2).map((code) => t(REASON_MESSAGE_KEYS[code]));
  if (parts.length === 0) return dishReason;
  if (parts.length === 1) return `${parts[0]} — ${dishReason}`;
  return `${parts[0]} · ${parts[1]}`;
}
