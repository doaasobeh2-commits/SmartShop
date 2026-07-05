import type { ManualOfferStatus } from "../manual-offers/ManualOfferStatus";
import type { RestaurantProfile } from "../models/merchant/RestaurantProfile";
import type { StoreProfile } from "../models/merchant/StoreProfile";
import type { OfferSourceBundle, RawRestaurantOffer, RawStoreOffer } from "./OfferEngine";

export type UserCapturedOfferRecord = {
  id: string;
  merchantName: string;
  merchantType: "store" | "restaurant";
  productName: string;
  offerPrice: number;
  normalPrice?: number;
  validUntil: string;
  category?: string;
  imageId?: string;
  createdAt: string;
};

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function isoNow(): string {
  return new Date().toISOString();
}

function findStoreId(profiles: StoreProfile[], merchantName: string): string | undefined {
  const key = merchantName.toLowerCase();
  return profiles.find((profile) => profile.name.toLowerCase() === key)?.storeId;
}

function findRestaurantId(
  profiles: RestaurantProfile[],
  merchantName: string,
): string | undefined {
  const key = merchantName.toLowerCase();
  return profiles.find((profile) => profile.name.toLowerCase() === key)?.restaurantId;
}

function createStoreProfile(merchantName: string, city: string): StoreProfile {
  const now = isoNow();
  return {
    storeId: `user-store-${slug(merchantName)}`,
    familyId: "local",
    name: merchantName,
    type: "supermarket",
    country: "AT",
    city,
    district: "Lokal",
    pickupSupported: true,
    deliverySupported: false,
    createdAt: now,
    updatedAt: now,
  };
}

function createRestaurantProfile(merchantName: string, city: string): RestaurantProfile {
  const now = isoNow();
  return {
    restaurantId: `user-restaurant-${slug(merchantName)}`,
    familyId: "local",
    name: merchantName,
    cuisineType: "other",
    country: "AT",
    city,
    district: "Lokal",
    phone: "",
    pickupSupported: true,
    deliverySupported: false,
    createdAt: now,
    updatedAt: now,
  };
}

function toStoreOffer(
  record: UserCapturedOfferRecord,
  storeId: string,
): RawStoreOffer {
  const now = isoNow();
  const endDate = new Date(record.validUntil);
  endDate.setHours(23, 59, 59, 999);

  return {
    id: record.id,
    familyId: "local",
    storeId,
    inputMethod: record.imageId ? "photo_import" : "manual_entry",
    sourceType: record.imageId ? "store_poster" : "supermarket_flyer",
    productName: record.productName,
    category: record.category ?? "Angebot",
    normalPrice: record.normalPrice,
    offerPrice: record.offerPrice,
    currency: "EUR",
    offerStartDate: record.createdAt,
    offerEndDate: endDate.toISOString(),
    availability: { isAvailable: true },
    confidence: "manual",
    status: "active" as ManualOfferStatus,
    photoRef: record.imageId,
    merchantName: record.merchantName,
    createdAt: record.createdAt,
    updatedAt: now,
  };
}

function toRestaurantOffer(
  record: UserCapturedOfferRecord,
  restaurantId: string,
): RawRestaurantOffer {
  const now = isoNow();
  const endDate = new Date(record.validUntil);
  endDate.setHours(23, 59, 59, 999);

  return {
    offerKind: "restaurant",
    id: record.id,
    familyId: "local",
    restaurantId,
    inputMethod: record.imageId ? "photo_import" : "manual_entry",
    sourceType: record.imageId ? "flyer" : "street_board",
    offerTitle: record.productName,
    mealName: record.productName,
    normalPrice: record.normalPrice,
    offerPrice: record.offerPrice,
    currency: "EUR",
    offerEndDate: endDate.toISOString(),
    confidence: "manual",
    status: "active",
    merchantName: record.merchantName,
    createdAt: record.createdAt,
    updatedAt: now,
  };
}

/** Merge locally captured offers into the pilot offer source bundle. */
export function mergeUserCapturedOffers(
  sources: OfferSourceBundle,
  records: UserCapturedOfferRecord[],
  city: string,
): OfferSourceBundle {
  if (records.length === 0) {
    return sources;
  }

  const now = Date.now();
  const activeRecords = records.filter((record) => new Date(record.validUntil).getTime() >= now);

  const storeProfiles = [...sources.storeProfiles];
  const restaurantProfiles = [...sources.restaurantProfiles];
  const storeOffers = [...sources.storeOffers];
  const restaurantOffers = [...sources.restaurantOffers];

  for (const record of activeRecords) {
    if (record.merchantType === "restaurant") {
      let restaurantId = findRestaurantId(restaurantProfiles, record.merchantName);
      if (!restaurantId) {
        const profile = createRestaurantProfile(record.merchantName, city);
        restaurantId = profile.restaurantId;
        restaurantProfiles.push(profile);
      }
      restaurantOffers.push(toRestaurantOffer(record, restaurantId));
      continue;
    }

    let storeId = findStoreId(storeProfiles, record.merchantName);
    if (!storeId) {
      const profile = createStoreProfile(record.merchantName, city);
      storeId = profile.storeId;
      storeProfiles.push(profile);
    }
    storeOffers.push(toStoreOffer(record, storeId));
  }

  return {
    storeProfiles,
    restaurantProfiles,
    storeOffers,
    restaurantOffers,
  };
}
