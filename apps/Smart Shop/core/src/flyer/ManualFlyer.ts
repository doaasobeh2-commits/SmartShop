import type {
  ManualOfferInputMethod,
  ManualOfferSourceType,
} from "../manual-offers";

/**
 * Photo import container for future OCR text extraction.
 * OCR is free-tier text extraction only — not Premium AI.
 */
export type ManualFlyerImport = {
  id: string;
  familyId: string;
  sourceType: ManualOfferSourceType;
  inputMethod: Extract<ManualOfferInputMethod, "photo_import">;
  storeName: string;
  imageRef: string;
  importedAt: string;
};

/**
 * Text fields extracted from a flyer image.
 * Deterministic parsing only — no LLM inference.
 */
export type OcrExtractedProduct = {
  productName: string;
  brand?: string;
  normalPrice?: number;
  offerPrice?: number;
  currency?: string;
  validUntil?: string;
  confidence: number;
};

export type OcrExtractionResult = {
  flyerId: string;
  products: OcrExtractedProduct[];
  extractedAt: string;
  overallConfidence: number;
  /** OCR is text extraction, not Premium AI. */
  isPremiumAi: false;
};

export type FlyerOcrEngine = {
  extractFromImage(flyer: ManualFlyerImport): Promise<OcrExtractionResult>;
};
