export type PetType = "dog" | "cat" | "bird" | "fish" | "rabbit" | "reptile" | "other";

export type HouseholdPet = {
  type: PetType;
  quantity: number;
};

export const PET_TYPE_OPTIONS: readonly { type: PetType; label: string }[] = [
  { type: "dog", label: "Hund" },
  { type: "cat", label: "Katze" },
  { type: "bird", label: "Vogel" },
  { type: "fish", label: "Fisch" },
  { type: "rabbit", label: "Kaninchen" },
  { type: "reptile", label: "Reptil" },
  { type: "other", label: "Andere" },
] as const;

export const PET_TYPE_LABELS: Record<PetType, string> = Object.fromEntries(
  PET_TYPE_OPTIONS.map((option) => [option.type, option.label]),
) as Record<PetType, string>;

export function formatPetSummary(pets: HouseholdPet[]): string {
  if (pets.length === 0) {
    return "Keine";
  }

  return pets
    .filter((pet) => pet.quantity > 0)
    .map((pet) => `${PET_TYPE_LABELS[pet.type]} (${pet.quantity})`)
    .join(", ");
}

export function normalizePets(pets: HouseholdPet[] | undefined): HouseholdPet[] {
  if (!pets?.length) {
    return [];
  }

  const merged = new Map<PetType, number>();
  for (const pet of pets) {
    if (pet.quantity <= 0) {
      continue;
    }
    merged.set(pet.type, (merged.get(pet.type) ?? 0) + pet.quantity);
  }

  return PET_TYPE_OPTIONS.map((option) => option.type)
    .filter((type) => merged.has(type))
    .map((type) => ({ type, quantity: merged.get(type)! }));
}
