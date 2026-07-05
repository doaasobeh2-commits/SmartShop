import type { ShoppingRange } from "../models/location/ShoppingRange";
import type { StoreBranch } from "../models/store/StoreBranch";
import type { Store } from "../models/store/Store";
import type { StoreDistancePolicy } from "../models/store/StoreDistancePolicy";

export type StoreBranchWithStore = {
  store: Store;
  branch: StoreBranch;
};

export type FilterStoresByShoppingRangeInput = {
  branches: StoreBranchWithStore[];
  range: ShoppingRange;
  policy: StoreDistancePolicy;
};

export type FilterStoresByShoppingRangeResult = {
  inRange: StoreBranchWithStore[];
  outOfRange: StoreBranchWithStore[];
};

/**
 * Filters store branches to those inside the family city and allowed radius.
 */
export type FilterStoresByShoppingRange = {
  execute(
    input: FilterStoresByShoppingRangeInput,
  ): FilterStoresByShoppingRangeResult;
};
