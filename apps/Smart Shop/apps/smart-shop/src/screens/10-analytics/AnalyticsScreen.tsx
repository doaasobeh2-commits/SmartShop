import {
  AppShell,
  Header,
  StatCard,
} from "@smart-shop/shared";
import "@smart-shop/shared/styles/tokens.css";
import type { ScreenNavigationProps } from "../../navigation/screenNavigation";
import { MainBottomNav } from "../../navigation/MainBottomNav";
import { useDecisionLayer } from "../../hooks/useDecisionLayer";

function DollarSignIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function TrendingUpIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function StoreIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="m2 7 4.5-4.5 4 4 5-5L22 7" />
      <path d="M4 7v13h16V7" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}

function TagIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
      <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
    </svg>
  );
}

export function AnalyticsScreen({ onNavigate, onBack }: ScreenNavigationProps = {}) {
  const { analytics } = useDecisionLayer();

  return (
    <AppShell footer={<MainBottomNav activeId="analytics" onNavigate={onNavigate} />}>
      <div className="screen-scroll">
        <Header title="Analyse" subtitle="Wie spare ich Geld?" onBack={onBack} />

        <div className="grid grid-cols-2 gap-2.5 px-5 pb-5 pt-4">
          <StatCard
            label="Monatsausgaben"
            value={`€${analytics.monthlySpending.toFixed(0)}`}
            icon={<DollarSignIcon />}
            iconClassName="text-primary"
          />
          <StatCard
            label="Ersparnis"
            value={`€${analytics.savings.toFixed(0)}`}
            icon={<TrendingUpIcon />}
            iconClassName="text-emerald-400"
          />
          <StatCard
            label="Lieblingssupermarkt"
            value={analytics.favouriteSupermarket}
            icon={<StoreIcon />}
            iconClassName="text-accent"
          />
          <StatCard
            label="Top-Kategorie"
            value={analytics.topCategory}
            icon={<TagIcon />}
            iconClassName="text-muted-foreground"
          />
        </div>
      </div>
    </AppShell>
  );
}
