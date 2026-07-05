import {
  AppShell,
  Button,
  Header,
  PreviewShell,
  SparklesIcon,
  StatusBar,
} from "@smart-shop/shared";
import "@smart-shop/shared/styles/tokens.css";
import {
  BOTTOM_NAV_TARGETS,
  type ScreenNavigationProps,
} from "../../navigation/screenNavigation";
import { DEMO_BASKET_ITEMS } from "./types";

function statusLabel(status: "active" | "expires_soon") {
  return status === "expires_soon" ? "Bald abgelaufen" : "Aktiv";
}

function statusClass(status: "active" | "expires_soon") {
  return status === "expires_soon"
    ? "bg-amber-500/15 text-amber-600"
    : "bg-primary/15 text-primary";
}

export function ShoppingBasketScreen({ onNavigate, onBack }: ScreenNavigationProps = {}) {
  const total = DEMO_BASKET_ITEMS.reduce((sum, item) => sum + item.offerPrice, 0);

  return (
    <PreviewShell screenNumber={13}>
      <AppShell>
        <div className="flex h-full flex-col overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <StatusBar />
          <Header
            title="Einkaufskorb"
            subtitle="Regelbasiert · lokal"
            onBack={onBack}
            rightSlot={<SparklesIcon size={14} />}
          />

          <div className="px-5 pb-3 pt-4">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
              <p className="text-xs leading-relaxed text-muted-foreground">
                Dein Einkaufskorb basiert auf deiner Liste und lokalen Angeboten in
                St. Pölten.
              </p>
            </div>
          </div>

          <div className="flex-1 space-y-2 px-5">
            {DEMO_BASKET_ITEMS.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-border bg-card p-3"
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-primary">{item.merchantName}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusClass(item.status)}`}
                  >
                    {statusLabel(item.status)}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.itemLabel}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{item.validityLabel}</p>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-foreground">
                    €{item.offerPrice.toFixed(2)}
                  </span>
                </div>
              </div>
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
            <Button onClick={() => onNavigate?.(BOTTOM_NAV_TARGETS.home)}>
              Einkauf abschließen
            </Button>
          </div>
        </div>
      </AppShell>
    </PreviewShell>
  );
}
