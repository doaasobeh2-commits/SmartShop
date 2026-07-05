import {
  AppShell,
  Button,
  FeatureRow,
  LoginLink,
  SparklesIcon,
} from "@smart-shop/shared";
import { gradients, shadows } from "@smart-shop/shared/tokens";
import "@smart-shop/shared/styles/tokens.css";
import type { ScreenNavigationProps } from "../../navigation/screenNavigation";

const FEATURES = [
  { emoji: "🛒", label: "Wöchentliche Einkaufspläne" },
  { emoji: "💰", label: "Budget- & Spar-Übersicht" },
  { emoji: "🐾", label: "Haustier- & Familienverwaltung" },
] as const;

export function WelcomeScreen({ onNavigate }: ScreenNavigationProps = {}) {
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

          <p className="mb-1 text-sm text-muted-foreground">Intelligente Einkaufsplanung</p>

          <div className="mt-10 w-full space-y-3 text-left">
            {FEATURES.map((item) => (
              <FeatureRow key={item.label} emoji={item.emoji} label={item.label} />
            ))}
          </div>
        </div>

        <div className="space-y-2 px-5 pb-5 pt-2">
          <Button onClick={() => onNavigate?.("04-register")}>Konto erstellen</Button>
          <LoginLink onClick={() => onNavigate?.("03-login")} />
        </div>
      </div>
    </AppShell>
  );
}
