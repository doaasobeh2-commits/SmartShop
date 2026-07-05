export type BasketLineItem = {
  id: string;
  merchantName: string;
  itemLabel: string;
  offerPrice: number;
  validityLabel: string;
  status: "active" | "expires_soon";
};

export const DEMO_BASKET_ITEMS: BasketLineItem[] = [
  {
    id: "1",
    merchantName: "Billa",
    itemLabel: "Milch (1L)",
    offerPrice: 1.19,
    validityLabel: "bis 12.07.",
    status: "active",
  },
  {
    id: "2",
    merchantName: "Billa",
    itemLabel: "Hähnchenbrust (500g)",
    offerPrice: 5.49,
    validityLabel: "bis 10.07.",
    status: "expires_soon",
  },
  {
    id: "3",
    merchantName: "Merkur",
    itemLabel: "Spülmittel",
    offerPrice: 2.29,
    validityLabel: "bis 15.07.",
    status: "active",
  },
];
