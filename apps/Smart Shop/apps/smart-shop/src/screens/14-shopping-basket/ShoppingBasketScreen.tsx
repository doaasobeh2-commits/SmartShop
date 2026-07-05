import { useMemo } from "react";
import {
  AppShell,
  Button,
  Header,
  StatusBar,
} from "@smart-shop/shared";
import "@smart-shop/shared/styles/tokens.css";
import {
  SHOPPING_FLOW_TARGETS,
  type ScreenNavigationProps,
} from "../../navigation/screenNavigation";
import { useAppState } from "../../state/AppProvider";

function statusLabel(status: "active" | "expires_soon") {
  return status === "expires_soon" ? "Bald abgelaufen" : "Aktiv";
}

function statusClass(status: "active" | "expires_soon") {
  return status === "expires_soon"
    ? "bg-amber-500/15 text-amber-600"
    : "bg-primary/15 text-primary";
}

export function ShoppingBasketScreen({ onNavigate, onBack }: ScreenNavigationProps = {}) {
  const { basketLines, householdSetup } = useAppState();
  const total = basketLines.reduce((sum, item) => sum + item.offerPrice, 0);

  const groupedLines = useMemo(() => {
    const groups = new Map<string, typeof basketLines>();
    for (const item of basketLines) {
      const existing = groups.get(item.merchantName) ?? [];
      existing.push(item);
      groups.set(item.merchantName, existing);
    }
    return [...groups.entries()];
  }, [basketLines]);

  const isEmpty = basketLines.length === 0;

  return (
    <AppShell>
      <div className="flex h-full flex-col overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <StatusBar />
        <Header
          title="Einkaufskorb"
          subtitle={`${householdSetup.city} · regelbasiert`}
          onBack={onBack}
        />

        <div className="px-5 pb-3 pt-4">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
            <p className="text-xs leading-relaxed text-muted-foreground">
              Dein Einkaufskorb basiert auf deinem Wochenplan und lokalen Angeboten in{" "}
              {householdSetup.city}.
            </p>
          </div>
        </div>

        <div className="flex-1 space-y-4 px-5">
          {isEmpty ? (
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Keine offenen Artikel im Wochenplan. Markiere Produkte als offen oder starte einen
                neuen Plan.
              </p>
            </div>
          ) : (
            groupedLines.map(([merchantName, items]) => (
              <div key={merchantName} className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {merchantName}
                </h3>
                {items.map((item) => (
                  <div key={item.id} className="rounded-xl border border-border bg-card p-3">
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
                <div className="flex justify-end px-1">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Zwischensumme €
                    {items.reduce((sum, item) => sum + item.offerPrice, 0).toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-2 px-5 pb-5 pt-3">
          {!isEmpty ? (
            <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/10 p-3">
              <span className="text-sm font-bold text-foreground">Gesamt</span>
              <span
                className="text-xl font-black text-primary"
                style={{ fontFamily: "var(--font-display)" }}
              >
                €{total.toFixed(2)}
              </span>
            </div>
          ) : null}
          <Button
            onClick={() => onNavigate?.(SHOPPING_FLOW_TARGETS.completed)}
            disabled={isEmpty}
          >
            Einkauf abschließen
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
