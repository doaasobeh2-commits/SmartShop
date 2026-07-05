import {
  AppShell,
  Header,
  PreviewShell,
  SparklesIcon,
  StatusBar,
} from "@smart-shop/shared";
import "@smart-shop/shared/styles/tokens.css";
import type { ScreenNavigationProps } from "../../navigation/screenNavigation";
import type { CategoryShare, DailyAmount } from "./types";

const WEEKLY_DATA: DailyAmount[] = [
  { day: "Mo", amount: 45 },
  { day: "Di", amount: 38 },
  { day: "Mi", amount: 52 },
  { day: "Do", amount: 41 },
  { day: "Fr", amount: 58 },
  { day: "Sa", amount: 72 },
  { day: "So", amount: 65 },
];

const TOP_CATEGORIES: CategoryShare[] = [
  { name: "Obst & Gemüse", value: 28 },
  { name: "Fleisch & Fisch", value: 22 },
  { name: "Milchprodukte", value: 18 },
];

const CHART_MAX = 72;
const CHART_HEIGHT = 110;

function WeeklyBarChart({ data }: { data: DailyAmount[] }) {
  return (
    <div className="relative h-[150px]">
      <div className="absolute inset-x-0 top-0 flex h-[110px] flex-col justify-between">
        {[0, 1, 2, 3].map((line) => (
          <div
            key={line}
            className="border-t border-dashed border-foreground/10"
            style={{ opacity: line === 0 ? 0 : 1 }}
          />
        ))}
      </div>

      <div className="absolute bottom-6 left-0 right-0 flex items-end justify-between gap-1.5 px-1">
        {data.map((entry) => {
          const barHeight = Math.round((entry.amount / CHART_MAX) * CHART_HEIGHT);
          return (
            <div key={entry.day} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t-md bg-primary"
                style={{ height: `${barHeight}px` }}
                aria-hidden
              />
              <span className="text-[10px] text-muted-foreground">{entry.day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AnalyticsScreen({ onBack }: ScreenNavigationProps = {}) {
  return (
    <PreviewShell screenNumber={11}>
      <AppShell>
        <div className="flex h-full flex-col overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <StatusBar />
          <Header
            title="Analyse"
            onBack={onBack}
            rightSlot={<SparklesIcon size={14} />}
          />

          <div className="flex-1 space-y-4 px-5 pt-4">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-xl border border-border bg-card p-3">
                <p className="mb-1 text-xs text-muted-foreground">Wochenverbrauch</p>
                <p
                  className="text-2xl font-black text-foreground"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  €371
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-3">
                <p className="mb-1 text-xs text-muted-foreground">Ø täglich</p>
                <p
                  className="text-2xl font-black text-foreground"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  €53
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-3.5">
              <h3 className="mb-3 text-xs font-bold text-foreground">Täglicher Verbrauch</h3>
              <WeeklyBarChart data={WEEKLY_DATA} />
            </div>

            <div className="rounded-xl border border-border bg-card p-3.5">
              <h3 className="mb-3 text-xs font-bold text-foreground">Top Kategorien</h3>
              <div className="space-y-2.5">
                {TOP_CATEGORIES.map((category) => (
                  <div key={category.name}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs text-foreground">{category.name}</span>
                      <span className="text-xs font-bold text-foreground">{category.value}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary/30">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${category.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </PreviewShell>
  );
}
