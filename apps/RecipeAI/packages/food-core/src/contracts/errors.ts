export type FoodApiErrorCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_IMPLEMENTED"
  | "NO_SAFE_MEAL"
  | "NO_MORE_TONIGHT_OPTIONS"
  | "VALIDATION_ERROR"
  | "INTERNAL_ERROR";

export type FoodApiErrorBody = {
  error: FoodApiErrorCode;
  message: string;
};
