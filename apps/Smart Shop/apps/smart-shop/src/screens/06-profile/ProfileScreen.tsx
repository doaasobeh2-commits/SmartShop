import type { ReactNode } from "react";
import {
  AppShell,
  Button,
  Header,
  PreviewShell,
  SparklesIcon,
  StatusBar,
} from "@smart-shop/shared";
import "@smart-shop/shared/styles/tokens.css";
import type { ScreenNavigationProps } from "../../navigation/screenNavigation";

type IconProps = {
  size?: number;
  className?: string;
};

function UserIcon({ size = 16, className = "" }: IconProps) {
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
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function BellIcon({ size = 16, className = "" }: IconProps) {
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
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function DollarSignIcon({ size = 16, className = "" }: IconProps) {
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
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function SettingsIcon({ size = 16, className = "" }: IconProps) {
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
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ArrowRightIcon({ size = 14, className = "" }: IconProps) {
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
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

type ProfileListItemProps = {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  value?: string;
};

function ProfileListItem({ icon, title, subtitle, value }: ProfileListItemProps) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3.5 transition-all hover:border-primary/40"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/50">
        {icon}
      </div>
      <div className="min-w-0 flex-1 text-left">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {subtitle ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {value ? (
        <span className="shrink-0 text-sm font-bold text-primary">{value}</span>
      ) : null}
      <ArrowRightIcon className="shrink-0 text-muted-foreground" />
    </button>
  );
}

export function ProfileScreen({ onBack }: ScreenNavigationProps = {}) {
  return (
    <PreviewShell screenNumber={7}>
      <AppShell>
        <div className="flex h-full flex-col overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <StatusBar />
          <Header
            title="Profil"
            onBack={onBack}
            rightSlot={<SparklesIcon size={14} />}
          />

          <div className="flex-1 space-y-3 px-5 pt-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/30 bg-primary/15">
                  <UserIcon size={24} className="text-primary" />
                </div>
                <div>
                  <h3
                    className="text-base font-bold text-foreground"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Maria Müller
                  </h3>
                  <p className="text-xs text-muted-foreground">maria@beispiel.de</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="mb-2 text-xs font-bold text-foreground">Einstellungen</h3>
              <ProfileListItem
                icon={<UserIcon className="text-muted-foreground" />}
                title="Persönliche Daten"
                subtitle="Name, E-Mail, Passwort"
              />
              <ProfileListItem
                icon={<BellIcon className="text-muted-foreground" />}
                title="Benachrichtigungen"
                subtitle="Push & E-Mail"
              />
              <ProfileListItem
                icon={<DollarSignIcon className="text-muted-foreground" />}
                title="Budget anpassen"
                value="€380"
              />
              <ProfileListItem
                icon={<SettingsIcon className="text-muted-foreground" />}
                title="App-Einstellungen"
                subtitle="Sprache, Theme"
              />
            </div>
          </div>

          <div className="px-5 pb-5 pt-3">
            <Button>Profil bearbeiten</Button>
          </div>
        </div>
      </AppShell>
    </PreviewShell>
  );
}
