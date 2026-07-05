export type SubscriptionTierId =
  | "free"
  | "premium_monthly"
  | "premium_yearly"
  | "family_premium"
  | "enterprise"
  | "ai_credits";

export type SubscriptionPlan = {
  id: SubscriptionTierId;
  name: string;
  priceLabel: string;
  billingPeriod?: "monthly" | "yearly" | "one_time" | "future";
  description: string;
  isAvailable: boolean;
  isPremium: boolean;
};

export type FamilySubscription = {
  familyId: string;
  tier: SubscriptionTierId;
  aiEnabled: boolean;
  startedAt?: string;
  expiresAt?: string;
};

export const SUBSCRIPTION_PLANS: readonly SubscriptionPlan[] = [
  {
    id: "free",
    name: "Kostenlos",
    priceLabel: "€0",
    description: "Regelbasierte Einkaufslisten, manuelle Angebote und Flyer-OCR.",
    isAvailable: true,
    isPremium: false,
  },
  {
    id: "premium_monthly",
    name: "Premium Monatlich",
    priceLabel: "€9,99 / Monat",
    billingPeriod: "monthly",
    description: "Echte KI-Funktionen, lokale Angebote und Haushaltsintelligenz.",
    isAvailable: true,
    isPremium: true,
  },
  {
    id: "premium_yearly",
    name: "Premium Jährlich",
    priceLabel: "€89,99 / Jahr",
    billingPeriod: "yearly",
    description: "Alle Premium-Funktionen mit Jahresrabatt.",
    isAvailable: true,
    isPremium: true,
  },
  {
    id: "family_premium",
    name: "Familien-Premium",
    priceLabel: "€14,99 / Monat",
    billingPeriod: "monthly",
    description: "Premium für die ganze Familie inklusive Lernen und Berichte.",
    isAvailable: true,
    isPremium: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    priceLabel: "Demnächst",
    billingPeriod: "future",
    description: "Für Unternehmen und Filialketten.",
    isAvailable: false,
    isPremium: true,
  },
  {
    id: "ai_credits",
    name: "KI-Guthaben",
    priceLabel: "Demnächst",
    billingPeriod: "future",
    description: "Zusätzliche KI-Anfragen und erweiterte Analysen.",
    isAvailable: false,
    isPremium: true,
  },
] as const;
