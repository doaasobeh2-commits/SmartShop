import { useState } from "react";
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
import { SHOPPING_FLOW_TARGETS } from "../../navigation/screenNavigation";
import type { ShoppingItem } from "./types";

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

const INITIAL_ITEMS: ShoppingItem[] = [
  { name: "Äpfel (1kg)", category: "Obst", price: 2.99, checked: true },
  { name: "Bananen (6 Stk)", category: "Obst", price: 1.89, checked: true },
  { name: "Milch (1L)", category: "Milch", price: 1.19, checked: false },
  { name: "Hähnchenbrust (500g)", category: "Fleisch", price: 5.49, checked: false },
  { name: "Spülmittel", category: "Haushalt", price: 2.29, checked: false },
];

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
  const [items, setItems] = useState<ShoppingItem[]>(INITIAL_ITEMS);

  const toggleItem = (index: number) => {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, checked: !item.checked } : item,
      ),
    );
  };

  const total = items.reduce((sum, item) => sum + item.price, 0);
  const checkedCount = items.filter((item) => item.checked).length;

  return (
    <PreviewShell screenNumber={12}>
      <AppShell>
        <div className="flex h-full flex-col overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <StatusBar />
          <Header
            title="Einkaufsliste"
            onBack={onBack}
            rightSlot={<SparklesIcon size={14} />}
          />

          <div className="px-5 pb-3 pt-4">
            <div className="rounded-xl border border-border bg-card p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Fortschritt</span>
                <span className="text-xs font-bold text-foreground">
                  {checkedCount}/{items.length}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary/30">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${(checkedCount / items.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-2 px-5">
            {items.map((item, index) => (
              <button
                key={item.name}
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
                <span className="text-sm font-bold text-foreground">
                  €{item.price.toFixed(2)}
                </span>
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
            <Button onClick={() => onNavigate?.(SHOPPING_FLOW_TARGETS.basket)}>
              Einkauf starten
            </Button>
          </div>
        </div>
      </AppShell>
    </PreviewShell>
  );
}
