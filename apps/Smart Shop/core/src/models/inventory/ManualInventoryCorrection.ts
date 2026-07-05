/**
 * Family-initiated quantity correction before AI confidence is high.
 * v1 may allow manual adjustment internally; UI remains hidden.
 */
export type ManualInventoryCorrection = {
  id: string;
  familyId: string;
  inventoryItemId: string;
  previousQuantity: number;
  correctedQuantity: number;
  reason?: string;
  correctedAt: string;
  correctedByMemberId?: string;
};
