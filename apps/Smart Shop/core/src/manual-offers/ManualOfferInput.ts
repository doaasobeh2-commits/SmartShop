/**
 * How a free-tier user entered the offer.
 * Photo import prepares images for future OCR text extraction — not Premium AI.
 */
export type ManualOfferInputMethod = "manual_entry" | "photo_import";

export const MANUAL_OFFER_INPUT_METHODS: readonly ManualOfferInputMethod[] = [
  "manual_entry",
  "photo_import",
] as const;
