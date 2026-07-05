import { useCallback, useState } from "react";
import type { ComponentType } from "react";
import {
  AdminScreen,
  AnalyticsScreen,
  DashboardScreen,
  HouseholdWizardScreen,
  LoginScreen,
  NotificationsScreen,
  PremiumSubscriptionScreen,
  ProfileScreen,
  RegisterScreen,
  ShoppingCompletedScreen,
  ShoppingListScreen,
  ShoppingBasketScreen,
  SplashScreen,
  WelcomeScreen,
} from "./screens";
import type { ScreenRouteName } from "./screens/routes";
import type { ScreenNavigationProps } from "./navigation/screenNavigation";

const SCREEN_COMPONENTS: Record<
  ScreenRouteName,
  ComponentType<ScreenNavigationProps>
> = {
  "00-splash": SplashScreen,
  "00-welcome": WelcomeScreen,
  "03-login": LoginScreen,
  "04-register": RegisterScreen,
  "05-dashboard": DashboardScreen,
  "06-profile": ProfileScreen,
  "07-family-pets": ProfileScreen,
  "08-notifications": NotificationsScreen,
  "09-ai-assistant": DashboardScreen,
  "10-analytics": AnalyticsScreen,
  "11-shopping-list": ShoppingListScreen,
  "12-premium-subscription": PremiumSubscriptionScreen,
  "13-admin": AdminScreen,
  "14-shopping-basket": ShoppingBasketScreen,
  "15-household-wizard": HouseholdWizardScreen,
  "16-shopping-complete": ShoppingCompletedScreen,
};

export function App() {
  const [screenStack, setScreenStack] = useState<ScreenRouteName[]>(["00-splash"]);

  const currentScreen = screenStack[screenStack.length - 1];

  const onNavigate = useCallback((screen: ScreenRouteName) => {
    setScreenStack((stack) => [...stack, screen]);
  }, []);

  const onNavigateRoot = useCallback((screen: ScreenRouteName) => {
    setScreenStack([screen]);
  }, []);

  const onBack = useCallback(() => {
    setScreenStack((stack) => (stack.length > 1 ? stack.slice(0, -1) : stack));
  }, []);

  const CurrentScreen = SCREEN_COMPONENTS[currentScreen];

  return <CurrentScreen onNavigate={onNavigate} onNavigateRoot={onNavigateRoot} onBack={onBack} />;
}
