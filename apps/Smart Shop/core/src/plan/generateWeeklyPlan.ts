import type { HouseholdSetupSnapshot } from "../models/household/HouseholdSetupSnapshot";
import type { PlanLine, WeeklyHouseholdPlan } from "./WeeklyHouseholdPlan";

const BASE_STAPLES: Omit<PlanLine, "id" | "checked">[] = [
  { name: "Milch (1L)", category: "Milch", price: 1.19 },
  { name: "Brot", category: "Backwaren", price: 2.49 },
  { name: "Äpfel (1kg)", category: "Obst", price: 2.99 },
  { name: "Bananen (6 Stk)", category: "Obst", price: 1.89 },
  { name: "Hähnchenbrust (500g)", category: "Fleisch", price: 5.49 },
  { name: "Spülmittel", category: "Haushalt", price: 2.29 },
];

const CHILD_ITEMS: Omit<PlanLine, "id" | "checked">[] = [
  { name: "Joghurt (6er)", category: "Milch", price: 3.29 },
  { name: "Apfelsaft (1L)", category: "Getränke", price: 1.79 },
];

const PET_ITEMS: Omit<PlanLine, "id" | "checked">[] = [
  { name: "Hundefutter (1kg)", category: "Haustier", price: 4.99 },
];

function weekStartIso(date = new Date()): string {
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString();
}

function createLine(item: Omit<PlanLine, "id" | "checked">, index: number): PlanLine {
  return {
    ...item,
    id: `plan-${index}`,
    checked: false,
  };
}

export function generateWeeklyPlan(
  setup: HouseholdSetupSnapshot,
  householdId: string,
): WeeklyHouseholdPlan {
  const items: Omit<PlanLine, "id" | "checked">[] = [...BASE_STAPLES];

  if (setup.childrenCount > 0) {
    items.push(...CHILD_ITEMS);
  }

  if (setup.hasPets) {
    items.push(...PET_ITEMS);
  }

  if (setup.familySize >= 4) {
    items.push(
      { name: "Reis (1kg)", category: "Grundnahrungsmittel", price: 2.19 },
      { name: "Tomaten (500g)", category: "Gemüse", price: 1.99 },
    );
  }

  const lines = items.map(createLine);

  return {
    id: `plan-${weekStartIso()}`,
    householdId,
    weekStart: weekStartIso(),
    lines,
  };
}
