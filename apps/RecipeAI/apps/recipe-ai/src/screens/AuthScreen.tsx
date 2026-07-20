import { useState, type FormEvent } from "react";
import { PrimaryButton } from "@recipe-ai/shared";
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
import { OnboardingScreenLayout } from "../components/OnboardingScreenLayout";
import { ONBOARDING_HERO_IMAGES } from "../data/onboardingImagery";
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
          ...(dateOfBirth.trim() ? { dateOfBirth: dateOfBirth.trim() } : {}),
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
      const recipeEnabled = hasActiveAppEnrollment(
        me.enrollments ?? [],
        "recipe",
      );
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
    <OnboardingScreenLayout
      heroImage={ONBOARDING_HERO_IMAGES.auth}
      atmosphere="kitchen-morning"
    >
      <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
        <h1
          className="mb-2 text-[2.15rem] font-semibold leading-tight"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--brand-primary)",
          }}
        >
          {mode === "register" ? t("authTitleRegister") : t("authTitleLogin")}
        </h1>
        <p
          className="mb-5 max-w-sm text-sm leading-relaxed"
          style={{ color: "var(--warm-gray)" }}
        >
          {t("authSubtitle")}
        </p>

        <div className="mb-5 space-y-2.5">
          {mode === "register" ? (
            <>
              <input
                type="text"
                placeholder={t("displayName")}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-2xl border px-4 py-3 text-base outline-none"
                style={{
                  borderColor: "var(--soft-beige)",
                  color: "var(--deep-charcoal)",
                }}
                required
              />
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full rounded-2xl border px-4 py-3 text-base outline-none"
                style={{
                  borderColor: "var(--soft-beige)",
                  color: "var(--deep-charcoal)",
                }}
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
            className="w-full rounded-2xl border px-4 py-3 text-base outline-none"
            style={{
              borderColor: "var(--soft-beige)",
              color: "var(--deep-charcoal)",
            }}
            required
          />
          <input
            type="password"
            placeholder={t("password")}
            autoComplete={
              mode === "register" ? "new-password" : "current-password"
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={mode === "register" ? 12 : 1}
            className="w-full rounded-2xl border px-4 py-3 text-base outline-none"
            style={{
              borderColor: "var(--soft-beige)",
              color: "var(--deep-charcoal)",
            }}
            required
          />
        </div>

        {error ? (
          <div className="mb-4">
            <ErrorState title={t("couldNotContinue")} detail={error} />
          </div>
        ) : null}

        <div className="mt-auto space-y-4">
          <PrimaryButton type="submit" disabled={submitting}>
            {submitting ? t("pleaseWait") : t("continue")}
          </PrimaryButton>

          <button
            type="button"
            className="w-full text-center text-sm font-medium underline"
            style={{ color: "var(--brand-primary)" }}
            onClick={() => {
              setMode((m) => (m === "register" ? "login" : "register"));
              setError(null);
            }}
          >
            {mode === "register" ? t("alreadyHaveAccount") : t("needAccount")}
          </button>
        </div>
      </form>
    </OnboardingScreenLayout>
  );
}
