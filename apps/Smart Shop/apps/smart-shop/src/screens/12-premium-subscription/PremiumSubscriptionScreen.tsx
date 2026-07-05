import {
  AppShell,
  Button,
  Header,
  SparklesIcon,
} from "@smart-shop/shared";
import { SUBSCRIPTION_PLANS } from "@smart-shop/core";
import "@smart-shop/shared/styles/tokens.css";
import type { ScreenNavigationProps } from "../../navigation/screenNavigation";

type PlanCardProps = {
  name: string;
  priceLabel: string;
  description: string;
  isAvailable: boolean;
  isPremium: boolean;
  isCurrent?: boolean;
};

function PlanCard({
  name,
  priceLabel,
  description,
  isAvailable,
  isPremium,
  isCurrent = false,
}: PlanCardProps) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        isCurrent
          ? "border-primary bg-primary/10"
          : isPremium
            ? "border-primary/30 bg-card"
            : "border-border bg-card"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3
            className="text-sm font-bold text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {name}
          </h3>
          <p className="mt-1 text-lg font-bold text-primary">{priceLabel}</p>
        </div>
        {isCurrent ? (
          <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
            Aktuell
          </span>
        ) : isPremium ? (
          <SparklesIcon size={16} className="shrink-0 text-primary" />
        ) : null}
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{description}</p>
      {!isAvailable ? (
        <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Demnächst verfügbar
        </p>
      ) : null}
    </div>
  );
}

export function PremiumSubscriptionScreen({ onBack }: ScreenNavigationProps = {}) {
  return (
    <AppShell>
        <div className="flex h-full flex-col overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Header
            title="Premium"
            subtitle="Erweiterte Funktionen"
            onBack={onBack}
            rightSlot={<SparklesIcon size={14} />}
          />

          <div className="flex-1 space-y-3 px-5 pt-4">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <p className="text-xs leading-relaxed text-muted-foreground">
                Premium erweitert SmartShop um zusätzliche Analyse, erweiterte Angebote und
                tiefere Haushaltsanpassung. Die Free Edition bleibt vollständig nutzbar.
              </p>
            </div>

            <div className="space-y-2">
              {SUBSCRIPTION_PLANS.map((plan) => (
                <PlanCard
                  key={plan.id}
                  name={plan.name}
                  priceLabel={plan.priceLabel}
                  description={plan.description}
                  isAvailable={plan.isAvailable}
                  isPremium={plan.isPremium}
                  isCurrent={plan.id === "free"}
                />
              ))}
            </div>

            <div className="rounded-xl border border-border bg-card p-3">
              <p className="text-[10px] leading-relaxed text-muted-foreground">
                Keine Zahlungsabwicklung in dieser Version. Pläne dienen nur der
                Vorschau der zukünftigen Premium-Funktionen.
              </p>
            </div>
          </div>

          <div className="space-y-2 px-5 pb-5 pt-3">
            <Button disabled>Premium Monatlich wählen</Button>
            <Button variant="secondary" disabled>
              Premium Jährlich wählen
            </Button>
          </div>
        </div>
      </AppShell>
  );
}
