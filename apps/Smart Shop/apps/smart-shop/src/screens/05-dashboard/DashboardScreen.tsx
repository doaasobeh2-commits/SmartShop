import { useState } from "react";
import {
  AppShell,
  DecisionCard,
  Header,
  MerchantDetailsSheet,
  OfferCompactCard,
  StatusBar,
} from "@smart-shop/shared";
import type { DashboardCard } from "@smart-shop/core";
import "@smart-shop/shared/styles/tokens.css";
import type { ScreenNavigationProps } from "../../navigation/screenNavigation";
import { MainBottomNav, NotificationBellButton } from "../../navigation/MainBottomNav";
import { useDecisionLayer } from "../../hooks/useDecisionLayer";
import { getOfferViews } from "../../services/offerService";

function renderCard(
  card: DashboardCard,
  offers: ReturnType<typeof getOfferViews>,
  onNavigate: ScreenNavigationProps["onNavigate"],
  onOpenDetails: (offerId: string) => void,
) {
  if (card.type === "best_offer" || card.type === "restaurant_offer") {
    const offer = offers.find((item) => item.id === card.offerId);
    if (!offer) {
      return null;
    }
    return (
      <OfferCompactCard
        key={card.id}
        merchantName={offer.merchantName}
        productName={offer.productName}
        offerPrice={offer.offerPrice}
        normalPrice={offer.normalPrice}
        validUntilLabel={offer.validUntilLabel}
        onDetails={() => onOpenDetails(offer.id)}
      />
    );
  }

  return (
    <DecisionCard
      key={card.id}
      title={card.title}
      lines={card.lines}
      primaryValue={card.primaryValue}
      actionLabel={card.actionLabel || undefined}
      onAction={
        card.action === "plan"
          ? () => onNavigate?.("11-shopping-list")
          : undefined
      }
    />
  );
}

export function DashboardScreen({ onNavigate }: ScreenNavigationProps = {}) {
  const { dashboardCards, openDetails } = useDecisionLayer();
  const offers = getOfferViews();
  const [detailsOfferId, setDetailsOfferId] = useState<string | null>(null);
  const details = detailsOfferId ? openDetails(detailsOfferId) : null;

  return (
    <AppShell footer={<MainBottomNav activeId="home" onNavigate={onNavigate} />}>
      <div className="flex h-full flex-col overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <StatusBar />
        <Header
          title="Dashboard"
          subtitle="Was ist heute wichtig?"
          rightSlot={
            <NotificationBellButton onClick={() => onNavigate?.("08-notifications")} />
          }
        />

        <div className="flex-1 space-y-2.5 px-5 pb-5 pt-4">
          {dashboardCards.map((card) =>
            renderCard(card, offers, onNavigate, setDetailsOfferId),
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
