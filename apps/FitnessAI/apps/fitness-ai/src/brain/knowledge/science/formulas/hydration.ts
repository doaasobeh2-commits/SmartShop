/** Hydration planning — ml/kg heuristic with minimum floor. */

export const ML_PER_KG = 35;
export const MIN_WATER_LITERS = 2;

export function dailyWaterLiters(weightKg: number): number {
  return Math.max(Math.round(weightKg * (ML_PER_KG / 1000) * 10) / 10, MIN_WATER_LITERS);
}
