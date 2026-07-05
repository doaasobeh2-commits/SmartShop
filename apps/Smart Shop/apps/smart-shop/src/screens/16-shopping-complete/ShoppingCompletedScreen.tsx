import { useMemo, useState } from "react";
import {
  AppShell,
  Button,
  Header,
  StatusBar,
} from "@smart-shop/shared";
import "@smart-shop/shared/styles/tokens.css";
import type { ScreenNavigationProps } from "../../navigation/screenNavigation";
import { useAppState } from "../../state/AppProvider";

function CheckIcon({ size = 12, className = "" }: { size?: number; className?: string }) {
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

export function ShoppingCompletedScreen({
  onNavigateRoot,
  onBack,
}: ScreenNavigationProps = {}) {
  const { basketLines, planLines, prepareCompletedTrip, completedTripLines } = useAppState();
  const initialIds = useMemo(
    () => new Set(basketLines.map((line) => line.id)),
    [basketLines],
  );
  const [purchasedIds, setPurchasedIds] = useState<Set<string>>(initialIds);
  const [isSaving, setIsSaving] = useState(false);

  const lines =
    completedTripLines.length > 0
      ? completedTripLines
      : basketLines.map((item) => {
          const planLine = planLines.find((line) => line.id === item.planLineId);
          return {
            id: item.id,
            productName: item.itemLabel,
            category: planLine?.category ?? "Einkauf",
            price: item.offerPrice,
            storeName: item.merchantName,
            purchased: purchasedIds.has(item.id),
          };
        });

  const toggleItem = (id: string) => {
    setPurchasedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const purchasedTotal = lines
    .filter((line) => purchasedIds.has(line.id))
    .reduce((sum, line) => sum + line.price, 0);

  const handleConfirm = async () => {
    setIsSaving(true);
    await prepareCompletedTrip(purchasedIds);
    setIsSaving(false);
    onNavigateRoot?.("05-dashboard");
  };

  return (
    <AppShell>
      <div className="flex h-full flex-col overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <StatusBar />
        <Header
          title="Einkauf abgeschlossen"
          subtitle="Was hast du gekauft?"
          onBack={onBack}
        />

        <div className="px-5 pb-3 pt-4">
          <div className="rounded-xl border border-border bg-card p-3">
            <p className="text-xs leading-relaxed text-muted-foreground">
              Bestätige deine Einkäufe. SmartShop merkt sich deinen Einkauf für den nächsten Plan.
            </p>
          </div>
        </div>

        <div className="flex-1 space-y-2 px-5">
          {lines.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <p className="text-sm text-muted-foreground">Keine Artikel im Einkaufskorb.</p>
            </div>
          ) : (
            lines.map((line) => {
              const checked = purchasedIds.has(line.id);
              return (
                <button
                  key={line.id}
                  type="button"
                  onClick={() => toggleItem(line.id)}
                  className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left"
                >
                  <div className={checkboxClass(checked)}>
                    {checked ? <CheckIcon className="text-white" /> : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{line.productName}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {line.storeName} · {line.category}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-foreground">
                    €{line.price.toFixed(2)}
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div className="space-y-2 px-5 pb-5 pt-3">
          <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/10 p-3">
            <span className="text-sm font-bold text-foreground">Gekauft</span>
            <span
              className="text-xl font-black text-primary"
              style={{ fontFamily: "var(--font-display)" }}
            >
              €{purchasedTotal.toFixed(2)}
            </span>
          </div>
          <Button onClick={handleConfirm} disabled={isSaving || lines.length === 0}>
            {isSaving ? "Speichern…" : "Bestätigen"}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
