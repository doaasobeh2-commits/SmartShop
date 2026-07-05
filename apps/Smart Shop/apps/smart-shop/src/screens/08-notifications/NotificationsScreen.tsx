import { useState } from "react";
import {
  AppShell,
  Header,
  MerchantDetailsSheet,
} from "@smart-shop/shared";
import "@smart-shop/shared/styles/tokens.css";
import type { ScreenNavigationProps } from "../../navigation/screenNavigation";
import { useDecisionLayer } from "../../hooks/useDecisionLayer";

function ClockIcon({ size = 9, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function notificationCardClass(unread: boolean) {
  return unread
    ? "rounded-xl border border-primary/30 bg-card p-3.5"
    : "rounded-xl border border-border bg-card/50 p-3.5";
}

export function NotificationsScreen({ onNavigate, onBack }: ScreenNavigationProps = {}) {
  const { notifications, openDetails } = useDecisionLayer();
  const [detailsOfferId, setDetailsOfferId] = useState<string | null>(null);
  const details = detailsOfferId ? openDetails(detailsOfferId) : null;

  const handleNotificationClick = (target: string, offerId?: string) => {
    if (target === "plan") {
      onNavigate?.("11-shopping-list");
      return;
    }
    if (target === "analytics") {
      onNavigate?.("10-analytics");
      return;
    }
    if (target === "details" && offerId) {
      setDetailsOfferId(offerId);
    }
  };

  return (
    <AppShell>
      <div className="flex h-full flex-col overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Header title="Benachrichtigungen" subtitle="Was braucht Aufmerksamkeit?" onBack={onBack} />

        <div className="flex-1 space-y-2 px-5 pt-4">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">Alles erledigt für heute.</p>
          ) : (
            notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() =>
                  handleNotificationClick(notification.target, notification.offerId)
                }
                className={`w-full text-left ${notificationCardClass(notification.unread)}`}
              >
                <div className="mb-1 flex items-start justify-between gap-2">
                  <h4 className="min-w-0 flex-1 truncate text-sm font-bold text-foreground">
                    {notification.title}
                  </h4>
                  {notification.unread ? (
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" />
                  ) : null}
                </div>
                <p className="mb-2 line-clamp-2 text-xs text-muted-foreground">
                  {notification.description}
                </p>
                <div className="flex items-center gap-1.5">
                  <ClockIcon className="text-muted-foreground/60" />
                  <span className="text-[10px] text-muted-foreground/60">
                    {notification.timeLabel}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <MerchantDetailsSheet
        open={details !== null}
        merchantName={details?.merchantName ?? ""}
        productName={details?.productName}
        offerPrice={details?.offerPrice}
        normalPrice={details?.normalPrice}
        validUntilLabel={details?.validUntilLabel}
        address={details?.address}
        phone={details?.phone}
        openingHours={details?.openingHours}
        website={details?.website}
        onClose={() => setDetailsOfferId(null)}
      />
    </AppShell>
  );
}
