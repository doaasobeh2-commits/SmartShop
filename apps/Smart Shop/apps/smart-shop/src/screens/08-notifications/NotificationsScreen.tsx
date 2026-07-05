import {
  AppShell,
  Header,
  StatusBar,
} from "@smart-shop/shared";
import "@smart-shop/shared/styles/tokens.css";
import type { ScreenNavigationProps } from "../../navigation/screenNavigation";
import type { AppNotification } from "./types";

type IconProps = {
  size?: number;
  className?: string;
};

function ClockIcon({ size = 9, className = "" }: IconProps) {
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
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

const NOTIFICATIONS: AppNotification[] = [
  {
    title: "Neue Spar-Möglichkeit",
    desc: "Wechseln Sie zu Aldi und sparen Sie €22/Monat",
    time: "vor 5 Min",
    unread: true,
  },
  {
    title: "Einkaufsliste bereit",
    desc: "18 Produkte wurden generiert",
    time: "vor 1 Std",
    unread: true,
  },
  {
    title: "Budget-Ziel erreicht",
    desc: "Sie haben €25 gespart",
    time: "vor 3 Std",
    unread: false,
  },
];

function notificationCardClass(unread: boolean) {
  return unread
    ? "rounded-xl border border-primary/30 bg-card p-3.5"
    : "rounded-xl border border-border bg-card/50 p-3.5";
}

export function NotificationsScreen({ onBack }: ScreenNavigationProps = {}) {
  return (
    <AppShell>
        <div className="flex h-full flex-col overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <StatusBar />
          <Header title="Benachrichtigungen" onBack={onBack} />

          <div className="flex-1 space-y-2 px-5 pt-4">
            {NOTIFICATIONS.map((notification) => (
              <div
                key={notification.title}
                className={notificationCardClass(notification.unread)}
              >
                <div className="mb-1 flex items-start justify-between gap-2">
                  <h4 className="text-sm font-bold text-foreground">{notification.title}</h4>
                  {notification.unread ? (
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" />
                  ) : null}
                </div>
                <p className="mb-2 text-xs text-muted-foreground">{notification.desc}</p>
                <div className="flex items-center gap-1.5">
                  <ClockIcon className="text-muted-foreground/60" />
                  <span className="text-[10px] text-muted-foreground/60">
                    {notification.time}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="px-5 pb-5 pt-3">
            <button
              type="button"
              className="w-full rounded-xl border border-border bg-secondary/50 py-2.5 text-xs font-bold text-foreground"
            >
              Alle als gelesen markieren
            </button>
          </div>
        </div>
      </AppShell>
  );
}
