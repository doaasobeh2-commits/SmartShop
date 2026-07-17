import { useState, type FormEvent } from "react";
import { AtmosphereScreen, PrimaryButton } from "@recipe-ai/shared";
import { ApiError } from "../api/client";
import {
  fetchMe,
  hasActiveAppEnrollment,
  hasPendingJoinRequest,
  listMyJoinRequests,
  resolveRecipeAccessGate,
  type RecipeAccessGate,
} from "../api/coreApi";
import { useAuth } from "../auth/AuthContext";
import { ErrorState, mapApiErrorMessage } from "../components/AsyncStates";
import { useI18n } from "../i18n/useI18n";

export type AuthNextStep = RecipeAccessGate;

type AuthScreenProps = {
  onAuthenticated: (next: AuthNextStep) => void;
};

export function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const { login, register } = useAuth();
  const { t, locale } = useI18n();
  const [mode, setMode] = useState<"login" | "register">("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (mode === "register") {
        await register({
          email: email.trim(),
          password,
          displayName: displayName.trim() || email.split("@")[0],
          ...(dateOfBirth.trim()
            ? { dateOfBirth: dateOfBirth.trim() }
            : {}),
        });
      } else {
        await login(email.trim(), password);
      }
      const me = await fetchMe();
      let pendingJoin = false;
      if (!me.householdId || !me.memberId) {
        try {
          const { joinRequests } = await listMyJoinRequests();
          pendingJoin = hasPendingJoinRequest(joinRequests);
        } catch {
          pendingJoin = false;
        }
      }
      const recipeEnabled = hasActiveAppEnrollment(me.enrollments ?? [], "recipe");
      onAuthenticated(
        resolveRecipeAccessGate({
          householdId: me.householdId,
          memberId: me.memberId,
          recipeEnabled,
          pendingJoin,
        }),
      );
    } catch (err) {
      if (err instanceof ApiError) {
        setError(mapApiErrorMessage(err.status, err.message, locale));
      } else {
        setError(t("unableToReachService"));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AtmosphereScreen atmosphere="kitchen-morning" contentLayout="bottom">
      <form
        onSubmit={onSubmit}
        className="flex min-h-full flex-col justify-end px-8 pb-12 pt-16"
      >
        <div className="mb-8 text-center text-white">
          <h1 className="mb-3 text-4xl font-semibold">
            {mode === "register" ? t("authTitleRegister") : t("authTitleLogin")}
          </h1>
          <p className="mx-auto max-w-xs text-base leading-relaxed text-white/85">
            {t("authSubtitle")}
          </p>
        </div>

        <div className="mb-6 space-y-3">
          {mode === "register" ? (
            <>
              <input
                type="text"
                placeholder={t("displayName")}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-base text-slate-900 outline-none"
                required
              />
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-base text-slate-900 outline-none"
                aria-label={t("dateOfBirth")}
              />
            </>
          ) : null}
          <input
            type="email"
            placeholder={t("email")}
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-base text-slate-900 outline-none"
            required
          />
          <input
            type="password"
            placeholder={t("password")}
            autoComplete={mode === "register" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={mode === "register" ? 12 : 1}
            className="w-full rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-base text-slate-900 outline-none"
            required
          />
        </div>

        {error ? (
          <div className="mb-4">
            <ErrorState title={t("couldNotContinue")} detail={error} />
          </div>
        ) : null}

        <PrimaryButton type="submit" disabled={submitting}>
          {submitting ? t("pleaseWait") : t("continue")}
        </PrimaryButton>

        <button
          type="button"
          className="mt-4 text-center text-sm text-white/80 underline"
          onClick={() => {
            setMode((m) => (m === "register" ? "login" : "register"));
            setError(null);
          }}
        >
          {mode === "register" ? t("alreadyHaveAccount") : t("needAccount")}
        </button>
      </form>
    </AtmosphereScreen>
  );
}
