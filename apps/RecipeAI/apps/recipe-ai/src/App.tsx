import { AppShell } from "@recipe-ai/shared";
import { useAppState } from "./hooks/useAppState";
import {
  CookModeScreen,
  CookWithWhatIHaveScreen,
  FeedbackScreen,
  FoodPreferencesScreen,
  RecipePreviewScreen,
  TonightScreen,
  WeeklyPlanOptInScreen,
  WeeklyPlanScreen,
AuthScreen,
WelcomeScreen,
} from "./screens";

export function App() {
  const state = useAppState();

  const renderScreen = () => {
    switch (state.currentScreen) {
    case "welcome":
  return (
    <WelcomeScreen
      onContinue={() => state.navigate("auth")}
    />
  );

case "auth":
  return (
    <AuthScreen
      onContinue={() => state.navigate("language-location")}
    />
  );

      case "food-preferences":
        return (
          <FoodPreferencesScreen
            selected={state.preferences.allergies}
            onToggle={state.toggleAllergy}
            onContinue={state.completeFoodPreferences}
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
            onNotTonight={() => {
              /* swap alternate — engine hook */
            }}
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
            onFindMeal={() => {
              state.replace("tonight");
            }}
            onBack={state.goBack}
          />
        );

      default:
        return null;
    }
  };

  return (
    <AppShell>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{renderScreen()}</div>
    </AppShell>
  );
}
