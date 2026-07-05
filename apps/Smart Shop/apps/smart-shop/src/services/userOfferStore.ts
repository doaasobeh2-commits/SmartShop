import type { UserCapturedOfferRecord } from "@smart-shop/core";

const OFFERS_KEY = "smartshop.userOffers";
const IMAGES_KEY = "smartshop.offerImages";

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadUserCapturedOffers(): UserCapturedOfferRecord[] {
  return readJson<UserCapturedOfferRecord[]>(OFFERS_KEY, []);
}

export function saveUserCapturedOffer(record: UserCapturedOfferRecord): void {
  const offers = loadUserCapturedOffers();
  writeJson(OFFERS_KEY, [...offers, record]);
}

export function saveOfferImage(imageId: string, dataUrl: string): void {
  const images = readJson<Record<string, string>>(IMAGES_KEY, {});
  images[imageId] = dataUrl;
  writeJson(IMAGES_KEY, images);
}

export function loadOfferImage(imageId: string): string | null {
  const images = readJson<Record<string, string>>(IMAGES_KEY, {});
  return images[imageId] ?? null;
}

export function createCapturedOffer(input: {
  merchantName: string;
  merchantType: "store" | "restaurant";
  productName: string;
  offerPrice: number;
  normalPrice?: number;
  validUntil: string;
  category?: string;
  imageId?: string;
}): UserCapturedOfferRecord {
  return {
    id: `user-offer-${Date.now()}`,
    merchantName: input.merchantName.trim(),
    merchantType: input.merchantType,
    productName: input.productName.trim(),
    offerPrice: input.offerPrice,
    normalPrice: input.normalPrice,
    validUntil: input.validUntil,
    category: input.category,
    imageId: input.imageId,
    createdAt: new Date().toISOString(),
  };
}
