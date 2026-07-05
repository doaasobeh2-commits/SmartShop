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

export function OnboardingAiScreen({ onNavigate }: ScreenNavigationProps = {}) {
  return (
    <PreviewShell screenNumber={2}>
      <AppShell>
        <div className="flex h-full flex-col">
          <StatusBar />
          <ProgressDots activeIndex={0} />

          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <OnboardingIcon emoji="🤖" />

            <h2
              className="mb-4 text-2xl font-black text-foreground"
              style={{ fontFamily: "var(--font-display)" }}
            >
              KI für Sie
            </h2>

            <p className="mb-2 text-sm leading-relaxed text-muted-foreground">
              Unsere KI lernt Ihre Gewohnheiten und erstellt automatisch personalisierte
              Einkaufslisten.
            </p>
          </div>

          <div className="space-y-2 px-5 pb-5 pt-2">
            <Button onClick={() => onNavigate?.("02-onboarding-save")}>Weiter</Button>
            <LoginLink />
          </div>
        </div>
      </AppShell>
    </PreviewShell>
  );
}
