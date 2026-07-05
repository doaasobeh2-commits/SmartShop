import type { ReactNode } from "react";
import {
  AppShell,
  Button,
  Header,
  StatusBar,
} from "@smart-shop/shared";
import "@smart-shop/shared/styles/tokens.css";
import type { ScreenNavigationProps } from "../../navigation/screenNavigation";
import { useAppState } from "../../state/AppProvider";

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

function PawPrintIcon({ size = 18, className = "" }: IconProps) {
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

export function ProfileScreen({ onBack, onNavigate }: ScreenNavigationProps = {}) {
  const { session, householdSetup, logout } = useAppState();
  const displayName = session.user
    ? `${session.user.firstName} ${session.user.lastName}`
    : "Maria Müller";
  const email = session.user?.email ?? "maria@beispiel.de";

  return (
    <AppShell>
      <div className="flex h-full flex-col overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <StatusBar />
        <Header title="Profil" subtitle="Wer ist mein Haushalt?" onBack={onBack} />

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
                  {displayName}
                </h3>
                <p className="text-xs text-muted-foreground">{email}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="mb-2 text-xs font-bold text-foreground">Haushalt</h3>
            <ProfileListItem
              icon={<UserIcon className="text-muted-foreground" />}
              title="Familie"
              subtitle={`${householdSetup.familySize} Personen · ${householdSetup.childrenCount} Kinder`}
            />
            <ProfileListItem
              icon={<PawPrintIcon className="text-muted-foreground" />}
              title="Haustiere"
              value={householdSetup.hasPets ? "Ja" : "Nein"}
            />
            <ProfileListItem
              icon={<UserIcon className="text-muted-foreground" />}
              title="Stadt"
              value={householdSetup.city}
            />
            <ProfileListItem
              icon={<UserIcon className="text-muted-foreground" />}
              title="Supermärkte"
              subtitle={householdSetup.favouriteSupermarkets.join(", ")}
            />
            <ProfileListItem
              icon={<UserIcon className="text-muted-foreground" />}
              title="Restaurants"
              subtitle={
                householdSetup.favouriteRestaurants.length > 0
                  ? householdSetup.favouriteRestaurants.join(", ")
                  : "Keine ausgewählt"
              }
            />
            <ProfileListItem
              icon={<DollarSignIcon className="text-muted-foreground" />}
              title="Budget"
              value={
                householdSetup.monthlyBudget
                  ? `€${householdSetup.monthlyBudget}`
                  : "Nicht gesetzt"
              }
            />
          </div>
        </div>

        <div className="space-y-2 px-5 pb-5 pt-3">
          <Button onClick={() => onNavigate?.("15-household-wizard")}>
            Haushalt bearbeiten
          </Button>
          <button
            type="button"
            onClick={() => {
              logout();
              onNavigate?.("00-welcome");
            }}
            className="w-full py-3 text-sm font-bold text-muted-foreground"
          >
            Abmelden
          </button>
        </div>
      </div>
    </AppShell>
  );
}
