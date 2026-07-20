import { useCallback, useEffect, useState } from "react";
import { ApiError } from "../api/client";
import {
  hasPendingJoinRequest,
  listMyJoinRequests,
  type AddressInput,
  type JoinRequest,
} from "../api/coreApi";
import { useAuth } from "../auth/AuthContext";
import {
  ErrorState,
  LoadingState,
  mapApiErrorMessage,
} from "../components/AsyncStates";
import { useI18n } from "../i18n/useI18n";
import { AddressDiscoverScreen } from "./AddressDiscoverScreen";
import { CreateHouseholdScreen } from "./CreateHouseholdScreen";
import { HouseholdOnboardingScreen } from "./HouseholdOnboardingScreen";
import { JoinPendingScreen } from "./JoinPendingScreen";

type Step = "hub" | "create" | "discover" | "pending";

type HouseholdOnboardingFlowProps = {
  onComplete: () => void;
};

export function HouseholdOnboardingFlow({
  onComplete,
}: HouseholdOnboardingFlowProps) {
  const auth = useAuth();
  const { t, locale } = useI18n();
  const [step, setStep] = useState<Step>("hub");
  const [pendingRequests, setPendingRequests] = useState<JoinRequest[]>([]);
  const [createAddress, setCreateAddress] = useState<
    Partial<AddressInput> | undefined
  >();
  const [bootLoading, setBootLoading] = useState(true);
  const [bootError, setBootError] = useState<string | null>(null);

  const loadPending = useCallback(async () => {
    setBootError(null);
    try {
      const res = await listMyJoinRequests();
      setPendingRequests(res.joinRequests);
      return res.joinRequests;
    } catch (err) {
      if (err instanceof ApiError) {
        setBootError(mapApiErrorMessage(err.status, err.message, locale));
      } else {
        setBootError(t("couldNotLoadOnboarding"));
      }
      return [] as JoinRequest[];
    }
  }, [locale, t]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setBootLoading(true);
      const requests = await loadPending();
      if (cancelled) return;
      if (hasPendingJoinRequest(requests)) {
        setStep("pending");
      }
      setBootLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [loadPending]);

  const signOut = () => {
    void auth.logout().then(() => onComplete());
  };

  if (bootLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <LoadingState label={t("checkingHouseholdSetup")} />
      </div>
    );
  }

  if (bootError && step === "hub") {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <ErrorState
          title={t("couldNotLoadSetup")}
          detail={bootError}
          onRetry={() => {
            setBootLoading(true);
            void loadPending().finally(() => setBootLoading(false));
          }}
          retryLabel={t("retry")}
        />
      </div>
    );
  }

  switch (step) {
    case "create":
      return (
        <CreateHouseholdScreen
          initialAddress={createAddress}
          onBack={() => {
            setCreateAddress(undefined);
            setStep("hub");
          }}
          onCreated={() => {
            void auth.refresh().then(() => onComplete());
          }}
        />
      );
    case "discover":
      return (
        <AddressDiscoverScreen
          onBack={() => setStep("hub")}
          onJoinRequested={() => {
            void loadPending().then(() => setStep("pending"));
          }}
          onCreateSeparate={(address) => {
            setCreateAddress(address);
            setStep("create");
          }}
        />
      );
    case "pending":
      return (
        <JoinPendingScreen
          onBackToHub={() => setStep("hub")}
          onApproved={() => {
            void auth.refresh().then(() => onComplete());
          }}
          onSignOut={signOut}
        />
      );
    case "hub":
    default:
      return (
        <HouseholdOnboardingScreen
          pendingRequests={pendingRequests}
          onCreateFamily={() => {
            setCreateAddress(undefined);
            setStep("create");
          }}
          onJoinWithAddress={() => setStep("discover")}
          onViewPending={() => setStep("pending")}
          onSignOut={signOut}
        />
      );
  }
}
