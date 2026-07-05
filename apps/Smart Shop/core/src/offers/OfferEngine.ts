import type { HouseholdSetupSnapshot } from "../models/household/HouseholdSetupSnapshot";
import type { RestaurantProfile } from "../models/merchant/RestaurantProfile";
import type { StoreProfile } from "../models/merchant/StoreProfile";
import type { ManualLocalOffer } from "../manual-offers/ManualLocalOffer";
import type { ManualRestaurantOffer } from "../manual-offers/ManualRestaurantOffer";
import type { ManualOfferStatus } from "../manual-offers/ManualOfferStatus";
import {
  formatValidUntil,
  type MerchantDetailsView,
  type OfferView,
} from "./OfferView";

export type RawStoreOffer = ManualLocalOffer & { merchantName: string };
export type RawRestaurantOffer = ManualRestaurantOffer & { merchantName: string };

export type OfferSourceBundle = {
  storeOffers: RawStoreOffer[];
  restaurantOffers: RawRestaurantOffer[];
  storeProfiles: StoreProfile[];
  restaurantProfiles: RestaurantProfile[];
};

const ACTIVE_STATUSES: ManualOfferStatus[] = ["active", "upcoming"];

function isActiveOffer(endDate: string, status: ManualOfferStatus): boolean {
  if (!ACTIVE_STATUSES.includes(status)) {
    return false;
  }
  return new Date(endDate).getTime() >= Date.now();
}

function toStoreOfferView(offer: RawStoreOffer): OfferView {
  return {
    id: offer.id,
    merchantType: "store",
    merchantId: offer.storeId,
    merchantName: offer.merchantName,
    productName: offer.productName,
    offerPrice: offer.offerPrice,
    normalPrice: offer.normalPrice,
    currency: offer.currency,
    validUntilLabel: `bis ${formatValidUntil(offer.offerEndDate)}`,
    validUntilIso: offer.offerEndDate,
  };
}

function toRestaurantOfferView(offer: RawRestaurantOffer): OfferView {
  const endDate = offer.offerEndDate ?? new Date(Date.now() + 86400000).toISOString();
  return {
    id: offer.id,
    merchantType: "restaurant",
    merchantId: offer.restaurantId,
    merchantName: offer.merchantName,
    productName: offer.mealName || offer.offerTitle,
    offerPrice: offer.offerPrice,
    normalPrice: offer.normalPrice,
    currency: offer.currency,
    validUntilLabel: offer.offerEndDate
      ? `bis ${formatValidUntil(offer.offerEndDate)}`
      : "heute",
    validUntilIso: endDate,
  };
}

export function buildOfferViews(
  sources: OfferSourceBundle,
  setup: HouseholdSetupSnapshot,
): OfferView[] {
  const city = setup.city.toLowerCase();
  const favouriteStores = new Set(
    setup.favouriteSupermarkets.map((name) => name.toLowerCase()),
  );
  const favouriteRestaurants = new Set(
    setup.favouriteRestaurants.map((name) => name.toLowerCase()),
  );

  const storeProfileIds = new Set(
    sources.storeProfiles
      .filter((profile) => profile.city.toLowerCase() === city)
      .map((profile) => profile.storeId),
  );

  const storeOffers = sources.storeOffers
    .filter(
      (offer) =>
        storeProfileIds.has(offer.storeId) &&
        isActiveOffer(offer.offerEndDate, offer.status) &&
        (favouriteStores.size === 0 ||
          favouriteStores.has(offer.merchantName.toLowerCase()) ||
          offer.familyId === "local"),
    )
    .map(toStoreOfferView);

  const restaurantProfileIds = new Set(
    sources.restaurantProfiles
      .filter((profile) => profile.city.toLowerCase() === city)
      .map((profile) => profile.restaurantId),
  );

  const restaurantOffers = sources.restaurantOffers
    .filter(
      (offer) =>
        restaurantProfileIds.has(offer.restaurantId) &&
        isActiveOffer(offer.offerEndDate ?? new Date().toISOString(), offer.status) &&
        (favouriteRestaurants.size === 0 ||
          favouriteRestaurants.has(offer.merchantName.toLowerCase()) ||
          offer.familyId === "local"),
    )
    .map(toRestaurantOfferView);

  return [...storeOffers, ...restaurantOffers];
}

export function rankStoreOffers(offers: OfferView[]): OfferView[] {
  return [...offers]
    .filter((offer) => offer.merchantType === "store")
    .sort((a, b) => {
      const savingsA = (a.normalPrice ?? a.offerPrice) - a.offerPrice;
      const savingsB = (b.normalPrice ?? b.offerPrice) - b.offerPrice;
      if (savingsB !== savingsA) {
        return savingsB - savingsA;
      }
      return new Date(a.validUntilIso).getTime() - new Date(b.validUntilIso).getTime();
    });
}

export function resolveMerchantDetails(
  offerId: string,
  sources: OfferSourceBundle,
  offers: OfferView[],
): MerchantDetailsView | null {
  const offer = offers.find((item) => item.id === offerId);
  if (!offer) {
    return null;
  }

  if (offer.merchantType === "store") {
    const profile = sources.storeProfiles.find((item) => item.storeId === offer.merchantId);
    if (!profile) {
      return null;
    }

    return {
      merchantId: profile.storeId,
      merchantType: "store",
      merchantName: profile.name,
      productName: offer.productName,
      offerPrice: offer.offerPrice,
      normalPrice: offer.normalPrice,
      currency: offer.currency,
      validUntilLabel: offer.validUntilLabel,
      address: profile.address ?? `${profile.district}, ${profile.city}`,
      phone: profile.phone,
      openingHours: profile.openingHours?.label,
      website: profile.website,
    };
  }

  const profile = sources.restaurantProfiles.find(
    (item) => item.restaurantId === offer.merchantId,
  );
  if (!profile) {
    return null;
  }

  return {
    merchantId: profile.restaurantId,
    merchantType: "restaurant",
    merchantName: profile.name,
    productName: offer.productName,
    offerPrice: offer.offerPrice,
    normalPrice: offer.normalPrice,
    currency: offer.currency,
    validUntilLabel: offer.validUntilLabel,
    address: profile.address ?? `${profile.district}, ${profile.city}`,
    phone: profile.phone,
    openingHours: profile.openingHours?.label,
    website: profile.website,
  };
}
