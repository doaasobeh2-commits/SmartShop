import type { MealFeedbackRatingDto } from "./feedback";

/** Future POST /v1/meals/{recipeId}/cook-start — A2.4 */
export type CookStartRequest = {
  recipeId: string;
  source: "tonight" | "preview";
};

/** Future POST /v1/meals/{recipeId}/feedback — A2.6 */
export type MealFeedbackRequest = {
  recipeId: string;
  rating: MealFeedbackRatingDto;
};

/** Future POST /v1/tonight/swap — A2.4 */
export type TonightSwapRequest = {
  rejectedRecipeId: string;
};
