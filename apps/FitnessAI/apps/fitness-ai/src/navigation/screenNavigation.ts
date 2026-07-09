import type { FlowScreen, MainTab } from "@fitness-ai/core/types";

export type ScreenNavigationProps = {
  onNavigate?: (screen: FlowScreen) => void;
  onCompleteFlow?: () => void;
  onTabChange?: (tab: MainTab) => void;
  onOpenPremium?: () => void;
  onCloseOverlay?: () => void;
};
