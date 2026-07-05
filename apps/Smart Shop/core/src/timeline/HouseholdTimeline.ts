export type HouseholdTimelineEventType =
  | "purchase"
  | "manual_offer_added"
  | "flyer_imported"
  | "meal_cooked"
  | "inventory_adjustment"
  | "manual_inventory_correction"
  | "guest_visit"
  | "vacation"
  | "product_expired"
  | "waste"
  | "budget_exceeded"
  | "store_visited"
  | "offer_accepted"
  | "offer_ignored"
  | "shopping_completed";

export type HouseholdTimelineEventBase = {
  id: string;
  familyId: string;
  type: HouseholdTimelineEventType;
  occurredAt: string;
  source: "user" | "system" | "ocr" | "import" | "premium_ai";
};

export type PurchaseEvent = HouseholdTimelineEventBase & {
  type: "purchase";
  storeId: string;
  totalAmount: number;
  currency: string;
  itemCount: number;
};

export type ManualOfferAddedEvent = HouseholdTimelineEventBase & {
  type: "manual_offer_added";
  offerId: string;
  storeName: string;
  productName: string;
};

export type FlyerImportedEvent = HouseholdTimelineEventBase & {
  type: "flyer_imported";
  flyerId: string;
  storeName: string;
  productCount: number;
  ocrConfidence?: number;
};

export type MealCookedEvent = HouseholdTimelineEventBase & {
  type: "meal_cooked";
  recipeId?: string;
  mealName: string;
  ingredientCount: number;
};

export type InventoryAdjustmentEvent = HouseholdTimelineEventBase & {
  type: "inventory_adjustment";
  inventoryItemId: string;
  quantityDelta: number;
};

export type ManualInventoryCorrectionEvent = HouseholdTimelineEventBase & {
  type: "manual_inventory_correction";
  inventoryItemId: string;
  previousQuantity: number;
  correctedQuantity: number;
};

export type GuestVisitEvent = HouseholdTimelineEventBase & {
  type: "guest_visit";
  guestCount: number;
  note?: string;
};

export type VacationEvent = HouseholdTimelineEventBase & {
  type: "vacation";
  awayFrom: string;
  awayUntil: string;
};

export type ProductExpiredEvent = HouseholdTimelineEventBase & {
  type: "product_expired";
  inventoryItemId: string;
  productName: string;
};

export type WasteEvent = HouseholdTimelineEventBase & {
  type: "waste";
  inventoryItemId: string;
  wastedQuantity: number;
  reason?: string;
};

export type BudgetExceededEvent = HouseholdTimelineEventBase & {
  type: "budget_exceeded";
  budgetLimit: number;
  spentAmount: number;
  currency: string;
};

export type StoreVisitedEvent = HouseholdTimelineEventBase & {
  type: "store_visited";
  storeId: string;
  storeName: string;
};

export type OfferAcceptedEvent = HouseholdTimelineEventBase & {
  type: "offer_accepted";
  offerId: string;
  productName: string;
  savingsAmount?: number;
};

export type OfferIgnoredEvent = HouseholdTimelineEventBase & {
  type: "offer_ignored";
  offerId: string;
  productName: string;
  reason?: string;
};

export type ShoppingCompletedEvent = HouseholdTimelineEventBase & {
  type: "shopping_completed";
  basketId: string;
  storeCount: number;
  totalAmount: number;
  currency: string;
};

export type HouseholdTimelineEvent =
  | PurchaseEvent
  | ManualOfferAddedEvent
  | FlyerImportedEvent
  | MealCookedEvent
  | InventoryAdjustmentEvent
  | ManualInventoryCorrectionEvent
  | GuestVisitEvent
  | VacationEvent
  | ProductExpiredEvent
  | WasteEvent
  | BudgetExceededEvent
  | StoreVisitedEvent
  | OfferAcceptedEvent
  | OfferIgnoredEvent
  | ShoppingCompletedEvent;

export type HouseholdTimeline = {
  familyId: string;
  events: HouseholdTimelineEvent[];
  lastEventAt?: string;
};

export type HouseholdTimelineWriter = {
  append(event: HouseholdTimelineEvent): Promise<void>;
};

export type HouseholdTimelineReader = {
  list(familyId: string, from?: string, to?: string): Promise<HouseholdTimelineEvent[]>;
};
