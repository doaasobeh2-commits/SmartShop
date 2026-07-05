import {
  AppShell,
  Button,
  LoginLink,
  OnboardingIcon,
  PreviewShell,
  ProgressDots,
  StatusBar,
} from "@smart-shop/shared";
import "@smart-shop/shared/styles/tokens.css";
import type { ScreenNavigationProps } from "../../navigation/screenNavigation";

export function OnboardingSaveScreen({ onNavigate }: ScreenNavigationProps = {}) {
  return (
    <PreviewShell screenNumber={3}>
      <AppShell>
        <div className="flex h-full flex-col">
          <StatusBar />
          <ProgressDots activeIndex={1} />

          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <OnboardingIcon emoji="💡" />

            <h2
              className="mb-4 text-2xl font-black text-foreground"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Clever sparen
            </h2>

            <p className="mb-2 text-sm leading-relaxed text-muted-foreground">
              Vergleichen Sie Preise in Echtzeit und erhalten Sie Spartipps passend zu Ihrem
              Budget.
            </p>
          </div>

          <div className="space-y-2 px-5 pb-5 pt-2">
            <Button onClick={() => onNavigate?.("03-onboarding-family")}>Weiter</Button>
            <LoginLink />
          </div>
        </div>
      </AppShell>
    </PreviewShell>
  );
}
