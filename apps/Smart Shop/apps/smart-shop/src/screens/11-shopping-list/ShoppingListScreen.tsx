import {
  AppShell,
  Button,
  Header,
  StatusBar,
} from "@smart-shop/shared";
import "@smart-shop/shared/styles/tokens.css";
import type { ScreenNavigationProps } from "../../navigation/screenNavigation";
import { SHOPPING_FLOW_TARGETS } from "../../navigation/screenNavigation";
import { useAppState } from "../../state/AppProvider";

type IconProps = {
  size?: number;
  className?: string;
};

function CheckIcon({ size = 12, className = "" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function checkboxClass(checked: boolean) {
  return checked
    ? "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-primary bg-primary"
    : "h-5 w-5 shrink-0 rounded-md border-2 border-border";
}

function itemNameClass(checked: boolean) {
  return checked
    ? "text-sm text-muted-foreground line-through"
    : "text-sm font-medium text-foreground";
}

export function ShoppingListScreen({ onNavigate, onBack }: ScreenNavigationProps = {}) {
  const { planLines, updatePlanLines, startShoppingFromPlan } = useAppState();

  const toggleItem = (index: number) => {
    updatePlanLines(
      planLines.map((item, itemIndex) =>
        itemIndex === index ? { ...item, checked: !item.checked } : item,
      ),
    );
  };

  const total = planLines.reduce((sum, item) => sum + item.price, 0);
  const checkedCount = planLines.filter((item) => item.checked).length;
  const progress = planLines.length > 0 ? (checkedCount / planLines.length) * 100 : 0;

  const handleStartShopping = () => {
    startShoppingFromPlan();
    onNavigate?.(SHOPPING_FLOW_TARGETS.basket);
  };

  return (
    <AppShell>
      <div className="flex h-full flex-col overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <StatusBar />
        <Header title="Wochenplan" subtitle="Was soll ich diese Woche kaufen?" onBack={onBack} />

        <div className="px-5 pb-3 pt-4">
          <div className="rounded-xl border border-border bg-card p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Fortschritt</span>
              <span className="text-xs font-bold text-foreground">
                {checkedCount}/{planLines.length}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary/30">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-2 px-5">
          {planLines.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleItem(index)}
              className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left"
            >
              <div className={checkboxClass(item.checked)}>
                {item.checked ? <CheckIcon className="text-white" /> : null}
              </div>
              <div className="flex-1">
                <p className={itemNameClass(item.checked)}>{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.category}</p>
              </div>
              <span className="text-sm font-bold text-foreground">€{item.price.toFixed(2)}</span>
            </button>
          ))}
        </div>

        <div className="space-y-2 px-5 pb-5 pt-3">
          <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/10 p-3">
            <span className="text-sm font-bold text-foreground">Gesamt</span>
            <span
              className="text-xl font-black text-primary"
              style={{ fontFamily: "var(--font-display)" }}
            >
              €{total.toFixed(2)}
            </span>
          </div>
          <Button onClick={handleStartShopping}>Einkauf starten</Button>
        </div>
      </div>
    </AppShell>
  );
}
