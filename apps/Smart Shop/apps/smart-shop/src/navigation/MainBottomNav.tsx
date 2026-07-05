import { BottomNav } from "@smart-shop/shared";
import {
  BOTTOM_NAV_TARGETS,
  type MainNavId,
  type ScreenNavigationProps,
} from "./screenNavigation";

type IconProps = { size?: number; className?: string };

function HomeIcon({ size = 20, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function ListIcon({ size = 20, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}

function ChartIcon({ size = 20, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <line x1="12" x2="12" y1="20" y2="10" />
      <line x1="18" x2="18" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="16" />
    </svg>
  );
}

function UserIcon({ size = 20, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

const NAV_ITEMS = [
  { id: "home", label: "Home", icon: <HomeIcon /> },
  { id: "plan", label: "Plan", icon: <ListIcon /> },
  { id: "analytics", label: "Analyse", icon: <ChartIcon /> },
  { id: "profile", label: "Profil", icon: <UserIcon /> },
] as const;

type MainBottomNavProps = ScreenNavigationProps & {
  activeId: MainNavId;
};

export function MainBottomNav({ activeId, onNavigate }: MainBottomNavProps) {
  return (
    <BottomNav
      items={[...NAV_ITEMS]}
      activeId={activeId}
      onChange={(id) => {
        const target = BOTTOM_NAV_TARGETS[id as MainNavId];
        if (target) {
          onNavigate?.(target);
        }
      }}
    />
  );
}

export function NotificationBellButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-full w-full items-center justify-center"
      aria-label="Benachrichtigungen"
    >
      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
    </button>
  );
}
