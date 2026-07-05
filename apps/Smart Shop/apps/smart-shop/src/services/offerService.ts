import {
  buildOfferViews,
  createPilotOfferSources,
  resolveMerchantDetails,
  type MerchantDetailsView,
  type OfferSourceBundle,
  type OfferView,
} from "@smart-shop/core";
import { loadHouseholdSetup } from "../state/localStore";
import { normalizeHouseholdSetup, DEFAULT_HOUSEHOLD_SETUP } from "@smart-shop/core";

let cachedSources: OfferSourceBundle | null = null;

export function getOfferSources(): OfferSourceBundle {
  if (!cachedSources) {
    cachedSources = createPilotOfferSources();
  }
  return cachedSources;
}

export function getOfferViews(): OfferView[] {
  const setup = normalizeHouseholdSetup(loadHouseholdSetup() ?? DEFAULT_HOUSEHOLD_SETUP);
  return buildOfferViews(getOfferSources(), setup);
}

export function getMerchantDetails(offerId: string): MerchantDetailsView | null {
  const offers = getOfferViews();
  return resolveMerchantDetails(offerId, getOfferSources(), offers);
}
