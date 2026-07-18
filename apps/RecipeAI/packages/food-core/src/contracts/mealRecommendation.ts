/** Client-safe Tonight response DTO — no scoring or engine metadata. */
export type InventoryStatusDto = "have" | "need";

export type InventoryItemDto = {
  id: string;
  name: string;
  detail: string;
  status: InventoryStatusDto;
  freshness?: string;
};

export type RecipeStepDto = {
  order: number;
  instruction: string;
  timerMinutes?: number;
};

export type MealRecommendationDto = {
  id: string;
  title: string;
  reason: string;
  prepMinutes: number;
  imageUrl?: string;
  cuisine: string;
  ingredients: InventoryItemDto[];
  steps: RecipeStepDto[];
  tips: string[];
  storageTip: string;
};

export type TonightSuccessResponse = {
  status: "ok";
  recommendation: MealRecommendationDto;
};

export type TonightEmptyResponse = {
  status: "empty";
  code: "NO_SAFE_MEAL" | "NO_MORE_TONIGHT_OPTIONS";
  message: string;
};

export type TonightResponse = TonightSuccessResponse | TonightEmptyResponse;
