export const HOUSING_AREA_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  PUBLISHED: "published",
  UNPUBLISHED: "unpublished",
  REJECTED: "rejected",
  DELETED: "deleted",
} as const;

export type HousingAreaStatus =
  (typeof HOUSING_AREA_STATUS)[keyof typeof HOUSING_AREA_STATUS];

export const HOUSING_AREA_STATUS_COLORS: Record<HousingAreaStatus, string> = {
  pending: "bg-yellow-500 text-white",
  approved: "bg-blue-500 text-white",
  published: "bg-green-500 text-white",
  unpublished: "bg-black text-white",
  rejected: "bg-red-500 text-white",
  deleted: "bg-red-500 text-white",
};

export const HOUSING_AREA_STATUS_LABELS: Record<HousingAreaStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  published: "Published",
  unpublished: "Unpublished",
  rejected: "Rejected",
  deleted: "Deleted",
};
