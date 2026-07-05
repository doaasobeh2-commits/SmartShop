export type PlanLine = {
  id: string;
  name: string;
  category: string;
  price: number;
  checked: boolean;
};

export type WeeklyHouseholdPlan = {
  id: string;
  householdId: string;
  weekStart: string;
  lines: PlanLine[];
};

export type PurchaseLine = {
  id: string;
  productName: string;
  category: string;
  price: number;
  storeName: string;
  purchased: boolean;
};

export type ShoppingTrip = {
  id: string;
  householdId: string;
  basketId: string;
  storeCount: number;
  totalAmount: number;
  currency: string;
  completedAt: string;
  lines: PurchaseLine[];
};
