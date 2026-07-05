import { useEffect } from "react";
import { AppShell, SparklesIcon } from "@smart-shop/shared";
import { gradients, shadows } from "@smart-shop/shared/tokens";
import "@smart-shop/shared/styles/tokens.css";
import type { ScreenNavigationProps } from "../../navigation/screenNavigation";
import { useAppState } from "../../state/AppProvider";

export function SplashScreen({ onNavigate }: ScreenNavigationProps = {}) {
  const { resolveEntryScreen } = useAppState();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      onNavigate?.(resolveEntryScreen());
    }, 1400);
    return () => window.clearTimeout(timer);
  }, [onNavigate, resolveEntryScreen]);

  return (
    <AppShell>
      <div className="flex h-full flex-col">
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <div
            className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl"
            style={{
              background: gradients.brand,
              boxShadow: shadows.welcomeHero,
            }}
          >
            <SparklesIcon size={36} />
          </div>
          <h1
            className="mb-2 text-3xl font-black leading-tight tracking-tight text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            SMARTSHOP AI
          </h1>
          <p className="text-sm text-muted-foreground">Intelligente Einkaufsplanung</p>
        </div>
      </div>
    </AppShell>
  );
}
