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

export function OnboardingFamilyScreen({ onNavigate }: ScreenNavigationProps = {}) {
  return (
    <PreviewShell screenNumber={4}>
      <AppShell>
        <div className="flex h-full flex-col">
          <StatusBar />
          <ProgressDots activeIndex={2} />

          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <OnboardingIcon emoji="👨‍👩‍👧" />

            <h2
              className="mb-4 text-2xl font-black text-foreground"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Für Ihre Familie
            </h2>

            <p className="mb-2 text-sm leading-relaxed text-muted-foreground">
              Planen Sie für die ganze Familie – inklusive Haustiere, Allergien und
              Ernährungspräferenzen.
            </p>
          </div>

          <div className="space-y-2 px-5 pb-5 pt-2">
            <Button onClick={() => onNavigate?.("04-register")}>Konto erstellen</Button>
            <LoginLink />
          </div>
        </div>
      </AppShell>
    </PreviewShell>
  );
}
