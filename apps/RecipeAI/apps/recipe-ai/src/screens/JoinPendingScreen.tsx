import { useCallback, useEffect, useState } from "react";
import { AtmosphereScreen, PrimaryButton, TextButton } from "@recipe-ai/shared";
import { ApiError } from "../api/client";
import {
  fetchMe,
  listMyJoinRequests,
  type JoinRequest,
} from "../api/coreApi";
import { useAuth } from "../auth/AuthContext";
import { ErrorState, LoadingState, mapApiErrorMessage } from "../components/AsyncStates";
import { useI18n } from "../i18n/useI18n";

type JoinPendingScreenProps = {
  onBackToHub: () => void;
  onApproved: () => void;
  onSignOut: () => void;
};

const POLL_MS = 8000;

export function JoinPendingScreen({
  onBackToHub,
  onApproved,
  onSignOut,
}: JoinPendingScreenProps) {
  const { refresh } = useAuth();
  const { t, locale } = useI18n();
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [res, me] = await Promise.all([listMyJoinRequests(), fetchMe()]);
      setRequests(res.joinRequests);
      if (me.householdId && me.memberId) {
        await refresh();
        onApproved();
        return;
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(mapApiErrorMessage(err.status, err.message, locale));
      } else {
        setError(t("couldNotLoadRequests"));
      }
    } finally {
      setLoading(false);
    }
  }, [refresh, onApproved, locale, t]);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => {
      void load();
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [load]);

  const pending = requests.filter((r) => r.status === "pending");
  const latest = pending[0] ?? requests[0];

  return (
    <AtmosphereScreen atmosphere="kitchen-morning" contentLayout="bottom">
      <div className="flex min-h-full flex-col justify-end px-8 pb-12 pt-16 text-white">
        <h1 className="mb-3 text-4xl font-semibold">{t("waitingApprovalTitle")}</h1>
        <p className="mb-6 max-w-sm text-base leading-relaxed text-white/85">
          {t("waitingApprovalBody")}
        </p>

        {loading && requests.length === 0 ? (
          <div className="mb-6">
            <LoadingState label={t("checkingRequest")} />
          </div>
        ) : null}

        {latest ? (
          <div className="mb-6 rounded-2xl bg-white/15 px-4 py-3 text-sm text-white/90">
            <div className="font-medium capitalize">{latest.status}</div>
            <div className="text-white/70">
              {t("roleExpires", {
                role: latest.requestedRole,
                when: new Date(latest.expiresAt).toLocaleString(locale),
              })}
            </div>
          </div>
        ) : (
          <div className="mb-6 rounded-2xl bg-white/15 px-4 py-3 text-sm text-white/90">
            {t("noOpenRequests")}
          </div>
        )}

        {error ? (
          <div className="mb-4">
            <ErrorState
              title={t("refreshFailed")}
              detail={error}
              onRetry={() => void load()}
              retryLabel={t("retry")}
            />
          </div>
        ) : null}

        <PrimaryButton onClick={() => void load()}>{t("refreshStatus")}</PrimaryButton>
        <div className="mt-3 space-y-2">
          <TextButton onClick={onBackToHub}>{t("backToSetup")}</TextButton>
          <button
            type="button"
            className="w-full text-center text-sm text-white/75 underline"
            onClick={onSignOut}
          >
            {t("signOut")}
          </button>
        </div>
      </div>
    </AtmosphereScreen>
  );
}
