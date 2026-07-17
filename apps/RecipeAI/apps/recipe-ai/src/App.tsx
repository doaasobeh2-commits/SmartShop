import { AppShell } from "@recipe-ai/shared";
import { useEffect } from "react";
import { useAuth } from "./auth/AuthContext";
import {
  ErrorState,
  LoadingState,
  mapApiErrorMessage,
} from "./components/AsyncStates";
import { useAppState } from "./hooks/useAppState";
import { useI18n } from "./i18n/useI18n";
import {
  AuthScreen,
  CookModeScreen,
  CookWithWhatIHaveScreen,
  FeedbackScreen,
  HouseholdOnboardingFlow,
  RecipeNotEnabledScreen,
  RecipePreviewScreen,
  TonightScreen,
  WeeklyPlanOptInScreen,
  WeeklyPlanScreen,
  WelcomeScreen,
} from "./screens";

/**
 * ProfileSetupScreen / PreferencesPage remain in the codebase for a later
 * product-profile phase keyed by household_member_id. They are not in the
 * active Phase 4b household-onboarding flow.
 */
export function App() {
  const auth = useAuth();
  const state = useAppState();
  const { t, locale } = useI18n();

  useEffect(() => {
    if (auth.status === "loading") return;
    if (auth.status === "anonymous") {
      if (
        state.currentScreen !== "welcome" &&
        state.currentScreen !== "auth"
      ) {
        state.replace("welcome");
      }
      return;
    }
    if (!auth.hasHousehold || !auth.recipeEnabled) {
      return;
    }
    if (
      auth.recipeEnabled &&
      !state.preferences.onboardingComplete &&
      (state.currentScreen === "welcome" || state.currentScreen === "auth")
    ) {
      state.replace("weekly-plan-opt-in");
    }
  }, [
    auth.status,
    auth.hasHousehold,
    auth.recipeEnabled,
    state.currentScreen,
    state.preferences.onboardingComplete,
    state.replace,
  ]);

  if (auth.status === "loading") {
    return (
      <AppShell>
        <div className="flex flex-1 items-center justify-center p-8">
          <LoadingState label={t("checkingSession")} />
        </div>
      </AppShell>
    );
  }

  if (auth.error && auth.status === "anonymous") {
    return (
      <AppShell>
        <div className="flex flex-1 items-center justify-center p-8">
          <ErrorState
            title={t("cannotReachService")}
            detail={
              auth.error === "UNABLE_TO_REACH"
                ? t("unableToReachService")
                : mapApiErrorMessage(0, auth.error, locale)
            }
            onRetry={() => void auth.refresh()}
            retryLabel={t("retry")}
          />
        </div>
      </AppShell>
    );
  }

  if (auth.status === "authenticated" && !auth.hasHousehold) {
    return (
      <AppShell>
        <HouseholdOnboardingFlow
          onComplete={() => {
            void auth.refresh();
          }}
        />
      </AppShell>
    );
  }

  if (auth.status === "authenticated" && auth.hasHousehold && !auth.recipeEnabled) {
    return (
      <AppShell>
        <RecipeNotEnabledScreen
          onSignOut={() => {
            void auth.logout().then(() => state.replace("welcome"));
          }}
        />
      </AppShell>
    );
  }

  const renderScreen = () => {
    switch (state.currentScreen) {
      case "welcome":
        return <WelcomeScreen onContinue={() => state.navigate("auth")} />;

      case "auth":
        return (
          <AuthScreen
            onAuthenticated={(next) => {
              if (next !== "ready") {
                // App-level gates (onboarding / not-enabled) take over after refresh.
                return;
              }
              if (!state.preferences.onboardingComplete) {
                state.replace("weekly-plan-opt-in");
              } else {
                state.replace("tonight");
              }
            }}
          />
        );

      case "language-location":
      case "food-preferences":
        return (
          <WeeklyPlanOptInScreen
            onYes={() => state.handleWeeklyOptIn(true)}
            onNotNow={() => state.handleWeeklyOptIn(false)}
          />
        );

      case "weekly-plan-opt-in":
        return (
          <WeeklyPlanOptInScreen
            onYes={() => state.handleWeeklyOptIn(true)}
            onNotNow={() => state.handleWeeklyOptIn(false)}
          />
        );

      case "tonight":
        return (
          <TonightScreen
            meal={state.meal}
            onCook={state.startCook}
            onPreview={() => state.navigate("recipe-preview")}
            onNotTonight={() => {}}
            onCookWithWhatIHave={() => state.navigate("cook-with-what-i-have")}
            onOpenWeekPlan={state.openWeeklyPlan}
            showWeekPlanLink={state.preferences.weeklyPlanningEnabled}
          />
        );

      case "recipe-preview":
        return (
          <RecipePreviewScreen
            meal={state.meal}
            onStartCook={state.startCook}
            onBack={state.goBack}
          />
        );

      case "cook-mode":
        return (
          <CookModeScreen
            meal={state.meal}
            stepIndex={state.cookStepIndex}
            onNext={state.nextCookStep}
            onBack={state.prevCookStep}
            onExit={state.goBack}
          />
        );

      case "weekly-plan":
        return (
          <WeeklyPlanScreen
            plan={state.weekPlan}
            onUpdateDay={state.updateWeekDay}
            onSave={state.saveWeekPlan}
            onBack={() => state.replace("tonight")}
          />
        );

      case "feedback":
        return (
          <FeedbackScreen
            meal={state.meal}
            onSubmit={state.submitFeedback}
            onSkip={() => state.replace("tonight")}
          />
        );

      case "cook-with-what-i-have":
        return (
          <CookWithWhatIHaveScreen
            onFindMeal={() => state.replace("tonight")}
            onBack={state.goBack}
          />
        );

      default:
        return null;
    }
  };

  return (
    <AppShell>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {renderScreen()}
      </div>
    </AppShell>
  );
}
