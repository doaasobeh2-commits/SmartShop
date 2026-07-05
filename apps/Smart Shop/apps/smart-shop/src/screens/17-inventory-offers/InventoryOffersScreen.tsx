import { useMemo, useRef, useState } from "react";
import {
  AppShell,
  Button,
  Header,
  StatusBar,
} from "@smart-shop/shared";
import {
  STARTER_INVENTORY_CATALOG,
  STARTER_INVENTORY_UNITS,
  type StarterInventoryEntry,
} from "@smart-shop/core";
import "@smart-shop/shared/styles/tokens.css";
import type { ScreenNavigationProps } from "../../navigation/screenNavigation";
import { useAppState } from "../../state/AppProvider";
import {
  createCustomInventoryItem,
  loadStarterInventory,
} from "../../services/userInventoryStore";
import { persistStarterInventory } from "../../services/inventorySyncService";
import {
  createCapturedOffer,
  saveOfferImage,
  saveUserCapturedOffer,
} from "../../services/userOfferStore";
import {
  RESTAURANT_OPTIONS,
  SUPERMARKET_OPTIONS,
  chipClass,
} from "../../constants/householdOptions";

const INVENTORY_GROUPS = [
  { title: "Grundnahrungsmittel", category: "Grundnahrungsmittel" },
  { title: "Haustier", category: "Haustier" },
  { title: "Haushalt & Hygiene", category: "Haushalt" },
  { title: "Körperpflege", category: "Körperpflege" },
] as const;

function defaultValidUntil(): string {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().slice(0, 10);
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
      {children}
    </h3>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-border bg-card px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none";

type InventoryRowProps = {
  entry: StarterInventoryEntry;
  onChange: (next: StarterInventoryEntry) => void;
};

function InventoryRow({ entry, onChange }: InventoryRowProps) {
  const adjustQuantity = (delta: number) => {
    const nextQuantity = Math.max(0, entry.quantity + delta);
    onChange({
      ...entry,
      quantity: nextQuantity,
      isEmpty: nextQuantity <= 0 ? true : entry.isEmpty && nextQuantity > 0 ? false : entry.isEmpty,
    });
  };

  const toggleEmpty = () => {
    onChange({
      ...entry,
      isEmpty: !entry.isEmpty,
      quantity: !entry.isEmpty ? 0 : Math.max(1, entry.quantity),
    });
  };

  return (
    <div
      className={`rounded-xl border p-3 ${
        entry.isEmpty ? "border-amber-500/30 bg-amber-500/5" : "border-border bg-card"
      }`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">{entry.name}</p>
        <button
          type="button"
          onClick={toggleEmpty}
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
            entry.isEmpty
              ? "bg-amber-500/20 text-amber-700"
              : "bg-secondary/50 text-muted-foreground"
          }`}
        >
          {entry.isEmpty ? "Leer" : "Als leer"}
        </button>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => adjustQuantity(-1)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary/30 text-sm font-bold"
          aria-label={`${entry.name} verringern`}
        >
          −
        </button>
        <span className="min-w-[1.5rem] text-center text-sm font-bold text-foreground">
          {entry.quantity}
        </span>
        <button
          type="button"
          onClick={() => adjustQuantity(1)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary/30 text-sm font-bold"
          aria-label={`${entry.name} erhöhen`}
        >
          +
        </button>
        <select
          value={entry.unit}
          onChange={(event) => onChange({ ...entry, unit: event.target.value })}
          className="ml-1 flex-1 rounded-lg border border-border bg-secondary/20 px-2 py-1.5 text-xs font-semibold text-foreground"
        >
          {STARTER_INVENTORY_UNITS.map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function InventoryOffersScreen({ onBack }: ScreenNavigationProps = {}) {
  const { bumpDecisionVersion } = useAppState();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState<StarterInventoryEntry[]>(() => loadStarterInventory());
  const [inventorySaved, setInventorySaved] = useState(false);

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoImageId, setPhotoImageId] = useState<string | null>(null);

  const [merchantType, setMerchantType] = useState<"store" | "restaurant">("store");
  const [merchantName, setMerchantName] = useState("");
  const [productName, setProductName] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [normalPrice, setNormalPrice] = useState("");
  const [validUntil, setValidUntil] = useState(defaultValidUntil());
  const [offerSaved, setOfferSaved] = useState(false);
  const [offerError, setOfferError] = useState<string | null>(null);

  const [customName, setCustomName] = useState("");

  const groupedItems = useMemo(() => {
    return INVENTORY_GROUPS.map((group) => ({
      ...group,
      entries: items.filter((entry) => entry.category === group.category),
    }));
  }, [items]);

  const merchantSuggestions =
    merchantType === "store" ? SUPERMARKET_OPTIONS : RESTAURANT_OPTIONS;

  const updateItem = (id: string, next: StarterInventoryEntry) => {
    setItems((current) => current.map((entry) => (entry.id === id ? next : entry)));
    setInventorySaved(false);
  };

  const saveInventory = () => {
    persistStarterInventory(items);
    bumpDecisionVersion();
    setInventorySaved(true);
    window.setTimeout(() => setInventorySaved(false), 2000);
  };

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : null;
      if (!dataUrl) {
        return;
      }
      const imageId = `img-${Date.now()}`;
      saveOfferImage(imageId, dataUrl);
      setPhotoPreview(dataUrl);
      setPhotoImageId(imageId);
      setOfferSaved(false);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const saveOffer = () => {
    setOfferError(null);

    if (!merchantName.trim()) {
      setOfferError("Bitte Händler oder Restaurant angeben.");
      return;
    }
    if (!productName.trim() && !photoImageId) {
      setOfferError("Bitte Angebots-Titel angeben oder ein Foto hinzufügen.");
      return;
    }
    if (!offerPrice.trim()) {
      setOfferError("Bitte Angebotspreis angeben.");
      return;
    }
    if (!validUntil) {
      setOfferError("Bitte Gültigkeit angeben.");
      return;
    }

    const price = Number(offerPrice);
    if (Number.isNaN(price) || price <= 0) {
      setOfferError("Bitte gültigen Angebotspreis angeben.");
      return;
    }

    const record = createCapturedOffer({
      merchantName: merchantName.trim(),
      merchantType,
      productName: productName.trim() || "Foto-Angebot",
      offerPrice: price,
      normalPrice: normalPrice ? Number(normalPrice) : undefined,
      validUntil,
      category: merchantType === "restaurant" ? "Restaurant" : "Angebot",
      imageId: photoImageId ?? undefined,
    });

    saveUserCapturedOffer(record);
    bumpDecisionVersion();

    setMerchantName("");
    setProductName("");
    setOfferPrice("");
    setNormalPrice("");
    setValidUntil(defaultValidUntil());
    setPhotoPreview(null);
    setPhotoImageId(null);
    setOfferSaved(true);
    window.setTimeout(() => setOfferSaved(false), 2500);
  };

  const addCustomItem = () => {
    const name = customName.trim();
    if (!name) {
      return;
    }
    const catalogMatch = STARTER_INVENTORY_CATALOG.find(
      (item) => item.name.toLowerCase() === name.toLowerCase(),
    );
    if (catalogMatch || items.some((entry) => entry.name.toLowerCase() === name.toLowerCase())) {
      return;
    }
    setItems((current) => [...current, createCustomInventoryItem(name, "Grundnahrungsmittel")]);
    setCustomName("");
    setInventorySaved(false);
  };

  return (
    <AppShell>
      <div className="flex h-full flex-col overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <StatusBar />
        <Header
          title="Vorräte & Angebote"
          subtitle="Basis-Vorräte und lokale Angebote"
          onBack={onBack}
        />

        <div className="flex-1 space-y-5 px-5 pt-4 pb-5">
          <section className="space-y-3">
            <SectionTitle>Basis-Vorräte</SectionTitle>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Nur die wichtigsten Artikel — der Rest wächst automatisch durch abgeschlossene
              Einkäufe.
            </p>

            {groupedItems.map((group) =>
              group.entries.length > 0 ? (
                <div key={group.category} className="space-y-2">
                  <p className="text-[10px] font-semibold text-primary">{group.title}</p>
                  {group.entries.map((entry) => (
                    <InventoryRow
                      key={entry.id}
                      entry={entry}
                      onChange={(next) => updateItem(entry.id, next)}
                    />
                  ))}
                </div>
              ) : null,
            )}

            <div className="rounded-xl border border-border bg-card p-3">
              <FieldLabel>Eigenen Artikel hinzufügen</FieldLabel>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customName}
                  onChange={(event) => setCustomName(event.target.value)}
                  placeholder="z. B. Butter"
                  className={inputClass}
                />
                <Button variant="secondary" onClick={addCustomItem}>
                  +
                </Button>
              </div>
            </div>

            {inventorySaved ? (
              <p className="text-center text-xs font-semibold text-primary">Vorräte gespeichert</p>
            ) : null}
            <Button onClick={saveInventory}>Vorräte speichern</Button>
          </section>

          <section className="space-y-3 border-t border-border pt-4">
            <SectionTitle>Angebot erfassen</SectionTitle>

            <div className="rounded-xl border border-border bg-card p-3">
              <FieldLabel>Angebotsfoto</FieldLabel>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handlePhotoSelect}
              />
              {photoPreview ? (
                <div className="space-y-2">
                  <img
                    src={photoPreview}
                    alt="Angebotsfoto"
                    className="max-h-40 w-full rounded-xl border border-border object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoPreview(null);
                      setPhotoImageId(null);
                    }}
                    className="text-xs font-bold text-muted-foreground"
                  >
                    Foto entfernen
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-primary/30 bg-primary/5 px-4 py-6"
                >
                  <span className="text-sm font-semibold text-primary">Foto aufnehmen oder hochladen</span>
                  <span className="text-[10px] text-muted-foreground">
                    Lokal gespeichert · ohne KI oder OCR
                  </span>
                </button>
              )}
            </div>

            <div className="rounded-xl border border-border bg-card p-3 space-y-3">
              <div>
                <FieldLabel>Art</FieldLabel>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMerchantType("store")}
                    className={chipClass(merchantType === "store")}
                  >
                    Supermarkt
                  </button>
                  <button
                    type="button"
                    onClick={() => setMerchantType("restaurant")}
                    className={chipClass(merchantType === "restaurant")}
                  >
                    Restaurant
                  </button>
                </div>
              </div>

              <div>
                <FieldLabel>{merchantType === "store" ? "Geschäft" : "Restaurant"}</FieldLabel>
                <input
                  type="text"
                  value={merchantName}
                  onChange={(event) => setMerchantName(event.target.value)}
                  placeholder={merchantType === "store" ? "Billa" : "Kebap Haus"}
                  className={inputClass}
                  list="merchant-suggestions"
                />
                <datalist id="merchant-suggestions">
                  {merchantSuggestions.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </div>

              <div>
                <FieldLabel>Produkt / Angebot</FieldLabel>
                <input
                  type="text"
                  value={productName}
                  onChange={(event) => setProductName(event.target.value)}
                  placeholder="Milch 1L"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <FieldLabel>Angebotspreis (€)</FieldLabel>
                  <input
                    type="number"
                    value={offerPrice}
                    onChange={(event) => setOfferPrice(event.target.value)}
                    placeholder="1.09"
                    className={inputClass}
                  />
                </div>
                <div>
                  <FieldLabel>Alter Preis (€)</FieldLabel>
                  <input
                    type="number"
                    value={normalPrice}
                    onChange={(event) => setNormalPrice(event.target.value)}
                    placeholder="Optional"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <FieldLabel>Gültig bis</FieldLabel>
                <input
                  type="date"
                  value={validUntil}
                  onChange={(event) => setValidUntil(event.target.value)}
                  className={inputClass}
                />
              </div>

              {offerError ? (
                <p className="text-xs font-semibold text-amber-600">{offerError}</p>
              ) : null}
              {offerSaved ? (
                <p className="text-xs font-semibold text-primary">
                  Angebot gespeichert — erscheint auf dem Dashboard
                </p>
              ) : null}

              <Button onClick={saveOffer}>Angebot speichern</Button>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
