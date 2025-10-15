/******************************************************************************
                                 Constants
******************************************************************************/

import { HousingAreaStatus } from "@src/common/constants";

// const DEFAULT_USER_VALS = (): IMembership => ({
//   name: '',
//     duration_months: 0,
//     total_price: 0,
// });

/******************************************************************************
                                  Types
******************************************************************************/

export interface IHousingArea {
  owner_id: string; // Reference to User
  name: string;
  description: string;
  location: {
    address: string,
    district: string,
    city: string,
    lat: number,
    lng: number,
  };
  expected_rooms: number;
  legal_documents: {
    url: string,
    type: string,
    uploaded_at: Date,
  }[];
  status: HousingAreaStatus; // e.g., "pending", "approved", "rejected"
  rating: {
    _id?: string,
    user_id: string, // Reference to User
    score: number,
    comment: string,
    status: string, // e.g., "pending", "approved", "rejected"
    created_at: Date,
  }[];
  admin_unpublished: boolean; // Whether the area is unpublished by admin
  view_count: number;
  pending_update?: {
    name?: string,
    description?: string,
    location?: {
      address?: string,
      district?: string,
      city?: string,
    },
    expected_rooms?: number,
    legal_documents?: {
      url?: string,
      type?: string,
      uploaded_at?: Date,
    }[],
  };
  reject_reason?: string; // Reason for rejection if status is "rejected"
  isPaid?: boolean; // Whether the area has been paid for
  createdAt?: Date; // Timestamp for creation
  updatedAt?: Date; // Timestamp for last update
}
export interface IHousingAreaCreate {
  owner_id: string; // Reference to User
  name: string;
  description: string;
  location: {
    address: string,
    district: string,
    city: string,
    lat: number,
    lng: number,
  };
  expected_rooms: number;
  legal_documents: {
    url: string,
    type: string,
    uploaded_at: Date,
  }[];
}
export interface IHousingAreaUpdate {
  name: string;
  description: string;
  location: {
    address: string,
    district: string,
    city: string,
    lat: number,
    lng: number,
  };
  status: HousingAreaStatus; // e.g., "pending", "approved", "rejected"
  expected_rooms: number;
  legal_documents: {
    url: string,
    type: string,
    uploaded_at: Date,
  }[];
  reject_reason?: string;
}
export interface IRating {
  avatar_url: string;
  comment: string;
  created_at: string;
  score: number;
  status: string; // "pending", "approved", "rejected"
  user_id: string;
  replies?: IRatingReply[];
}
export interface IRatingInput {
  score: number;
  comment: string;
  status?: string;
}
export interface IRatingReply {
  role: string; // "landlord" hoặc "user"
  content: string;
  created_at: Date;
  user_id: string; // Thêm dòng này
}

/******************************************************************************
                                  Setup
******************************************************************************/

// Initialize the "parseUser" function
// const parseUser = parseObject<IUser>({
//   name: isString,
//   email: isString,
//   role: isEnumVal(RoleEnum),
//   phone: isString,
//   });

//   const parseUserCreate = parseObject<IAddUserReq>({
//   name: isString,
//   email: isEmail,
//   phone: isString,
//   })

/******************************************************************************
                                 Functions
******************************************************************************/

export function testAddHousingArea(arg: unknown): arg is IHousingAreaCreate {
  if (typeof arg !== "object" || arg === null) return false;
  const data = arg as IHousingAreaCreate;

  const validLocation =
    typeof data.location === "object" &&
    data.location !== null &&
    typeof data.location.address === "string" &&
    typeof data.location.district === "string" &&
    typeof data.location.city === "string" &&
    typeof data.location.lat === "number" &&
    typeof data.location.lng === "number";

  const validLegalDocs =
    Array.isArray(data.legal_documents) &&
    data.legal_documents.every(
      (doc) =>
        typeof doc === "object" &&
        typeof doc.url === "string" &&
        typeof doc.type === "string" &&
        (doc.uploaded_at instanceof Date ||
          (typeof doc.uploaded_at === "string" &&
            !isNaN(Date.parse(doc.uploaded_at)))),
    );

  return (
    (data.owner_id === undefined || typeof data.owner_id === "string") &&
    typeof data.name === "string" &&
    typeof data.description === "string" &&
    validLocation &&
    typeof data.expected_rooms === "number" &&
    validLegalDocs
  );
}

export function testPartialAddHousingArea(
  arg: unknown,
): arg is Partial<IHousingAreaCreate> {
  if (typeof arg !== "object" || arg === null) return false;

  const data = arg as Partial<IHousingAreaCreate>;

  // Danh sách các trường hợp lệ
  const allowedKeys = [
    "owner_id",
    "name",
    "description",
    "location",
    "expected_rooms",
    "legal_documents",
  ];

  for (const key of Object.keys(data)) {
    if (!allowedKeys.includes(key)) return false;
  }

  if (data.owner_id !== undefined && typeof data.owner_id !== "string")
    return false;

  if (data.name !== undefined && typeof data.name !== "string") return false;

  if (data.description !== undefined && typeof data.description !== "string")
    return false;

  if (data.location !== undefined) {
    if (
      typeof data.location !== "object" ||
      data.location === null ||
      (data.location.address !== undefined &&
        typeof data.location.address !== "string") ||
      (data.location.district !== undefined &&
        typeof data.location.district !== "string") ||
      (data.location.city !== undefined &&
        typeof data.location.city !== "string")
    ) {
      return false;
    }
  }

  if (
    data.expected_rooms !== undefined &&
    typeof data.expected_rooms !== "number"
  )
    return false;

  if (data.legal_documents !== undefined) {
    if (
      !Array.isArray(data.legal_documents) ||
      !data.legal_documents.every(
        (doc) =>
          typeof doc === "object" &&
          (doc.url === undefined || typeof doc.url === "string") &&
          (doc.type === undefined || typeof doc.type === "string") &&
          (doc.uploaded_at === undefined ||
            doc.uploaded_at instanceof Date ||
            (typeof doc.uploaded_at === "string" &&
              !isNaN(Date.parse(doc.uploaded_at)))),
      )
    ) {
      return false;
    }
  }

  return true;
}

export function testUpdateHousingArea(arg: unknown): arg is IHousingAreaUpdate {
  if (typeof arg !== "object" || arg === null) return false;
  const data = arg as IHousingAreaUpdate;

  // Nếu không có trường nào thì không hợp lệ
  if (
    !data.name &&
    !data.description &&
    !data.location &&
    !data.expected_rooms &&
    !data.legal_documents
  ) {
    return false;
  }

  if (data.name && typeof data.name !== "string") return false;

  if (data.description && typeof data.description !== "string") return false;

  // location là object, không phải mảng
  if (data.location) {
    if (
      typeof data.location !== "object" ||
      data.location === null ||
      (data.location.address !== undefined &&
        typeof data.location.address !== "string") ||
      (data.location.district !== undefined &&
        typeof data.location.district !== "string") ||
      (data.location.city !== undefined &&
        typeof data.location.city !== "string") ||
      (data.location.lat !== undefined &&
        typeof data.location.lat !== "number") ||
      (data.location.lng !== undefined && typeof data.location.lng !== "number")
    ) {
      return false;
    }
  }

  if (
    data.expected_rooms !== undefined &&
    typeof data.expected_rooms !== "number"
  ) {
    return false;
  }

  if (data.legal_documents) {
    if (
      !Array.isArray(data.legal_documents) ||
      !data.legal_documents.every(
        (doc) =>
          typeof doc === "object" &&
          (doc.url === undefined || typeof doc.url === "string") &&
          (doc.type === undefined || typeof doc.type === "string") &&
          (doc.uploaded_at === undefined ||
            doc.uploaded_at instanceof Date ||
            (typeof doc.uploaded_at === "string" &&
              !isNaN(Date.parse(doc.uploaded_at)))),
      )
    ) {
      return false;
    }
  }
  return true;
}
/******************************************************************************
                                Export default
******************************************************************************/

export default {
  testAdd: testAddHousingArea,
  testUpdateHousingArea,
  testPartialAddHousingArea,
} as const;
