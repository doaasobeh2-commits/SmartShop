import { createPilotOfferSources } from "@smart-shop/core";

const STORAGE_KEY = "smartshop.admin";

export type AdminProduct = {
  id: string;
  name: string;
  category: string;
};

export type AdminCategory = {
  id: string;
  name: string;
};

export type AdminStore = {
  id: string;
  name: string;
  address: string;
  city: string;
  phone?: string;
};

export type AdminRestaurant = {
  id: string;
  name: string;
  address: string;
  cuisine?: string;
};

export type AdminOffer = {
  id: string;
  merchantName: string;
  productName: string;
  category: string;
  offerPrice: number;
  normalPrice: number;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
};

export type AdminData = {
  products: AdminProduct[];
  categories: AdminCategory[];
  stores: AdminStore[];
  restaurants: AdminRestaurant[];
  offers: AdminOffer[];
  users: AdminUser[];
};

function readJson<T>(fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(value: AdminData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

function seedAdminData(): AdminData {
  const pilot = createPilotOfferSources();
  const categories = new Set<string>();

  for (const offer of pilot.storeOffers) {
    categories.add(offer.category);
  }

  return {
    products: pilot.storeOffers.map((offer) => ({
      id: offer.id,
      name: offer.productName,
      category: offer.category,
    })),
    categories: [...categories].map((name) => ({
      id: `cat-${name.toLowerCase().replace(/\s+/g, "-")}`,
      name,
    })),
    stores: pilot.storeProfiles.map((store) => ({
      id: store.storeId,
      name: store.name,
      address: store.address ?? "",
      city: store.city,
      phone: store.phone,
    })),
    restaurants: pilot.restaurantProfiles.map((restaurant) => ({
      id: restaurant.restaurantId,
      name: restaurant.name,
      address: restaurant.address ?? "",
      cuisine: restaurant.cuisineType,
    })),
    offers: [
      ...pilot.storeOffers.map((offer) => ({
        id: offer.id,
        merchantName: offer.merchantName,
        productName: offer.productName,
        category: offer.category,
        offerPrice: offer.offerPrice,
        normalPrice: offer.normalPrice ?? offer.offerPrice,
      })),
      ...pilot.restaurantOffers.map((offer) => ({
        id: offer.id,
        merchantName: offer.merchantName,
        productName: offer.mealName,
        category: "Restaurant",
        offerPrice: offer.offerPrice,
        normalPrice: offer.normalPrice ?? offer.offerPrice,
      })),
    ],
    users: [
      {
        id: "user-admin",
        name: "Admin",
        email: "admin@smartshop.local",
        role: "admin",
      },
      {
        id: "user-demo",
        name: "Maria Müller",
        email: "maria@beispiel.de",
        role: "user",
      },
    ],
  };
}

export function loadAdminData(): AdminData {
  const stored = readJson<AdminData | null>(null);
  if (!stored) {
    const seeded = seedAdminData();
    writeJson(seeded);
    return seeded;
  }
  return stored;
}

export function saveAdminData(data: AdminData): void {
  writeJson(data);
}

export function adminStatistics(data: AdminData) {
  return {
    products: data.products.length,
    categories: data.categories.length,
    stores: data.stores.length,
    restaurants: data.restaurants.length,
    offers: data.offers.length,
    users: data.users.length,
  };
}
