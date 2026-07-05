import {
  buildOfferViews,
  createPilotOfferSources,
  mergeUserCapturedOffers,
  resolveMerchantDetails,
  type MerchantDetailsView,
  type OfferSourceBundle,
  type OfferView,
} from "@smart-shop/core";
import { loadHouseholdSetup } from "../state/localStore";
import { normalizeHouseholdSetup, DEFAULT_HOUSEHOLD_SETUP } from "@smart-shop/core";
import { loadUserCapturedOffers } from "./userOfferStore";

let cachedPilotSources: OfferSourceBundle | null = null;

function getPilotSources(): OfferSourceBundle {
  if (!cachedPilotSources) {
    cachedPilotSources = createPilotOfferSources();
  }
  return cachedPilotSources;
}

export function getOfferSources(): OfferSourceBundle {
  const setup = normalizeHouseholdSetup(loadHouseholdSetup() ?? DEFAULT_HOUSEHOLD_SETUP);
  const pilot = getPilotSources();
  return mergeUserCapturedOffers(pilot, loadUserCapturedOffers(), setup.city);
}

export function getOfferViews(): OfferView[] {
  const setup = normalizeHouseholdSetup(loadHouseholdSetup() ?? DEFAULT_HOUSEHOLD_SETUP);
  return buildOfferViews(getOfferSources(), setup);
}

export function getMerchantDetails(offerId: string): MerchantDetailsView | null {
  const offers = getOfferViews();
  return resolveMerchantDetails(offerId, getOfferSources(), offers);
}
