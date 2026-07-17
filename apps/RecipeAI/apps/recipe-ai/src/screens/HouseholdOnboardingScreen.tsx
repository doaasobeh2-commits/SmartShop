import { AtmosphereScreen, PrimaryButton, TextButton } from "@recipe-ai/shared";
import type { JoinRequest } from "../api/coreApi";
import { useI18n } from "../i18n/useI18n";

type HouseholdOnboardingScreenProps = {
  pendingRequests: JoinRequest[];
  onCreateFamily: () => void;
  onJoinWithAddress: () => void;
  onViewPending: () => void;
  onSignOut: () => void;
};

export function HouseholdOnboardingScreen({
  pendingRequests,
  onCreateFamily,
  onJoinWithAddress,
  onViewPending,
  onSignOut,
}: HouseholdOnboardingScreenProps) {
  const { t } = useI18n();
  const pendingCount = pendingRequests.filter((r) => r.status === "pending").length;

  return (
    <AtmosphereScreen atmosphere="kitchen-morning" contentLayout="bottom">
      <div className="flex min-h-full flex-col justify-end px-8 pb-12 pt-16 text-white">
        <h1 className="mb-3 text-4xl font-semibold">{t("setupKitchenTitle")}</h1>
        <p className="mb-8 max-w-sm text-base leading-relaxed text-white/85">
          {t("setupKitchenBody")}
        </p>

        {pendingCount > 0 ? (
          <div className="mb-6 rounded-2xl bg-white/15 px-4 py-3 text-sm text-white/90">
            {t(pendingCount === 1 ? "pendingJoinBanner" : "pendingJoinBannerPlural", {
              count: pendingCount,
            })}
            <button
              type="button"
              className="mt-2 block underline"
              onClick={onViewPending}
            >
              {t("viewPending")}
            </button>
          </div>
        ) : null}

        <div className="space-y-3">
          <PrimaryButton onClick={onCreateFamily}>{t("createFamily")}</PrimaryButton>
          <TextButton onClick={onJoinWithAddress}>{t("joinWithAddress")}</TextButton>
          <button
            type="button"
            className="w-full pt-2 text-center text-sm text-white/75 underline"
            onClick={onSignOut}
          >
            {t("signOut")}
          </button>
        </div>
      </div>
    </AtmosphereScreen>
  );
}
