import { PrimaryButton, TextButton } from "@recipe-ai/shared";
import type { JoinRequest } from "../api/coreApi";
import { OnboardingScreenLayout } from "../components/OnboardingScreenLayout";
import { ONBOARDING_HERO_IMAGES } from "../data/onboardingImagery";
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
  const pendingCount = pendingRequests.filter(
    (r) => r.status === "pending",
  ).length;

  return (
    <OnboardingScreenLayout
      heroImage={ONBOARDING_HERO_IMAGES.householdHub}
      atmosphere="kitchen-morning"
    >
      <h1
        className="mb-2 text-[2.15rem] font-semibold leading-tight"
        style={{
          color: "var(--brand-primary)",
          fontFamily: "var(--font-display)",
        }}
      >
        {t("setupKitchenTitle")}
      </h1>
      <p
        className="mb-5 max-w-sm text-sm leading-relaxed"
        style={{ color: "var(--warm-gray)" }}
      >
        {t("setupKitchenBody")}
      </p>

      {pendingCount > 0 ? (
        <div
          className="mb-6 rounded-2xl border px-4 py-3 text-sm"
          style={{
            background: "rgba(255, 253, 249, 0.9)",
            borderColor: "var(--soft-beige)",
            color: "var(--deep-charcoal)",
          }}
        >
          {t(
            pendingCount === 1
              ? "pendingJoinBanner"
              : "pendingJoinBannerPlural",
            {
              count: pendingCount,
            },
          )}
          <button
            type="button"
            className="mt-2 block underline"
            onClick={onViewPending}
          >
            {t("viewPending")}
          </button>
        </div>
      ) : null}

      <div className="mt-auto space-y-3">
        <PrimaryButton onClick={onCreateFamily}>
          {t("createFamily")}
        </PrimaryButton>
        <TextButton onClick={onJoinWithAddress}>
          {t("joinWithAddress")}
        </TextButton>
        <button
          type="button"
          className="w-full pt-2 text-center text-sm underline"
          style={{ color: "var(--warm-gray)" }}
          onClick={onSignOut}
        >
          {t("signOut")}
        </button>
      </div>
    </OnboardingScreenLayout>
  );
}
