export const PROPERTY_DOCUMENT_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export type HousingAreaStatus =
  (typeof PROPERTY_DOCUMENT_STATUS)[keyof typeof PROPERTY_DOCUMENT_STATUS];
