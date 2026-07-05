/**
 * Brand affinity used when ranking offers and basket items.
 */
export type BrandPreference = {
  brandId: string;
  brandName: string;
  /** Lower values rank higher when multiple preferred brands match. */
  priority?: number;
};

export type BrandPreferenceList = {
  preferred: BrandPreference[];
  disliked: BrandPreference[];
};
