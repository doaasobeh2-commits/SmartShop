import type { ManualOfferStatus } from "../manual-offers/ManualOfferStatus";
import type { OfferSourceBundle } from "./OfferEngine";

const now = new Date();
const weekFromNow = new Date(now.getTime() + 7 * 86400000);

function iso(date: Date): string {
  return date.toISOString();
}

function storeOffer(
  id: string,
  storeId: string,
  merchantName: string,
  productName: string,
  category: string,
  offerPrice: number,
  normalPrice: number,
  endDate: Date,
): OfferSourceBundle["storeOffers"][number] {
  return {
    id,
    familyId: "pilot",
    storeId,
    inputMethod: "manual_entry",
    sourceType: "supermarket_flyer",
    productName,
    category,
    normalPrice,
    offerPrice,
    currency: "EUR",
    offerStartDate: iso(now),
    offerEndDate: iso(endDate),
    availability: { isAvailable: true },
    confidence: "manual",
    status: "active" as ManualOfferStatus,
    merchantName,
    createdAt: iso(now),
    updatedAt: iso(now),
  };
}

function restaurantOffer(
  id: string,
  restaurantId: string,
  merchantName: string,
  mealName: string,
  offerPrice: number,
  normalPrice: number,
): OfferSourceBundle["restaurantOffers"][number] {
  return {
    offerKind: "restaurant",
    id,
    familyId: "pilot",
    restaurantId,
    inputMethod: "manual_entry",
    sourceType: "street_board",
    offerTitle: "Tagesangebot",
    mealName,
    normalPrice,
    offerPrice,
    currency: "EUR",
    offerEndDate: iso(weekFromNow),
    confidence: "manual",
    status: "active",
    merchantName,
    createdAt: iso(now),
    updatedAt: iso(now),
  };
}

/** St. Pölten pilot data — admin-seeded local offers. */
export function createPilotOfferSources(): OfferSourceBundle {
  return {
    storeProfiles: [
      {
        storeId: "billa-stpoelten",
        familyId: "pilot",
        name: "Billa",
        type: "supermarket",
        country: "AT",
        city: "St. Pölten",
        district: "Innenstadt",
        address: "Mariazeller Straße 95, 3100 St. Pölten",
        phone: "+43 2742 123456",
        website: "https://www.billa.at",
        openingHours: { label: "Mo–Sa 7:00–20:00, So 8:00–18:00" },
        pickupSupported: true,
        deliverySupported: false,
        createdAt: iso(now),
        updatedAt: iso(now),
      },
      {
        storeId: "merkur-stpoelten",
        familyId: "pilot",
        name: "Merkur",
        type: "supermarket",
        country: "AT",
        city: "St. Pölten",
        district: "Innenstadt",
        address: "Kremser Landstraße 20, 3100 St. Pölten",
        phone: "+43 2742 654321",
        website: "https://www.merkur.at",
        openingHours: { label: "Mo–Sa 7:30–19:30" },
        pickupSupported: true,
        deliverySupported: false,
        createdAt: iso(now),
        updatedAt: iso(now),
      },
      {
        storeId: "hofer-stpoelten",
        familyId: "pilot",
        name: "Hofer",
        type: "discount",
        country: "AT",
        city: "St. Pölten",
        district: "Süd",
        address: "Siemensstraße 4, 3100 St. Pölten",
        phone: "+43 2742 111222",
        openingHours: { label: "Mo–Sa 8:00–20:00" },
        pickupSupported: true,
        deliverySupported: false,
        createdAt: iso(now),
        updatedAt: iso(now),
      },
    ],
    restaurantProfiles: [
      {
        restaurantId: "kebap-stpoelten",
        familyId: "pilot",
        name: "Kebap Haus",
        cuisineType: "turkish",
        country: "AT",
        city: "St. Pölten",
        district: "Innenstadt",
        address: "Rathausplatz 5, 3100 St. Pölten",
        phone: "+43 2742 333444",
        openingHours: { label: "Di–So 11:00–22:00" },
        pickupSupported: true,
        deliverySupported: true,
        createdAt: iso(now),
        updatedAt: iso(now),
      },
      {
        restaurantId: "pizza-stpoelten",
        familyId: "pilot",
        name: "Pizzeria Roma",
        cuisineType: "italian",
        country: "AT",
        city: "St. Pölten",
        district: "Innenstadt",
        address: "Linzer Straße 12, 3100 St. Pölten",
        phone: "+43 2742 555666",
        website: "https://pizzeria-roma.at",
        openingHours: { label: "Mo–So 11:30–23:00" },
        pickupSupported: true,
        deliverySupported: true,
        createdAt: iso(now),
        updatedAt: iso(now),
      },
    ],
    storeOffers: [
      storeOffer("offer-milk", "billa-stpoelten", "Billa", "Milch (1L)", "Milch", 1.09, 1.29, weekFromNow),
      storeOffer("offer-bread", "billa-stpoelten", "Billa", "Brot", "Backwaren", 1.99, 2.49, weekFromNow),
      storeOffer("offer-apples", "merkur-stpoelten", "Merkur", "Äpfel (1kg)", "Obst", 2.49, 2.99, weekFromNow),
      storeOffer("offer-chicken", "merkur-stpoelten", "Merkur", "Hähnchenbrust (500g)", "Fleisch", 4.99, 5.49, weekFromNow),
      storeOffer("offer-detergent", "hofer-stpoelten", "Hofer", "Spülmittel", "Haushalt", 1.99, 2.29, weekFromNow),
      storeOffer("offer-dog", "merkur-stpoelten", "Merkur", "Hundefutter (1kg)", "Haustier", 4.49, 4.99, weekFromNow),
    ],
    restaurantOffers: [
      restaurantOffer("offer-kebap", "kebap-stpoelten", "Kebap Haus", "Döner Menü", 8.9, 10.9),
      restaurantOffer("offer-pizza", "pizza-stpoelten", "Pizzeria Roma", "Pizza Margherita", 7.5, 9.5),
    ],
  };
}
