import type { ShoppingFrequency } from "@smart-shop/core";

export const SUPERMARKET_OPTIONS = ["Billa", "Merkur", "Hofer", "Lidl", "Spar"] as const;
export const RESTAURANT_OPTIONS = ["Kebap Haus", "Pizzeria Roma", "Sushi Bar", "Café Central"] as const;
export const FAMILY_SIZE_OPTIONS = [1, 2, 3, 4, 5, 6, 7] as const;

export const SHOPPING_FREQUENCY_OPTIONS: ReadonlyArray<{
  value: ShoppingFrequency;
  label: string;
}> = [
  { value: "weekly", label: "Wöchentlich" },
  { value: "biweekly", label: "Alle 2 Wochen" },
  { value: "monthly", label: "Monatlich" },
];

export const SHOPPING_PREFERENCE_OPTIONS = [
  "Bio",
  "Regional",
  "Günstig",
  "Vegetarisch",
  "Vegan",
] as const;

export function chipClass(active: boolean) {
  return active
    ? "rounded-xl border border-primary bg-primary px-3 py-2 text-xs font-bold text-white"
    : "rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold text-muted-foreground";
}

export function sizeButtonClass(isActive: boolean) {
  return isActive
    ? "flex-1 h-9 rounded-xl border border-primary bg-primary text-xs font-bold text-white shadow-md shadow-primary-30 transition-all"
    : "flex-1 h-9 rounded-xl border border-border bg-card text-xs font-bold text-muted-foreground transition-all";
}

export function shoppingFrequencyLabel(frequency: ShoppingFrequency): string {
  return SHOPPING_FREQUENCY_OPTIONS.find((option) => option.value === frequency)?.label ?? "Wöchentlich";
}

export function planStoreHint(index: number, stores: string[]): string {
  const list = stores.length > 0 ? stores : ["Billa"];
  return list[index % list.length];
}
