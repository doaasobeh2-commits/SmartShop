import { AppShell } from "@recipe-ai/shared";
import { useEffect } from "react";
import { useAuth } from "./auth/AuthContext";
import {
  ErrorState,
  LoadingState,
  mapApiErrorMessage,
} from "./components/AsyncStates";
import { DocumentLocale } from "./components/DocumentLocale";
import {
  resolveInitialFlowScreen,
  resolvePostAuthOnboardingScreen,
  useAppState,
} from "./hooks/useAppState";
import { useI18n } from "./i18n/useI18n";
import {
  AuthScreen,
  CookModeScreen,
  CookWithWhatIHaveScreen,
  CuisinePreferencesScreen,
  FeedbackScreen,
  FoodPreferencesScreen,
  HouseholdOnboardingFlow,
  HouseholdMembersScreen,
  LanguageSelectionScreen,
  RecipeNotEnabledScreen,
  RecipePreviewScreen,
  TonightScreen,
  WeeklyPlanIntentScreen,
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
      const allowed: (typeof state.currentScreen)[] = [
        "language-selection",
        "welcome",
        "auth",
      ];
      if (!allowed.includes(state.currentScreen)) {
        state.replace(resolveInitialFlowScreen(state.preferences));
      }
      return;
    }

    if (!auth.hasHousehold || !auth.recipeEnabled) {
      return;
    }

    const postAuth = resolvePostAuthOnboardingScreen(state.preferences);
    const onPreMainGate =
      state.currentScreen === "welcome" || state.currentScreen === "auth";

    if (!state.preferences.onboardingComplete && onPreMainGate) {
      state.replace(postAuth);
      return;
    }

    if (
      !state.preferences.householdMembersComplete &&
      (state.currentScreen === "food-preferences" ||
        state.currentScreen === "cuisine-preferences" ||
        state.currentScreen === "weekly-plan-opt-in")
    ) {
      state.replace("household-members");
      return;
    }

    if (
      !state.preferences.allergiesComplete &&
      (state.currentScreen === "cuisine-preferences" ||
        state.currentScreen === "weekly-plan-opt-in")
    ) {
      state.replace("food-preferences");
      return;
    }

    if (
      state.preferences.allergiesComplete &&
      !state.preferences.cuisinePreferencesComplete &&
      state.currentScreen === "weekly-plan-opt-in"
    ) {
      state.replace("cuisine-preferences");
    }
  }, [
    auth.status,
    auth.hasHousehold,
    auth.recipeEnabled,
    state.currentScreen,
    state.preferences.onboardingComplete,
    state.preferences.householdMembersComplete,
    state.preferences.allergiesComplete,
    state.preferences.cuisinePreferencesComplete,
    state.preferences.languageSelected,
    state.replace,
  ]);

  if (auth.status === "loading") {
    return (
      <AppShell>
        <DocumentLocale />
        <div className="flex flex-1 items-center justify-center p-8">
          <LoadingState label={t("checkingSession")} />
        </div>
      </AppShell>
    );
  }

  if (auth.error && auth.status === "anonymous") {
    return (
      <AppShell>
        <DocumentLocale />
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
        <DocumentLocale />
        <HouseholdOnboardingFlow
          onComplete={() => {
            void auth.refresh();
          }}
        />
      </AppShell>
    );
  }

  if (
    auth.status === "authenticated" &&
    auth.hasHousehold &&
    !auth.recipeEnabled
  ) {
    return (
      <AppShell>
        <DocumentLocale />
        <RecipeNotEnabledScreen
          onSignOut={() => {
            void auth
              .logout()
              .then(() =>
                state.replace(resolveInitialFlowScreen(state.preferences)),
              );
          }}
        />
      </AppShell>
    );
  }

  const renderScreen = () => {
    switch (state.currentScreen) {
      case "language-selection":
        return (
          <LanguageSelectionScreen
            selectedLanguage={state.preferences.language}
            onContinue={state.setLanguage}
          />
        );

      case "welcome":
        return <WelcomeScreen onContinue={() => state.navigate("auth")} />;

      case "auth":
        return (
          <AuthScreen
            onAuthenticated={(next) => {
              if (next !== "ready") {
                return;
              }
              state.enterPostAuthOnboarding();
            }}
          />
        );

      case "household-members":
        return (
          <HouseholdMembersScreen
            onContinue={state.completeHouseholdMembers}
            onSkip={state.completeHouseholdMembers}
          />
        );

      case "food-preferences":
        return (
          <FoodPreferencesScreen
            selected={state.preferences.allergies}
            onToggle={state.toggleAllergy}
            onContinue={state.completeAllergies}
          />
        );

      case "cuisine-preferences":
        return (
          <CuisinePreferencesScreen
            primaryCuisine={state.preferences.primaryCuisine}
            preferredCuisines={state.preferences.preferredCuisines}
            onSelectPrimary={state.setPrimaryCuisine}
            onTogglePreferred={state.togglePreferredCuisine}
            onContinue={state.completeCuisinePreferences}
          />
        );

      case "weekly-plan-opt-in":
        return (
          <WeeklyPlanOptInScreen
            onYes={() => state.handleWeeklyOptIn(true)}
            onNotNow={() => state.handleWeeklyOptIn(false)}
            onBack={state.canGoBack ? state.goBack : undefined}
          />
        );

      case "weekly-plan-intents":
        return (
          <WeeklyPlanIntentScreen
            dayDates={state.intentDayDates}
            weekdayIndexes={state.intentWeekdayIndexes}
            dayIntents={state.draftDayIntents}
            dayCuisineSources={state.draftDayCuisineSources}
            onChangeDayIntent={state.setDraftDayIntent}
            onChangeDayCuisineSource={state.setDraftDayCuisineSource}
            onContinue={state.confirmWeeklyIntents}
            onBack={state.canGoBack ? state.goBack : undefined}
          />
        );

      case "tonight":
        return (
          <TonightScreen
            meal={state.meal}
            candidateMeals={state.tonightCandidateMeals}
            tonightContext={state.tonightContext}
            candidateCount={state.tonightCandidateIds.length}
            safetyBlocked={state.tonightSafetyBlocked}
            fromWeeklyPlan={state.tonightFromWeeklyPlan}
            onOccasionChange={state.setTonightOccasion}
            onIntentChange={state.setTonightIntent}
            onGuestPrimaryCuisineChange={state.setGuestPrimaryCuisine}
            onToggleGuestPreferredCuisine={state.toggleGuestPreferredCuisine}
            onCook={state.startCook}
            onPreview={state.openRecipePreview}
            onSelectCandidate={state.selectTonightCandidate}
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
            onBack={state.backFromRecipePreview}
            pantryActions={
              state.recipePreviewOrigin === "pantry"
                ? {
                    canReplaceToday: state.pantryCanReplaceToday,
                    plannedTitle: state.pantryPlannedTitle,
                    replaceConfirming: state.pantryReplaceConfirming,
                    futureSaved: state.pantryFutureSaved,
                    onRequestReplaceToday: state.requestReplaceTodayPlan,
                    onConfirmReplaceToday: state.confirmReplaceTodayPlan,
                    onCancelReplaceToday: state.cancelReplaceTodayPlan,
                    onSaveForFuturePlan: state.savePantryForFuturePlan,
                  }
                : undefined
            }
          />
        );

      case "cook-mode":
        return (
          <CookModeScreen
            meal={state.meal}
            stepIndex={state.cookStepIndex}
            onNext={state.nextCookStep}
            onBack={state.prevCookStep}
            onExit={state.exitCookMode}
          />
        );

      case "weekly-plan":
        return (
          <WeeklyPlanScreen
            plan={state.weekPlan}
            onSelectRecipe={state.updateWeekDay}
            onRemoveCompanion={state.removeWeekDayCompanion}
            onContinue={state.saveWeekPlan}
            onBack={state.canGoBack ? state.goBack : undefined}
          />
        );

      case "feedback":
        return (
          <FeedbackScreen
            meal={state.meal}
            onSubmit={state.submitFeedback}
            onSkip={state.returnToTonight}
          />
        );

      case "cook-with-what-i-have":
        return (
          <CookWithWhatIHaveScreen
            query={state.pantryQuery}
            onQueryChange={state.setPantryQuery}
            matchIds={state.pantryMatchIds}
            noStrongMatch={state.pantryNoStrongMatch}
            missingById={state.pantryMissingById}
            coverageById={state.pantryCoverageById}
            plannedConflict={state.pantryPlannedConflict}
            onFindMeal={state.findPantryMatches}
            onChooseMatch={state.openPantryMatch}
            onBack={state.exitPantryToTonight}
          />
        );

      default:
        return null;
    }
  };

  return (
    <AppShell>
      <DocumentLocale />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {renderScreen()}
      </div>
    </AppShell>
  );
}
