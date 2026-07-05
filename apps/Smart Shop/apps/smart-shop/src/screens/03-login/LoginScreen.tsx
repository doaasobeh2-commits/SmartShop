import { useState } from "react";
import {
  AppShell,
  Button,
  LoginLink,
  SparklesIcon,
  StatusBar,
} from "@smart-shop/shared";
import "@smart-shop/shared/styles/tokens.css";
import type { ScreenNavigationProps } from "../../navigation/screenNavigation";
import { useAppState } from "../../state/AppProvider";
import { loadSession } from "../../state/localStore";

function MailIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 text-muted-foreground"
      aria-hidden
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function LockIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 text-muted-foreground"
      aria-hidden
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export function LoginScreen({ onNavigate, onBack }: ScreenNavigationProps = {}) {
  const { login } = useAppState();
  const [email, setEmail] = useState("maria@beispiel.de");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    login({
      firstName: "Maria",
      lastName: "Müller",
      email: email.trim() || "maria@beispiel.de",
    });
    const setupDone = loadSession().householdSetupCompleted;
    onNavigate?.(setupDone ? "05-dashboard" : "15-household-wizard");
  };

  return (
    <AppShell>
      <div className="flex h-full flex-col overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <StatusBar />

        <div className="px-5 pb-4 pt-6">
          <button
            type="button"
            onClick={onBack}
            className="mb-4 text-xs font-bold text-primary"
          >
            ← Zurück
          </button>
          <div className="mb-5 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-primary/40 bg-primary/25">
              <SparklesIcon size={13} className="text-primary" />
            </div>
            <span className="text-[10px] font-black tracking-[0.15em] text-muted-foreground">
              SMARTSHOP AI
            </span>
          </div>
          <h2
            className="text-2xl font-black text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Anmelden
          </h2>
        </div>

        <div className="flex-1 space-y-3 px-5">
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              E-Mail
            </label>
            <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-3">
              <MailIcon />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="maria@beispiel.de"
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Passwort
            </label>
            <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-3">
              <LockIcon />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Passwort"
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2 px-5 pb-5 pt-3">
          <Button onClick={handleLogin}>Anmelden</Button>
          <LoginLink onClick={() => onNavigate?.("04-register")}>
            Noch kein Konto? <span className="text-primary">Registrieren</span>
          </LoginLink>
        </div>
      </div>
    </AppShell>
  );
}
