import { Button } from "../../ui/Button";

export type MerchantDetailsSheetProps = {
  open: boolean;
  merchantName: string;
  productName?: string;
  offerPrice?: number;
  normalPrice?: number;
  validUntilLabel?: string;
  address?: string;
  phone?: string;
  openingHours?: string;
  website?: string;
  onClose: () => void;
};

export function MerchantDetailsSheet({
  open,
  merchantName,
  productName,
  offerPrice,
  normalPrice,
  validUntilLabel,
  address,
  phone,
  openingHours,
  website,
  onClose,
}: MerchantDetailsSheetProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0">
      <button
        type="button"
        className="absolute inset-0"
        aria-label="Schließen"
        onClick={onClose}
      />
      <div className="relative z-10 max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-border bg-card p-5 pb-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2
              className="truncate text-lg font-black text-foreground"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {merchantName}
            </h2>
            {productName ? (
              <p className="mt-1 truncate text-sm font-medium text-foreground">{productName}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-xs font-bold text-muted-foreground"
          >
            ✕
          </button>
        </div>

        {offerPrice !== undefined ? (
          <div className="mb-4 flex items-baseline gap-2">
            <span className="text-xl font-black text-primary">€{offerPrice.toFixed(2)}</span>
            {normalPrice && normalPrice > offerPrice ? (
              <span className="text-sm text-muted-foreground line-through">
                €{normalPrice.toFixed(2)}
              </span>
            ) : null}
          </div>
        ) : null}

        {validUntilLabel ? (
          <p className="mb-4 text-xs text-muted-foreground">{validUntilLabel}</p>
        ) : null}

        <div className="space-y-3 border-t border-border pt-4">
          {address ? (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Adresse
              </p>
              <p className="text-sm text-foreground break-words">{address}</p>
            </div>
          ) : null}
          {phone ? (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Telefon
              </p>
              <p className="text-sm text-foreground">{phone}</p>
            </div>
          ) : null}
          {openingHours ? (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Öffnungszeiten
              </p>
              <p className="text-sm text-foreground">{openingHours}</p>
            </div>
          ) : null}
          {website ? (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Website
              </p>
              <p className="truncate text-sm text-primary">{website}</p>
            </div>
          ) : null}
          {!address && !phone && !openingHours && !website ? (
            <p className="text-sm text-muted-foreground">Keine Kontaktdaten hinterlegt.</p>
          ) : null}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            disabled={!address}
            onClick={() => {
              if (address) {
                window.open(
                  `https://maps.google.com/?q=${encodeURIComponent(address)}`,
                  "_blank",
                  "noopener,noreferrer",
                );
              }
            }}
          >
            Navigation
          </Button>
          <Button
            variant="secondary"
            onClick={async () => {
              const shareText = productName
                ? `${merchantName} — ${productName}`
                : merchantName;
              if (navigator.share) {
                try {
                  await navigator.share({ title: merchantName, text: shareText });
                } catch {
                  /* user cancelled */
                }
                return;
              }
              if (navigator.clipboard) {
                await navigator.clipboard.writeText(shareText);
              }
            }}
          >
            Teilen
          </Button>
        </div>
      </div>
    </div>
  );
}
