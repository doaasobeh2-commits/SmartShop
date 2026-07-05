import type { ReactNode } from "react";
import {
  AppShell,
  BottomNav,
  Header,
  PreviewShell,
  SparklesIcon,
  StatCard,
  StatusBar,
} from "@smart-shop/shared";
import "@smart-shop/shared/styles/tokens.css";
import {
  BOTTOM_NAV_TARGETS,
  type ScreenNavigationProps,
} from "../../navigation/screenNavigation";

type IconProps = {
  size?: number;
  className?: string;
};

function DollarSignIcon({ size = 14, className = "" }: IconProps) {
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

function TrendingUpIcon({ size = 14, className = "" }: IconProps) {
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
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function CalendarIcon({ size = 14, className = "" }: IconProps) {
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
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}

function ShoppingCartIcon({ size = 16, className = "" }: IconProps) {
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
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}

function MessageSquareIcon({ size = 16, className = "" }: IconProps) {
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
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function BarChartIcon({ size = 16, className = "" }: IconProps) {
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
      <line x1="12" x2="12" y1="20" y2="10" />
      <line x1="18" x2="18" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="16" />
    </svg>
  );
}

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

function HomeIcon({ size = 20, className = "" }: IconProps) {
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
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function BellIcon({ size = 20, className = "" }: IconProps) {
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

type QuickAccessItemProps = {
  icon: ReactNode;
  title: string;
  subtitle: string;
  onClick?: () => void;
};

function QuickAccessItem({ icon, title, subtitle, onClick }: QuickAccessItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3.5 transition-all hover:border-primary/40"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/50">
        {icon}
      </div>
      <div className="min-w-0 flex-1 text-left">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <ArrowRightIcon className="shrink-0 text-muted-foreground" />
    </button>
  );
}

const BOTTOM_NAV_ITEMS = [
  { id: "home", label: "Home", icon: <HomeIcon /> },
  { id: "list", label: "Liste", icon: <ShoppingCartIcon size={20} /> },
  { id: "analytics", label: "Analyse", icon: <BarChartIcon size={20} /> },
  { id: "ai", label: "KI", icon: <MessageSquareIcon size={20} /> },
  { id: "notifications", label: "Neues", icon: <BellIcon /> },
] as const;

export function DashboardScreen({ onNavigate }: ScreenNavigationProps = {}) {
  return (
    <PreviewShell screenNumber={6}>
      <AppShell
        footer={
          <BottomNav
            items={[...BOTTOM_NAV_ITEMS]}
            activeId="home"
            onChange={(id) => {
              const target = BOTTOM_NAV_TARGETS[id as keyof typeof BOTTOM_NAV_TARGETS];
              if (target) {
                onNavigate?.(target);
              }
            }}
          />
        }
      >
        <div className="flex h-full flex-col overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <StatusBar />
          <Header title="Dashboard" rightSlot={<SparklesIcon size={14} />} />

          <div className="px-5 pb-3 pt-4">
            <div className="grid grid-cols-3 gap-2.5">
              <StatCard
                label="Budget übrig"
                value="€125"
                icon={<DollarSignIcon />}
                iconClassName="text-accent"
              />
              <StatCard
                label="Gespart"
                value="€108"
                icon={<TrendingUpIcon />}
                iconClassName="text-emerald-400"
              />
              <StatCard
                label="Einkauf"
                value="Sa."
                icon={<CalendarIcon />}
                iconClassName="text-primary"
              />
            </div>
          </div>

          <div className="flex-1 space-y-2.5 px-5">
            <h3 className="mb-1 text-xs font-bold text-foreground">Schnellzugriff</h3>
            <QuickAccessItem
              icon={<ShoppingCartIcon className="text-muted-foreground" />}
              title="Einkaufsliste"
              subtitle="18 Produkte · €87.50"
              onClick={() => onNavigate?.("11-shopping-list")}
            />
            <QuickAccessItem
              icon={<MessageSquareIcon className="text-muted-foreground" />}
              title="KI-Assistent"
              subtitle="Fragen Sie nach Tipps"
              onClick={() => onNavigate?.("09-ai-assistant")}
            />
            <QuickAccessItem
              icon={<BarChartIcon className="text-muted-foreground" />}
              title="Analyse"
              subtitle="Verbrauch ansehen"
              onClick={() => onNavigate?.("10-analytics")}
            />
            <QuickAccessItem
              icon={<UserIcon className="text-muted-foreground" />}
              title="Profil"
              subtitle="Einstellungen verwalten"
              onClick={() => onNavigate?.("06-profile")}
            />
          </div>

          <div className="px-5 pb-5 pt-3">
            <div className="rounded-xl border border-accent/25 bg-accent/10 p-3.5">
              <div className="flex items-start gap-2.5">
                <SparklesIcon size={14} className="mt-0.5 text-accent" />
                <div>
                  <p className="mb-1 text-xs font-bold text-foreground">KI-Tipp</p>
                  <p className="text-[10px] text-muted-foreground">
                    Wechseln Sie zu Aldi und sparen Sie €22/Monat
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </PreviewShell>
  );
}
