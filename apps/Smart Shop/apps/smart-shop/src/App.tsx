import { useCallback, useState } from "react";
import type { ComponentType } from "react";
import {
  AdminScreen,
  AiAssistantScreen,
  AnalyticsScreen,
  DashboardScreen,
  FamilyPetsScreen,
  NotificationsScreen,
  OnboardingAiScreen,
  OnboardingFamilyScreen,
  OnboardingSaveScreen,
  PremiumSubscriptionScreen,
  ProfileScreen,
  RegisterScreen,
  ShoppingListScreen,
  WelcomeScreen,
} from "./screens";
import type { ScreenRouteName } from "./screens/routes";
import type { ScreenNavigationProps } from "./navigation/screenNavigation";

const SCREEN_COMPONENTS: Record<
  ScreenRouteName,
  ComponentType<ScreenNavigationProps>
> = {
  "00-welcome": WelcomeScreen,
  "01-onboarding-ai": OnboardingAiScreen,
  "02-onboarding-save": OnboardingSaveScreen,
  "03-onboarding-family": OnboardingFamilyScreen,
  "04-register": RegisterScreen,
  "05-dashboard": DashboardScreen,
  "06-profile": ProfileScreen,
  "07-family-pets": FamilyPetsScreen,
  "08-notifications": NotificationsScreen,
  "09-ai-assistant": AiAssistantScreen,
  "10-analytics": AnalyticsScreen,
  "11-shopping-list": ShoppingListScreen,
  "12-premium-subscription": PremiumSubscriptionScreen,
  "13-admin": AdminScreen,
};

export function App() {
  const [screenStack, setScreenStack] = useState<ScreenRouteName[]>(["00-welcome"]);

  const currentScreen = screenStack[screenStack.length - 1];

  const onNavigate = useCallback((screen: ScreenRouteName) => {
    setScreenStack((stack) => [...stack, screen]);
  }, []);

  const onBack = useCallback(() => {
    setScreenStack((stack) => (stack.length > 1 ? stack.slice(0, -1) : stack));
  }, []);

  const CurrentScreen = SCREEN_COMPONENTS[currentScreen];

  return <CurrentScreen onNavigate={onNavigate} onBack={onBack} />;
}
