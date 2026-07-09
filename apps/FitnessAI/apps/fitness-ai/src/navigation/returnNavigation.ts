import type { MainTab } from "@fitness-ai/core/types";

export type ReturnNavigation = {
  fromTab: MainTab;
  onReturn: () => void;
};
