import type { HouseholdSetupSnapshot } from "../models/household/HouseholdSetupSnapshot";
import type { PetType } from "../models/household/HouseholdPet";
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

const PET_PRODUCTS: Record<PetType, Omit<PlanLine, "id" | "checked">> = {
  dog: { name: "Hundefutter (1kg)", category: "Haustier", price: 4.99 },
  cat: { name: "Katzenfutter (1kg)", category: "Haustier", price: 3.99 },
  bird: { name: "Vogelfutter (500g)", category: "Haustier", price: 2.49 },
  fish: { name: "Fischfutter (100g)", category: "Haustier", price: 1.99 },
  rabbit: { name: "Kaninchenfutter (1kg)", category: "Haustier", price: 3.49 },
  reptile: { name: "Reptilienfutter", category: "Haustier", price: 5.99 },
  other: { name: "Haustierbedarf", category: "Haustier", price: 2.99 },
};

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

  if (setup.hasPets && setup.pets.length > 0) {
    for (const pet of setup.pets) {
      const product = PET_PRODUCTS[pet.type];
      for (let index = 0; index < pet.quantity; index += 1) {
        items.push({
          ...product,
          name:
            pet.quantity > 1
              ? `${product.name} (${index + 1}/${pet.quantity})`
              : product.name,
        });
      }
    }
  } else if (setup.hasPets) {
    items.push(PET_PRODUCTS.dog);
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
