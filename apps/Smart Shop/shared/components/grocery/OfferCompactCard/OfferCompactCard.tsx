import { Button } from "../../ui/Button";

export type OfferCompactCardProps = {
  merchantName: string;
  productName: string;
  offerPrice: number;
  normalPrice?: number;
  validUntilLabel: string;
  onDetails?: () => void;
};

export function OfferCompactCard({
  merchantName,
  productName,
  offerPrice,
  normalPrice,
  validUntilLabel,
  onDetails,
}: OfferCompactCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-primary">{merchantName}</span>
      </div>
      <p className="text-sm font-medium text-foreground">{productName}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-sm font-bold text-foreground">€{offerPrice.toFixed(2)}</span>
        {normalPrice && normalPrice > offerPrice ? (
          <span className="text-xs text-muted-foreground line-through">
            €{normalPrice.toFixed(2)}
          </span>
        ) : null}
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">{validUntilLabel}</p>
      {onDetails ? (
        <div className="mt-2.5">
          <Button variant="secondary" onClick={onDetails}>
            Details
          </Button>
        </div>
      ) : null}
    </div>
  );
}
