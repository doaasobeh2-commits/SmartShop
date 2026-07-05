import { useState } from "react";
import {
  AppShell,
  Button,
  LoginLink,
  PreviewShell,
  SparklesIcon,
  StatusBar,
} from "@smart-shop/shared";
import "@smart-shop/shared/styles/tokens.css";
import type { ScreenNavigationProps } from "../../navigation/screenNavigation";

const FAMILY_SIZE_OPTIONS = [1, 2, 3, 4, 5, 6, 7] as const;

function UserIcon({ size = 13 }: { size?: number }) {
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
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

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

function EyeIcon({ size = 14 }: { size?: number }) {
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
      className="text-muted-foreground"
      aria-hidden
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ size = 14 }: { size?: number }) {
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
      className="text-muted-foreground"
      aria-hidden
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

function UsersIcon({ size = 12 }: { size?: number }) {
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
      className="text-muted-foreground"
      aria-hidden
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function PawPrintIcon({
  size = 15,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
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
      className={className}
      aria-hidden
    >
      <circle cx="11" cy="4" r="2" />
      <circle cx="18" cy="8" r="2" />
      <circle cx="20" cy="16" r="2" />
      <path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z" />
    </svg>
  );
}

function familySizeButtonClass(isActive: boolean) {
  return isActive
    ? "flex-1 h-9 rounded-xl border border-primary bg-primary text-xs font-bold text-white shadow-md shadow-primary-30 transition-all"
    : "flex-1 h-9 rounded-xl border border-border bg-card text-xs font-bold text-muted-foreground transition-all";
}

export function RegisterScreen({ onNavigate }: ScreenNavigationProps = {}) {
  const [showPassword, setShowPassword] = useState(false);
  const [familySize, setFamilySize] = useState(3);
  const [hasPets, setHasPets] = useState(false);

  return (
    <PreviewShell screenNumber={5}>
      <AppShell>
        <div className="flex h-full flex-col overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <StatusBar />

          <div className="px-5 pb-4 pt-6">
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
              Konto erstellen
            </h2>
          </div>

          <div className="flex-1 space-y-3 px-5">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Vorname
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-3">
                  <UserIcon />
                  <input
                    type="text"
                    placeholder="Maria"
                    className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Nachname
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-3">
                  <input
                    type="text"
                    placeholder="Müller"
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                E-Mail
              </label>
              <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-3">
                <MailIcon />
                <input
                  type="email"
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
                  type={showPassword ? "text" : "password"}
                  placeholder="Mindestens 8 Zeichen"
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <UsersIcon />
                <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Familiengröße
                </label>
              </div>
              <div className="flex gap-1.5">
                {FAMILY_SIZE_OPTIONS.slice(0, 6).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setFamilySize(size)}
                    className={familySizeButtonClass(familySize === size)}
                  >
                    {size}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setFamilySize(7)}
                  className={familySizeButtonClass(familySize === 7)}
                >
                  7+
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setHasPets((value) => !value)}
              className="flex w-full items-center justify-between rounded-xl border border-border bg-card p-3.5"
            >
              <div className="flex items-center gap-3">
                <div
                  className={
                    hasPets
                      ? "flex h-9 w-9 items-center justify-center rounded-xl border border-accent/30 bg-accent/15 transition-all"
                      : "flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-secondary/40 transition-all"
                  }
                >
                  <PawPrintIcon
                    className={hasPets ? "text-accent" : "text-muted-foreground"}
                  />
                </div>
                <p className="text-left text-sm font-semibold text-foreground">
                  Haustiere vorhanden
                </p>
              </div>
              <div
                className={
                  hasPets
                    ? "h-6 w-11 rounded-full bg-primary transition-colors duration-200"
                    : "h-6 w-11 rounded-full bg-muted transition-colors duration-200"
                }
              >
                <span
                  className={
                    hasPets
                      ? "mt-0.5 block h-5 w-5 translate-x-[22px] rounded-full bg-white shadow-sm transition-transform duration-200"
                      : "mt-0.5 block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform duration-200"
                  }
                />
              </div>
            </button>
          </div>

          <div className="space-y-2 px-5 pb-5 pt-3">
            <Button onClick={() => onNavigate?.("05-dashboard")}>Konto erstellen</Button>
            <LoginLink />
          </div>
        </div>
      </AppShell>
    </PreviewShell>
  );
}
