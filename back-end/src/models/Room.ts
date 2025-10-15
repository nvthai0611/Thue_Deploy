/******************************************************************************
                                 Constants
******************************************************************************/

import { RoomStatus } from "@src/common/constants";
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import { RouteError } from "@src/common/util/route-errors";
import mongoose from "mongoose";

// const DEFAULT_USER_VALS = (): IMembership => ({
//   name: '',
//     duration_months: 0,
//     total_price: 0,
// });

/******************************************************************************
                                  Types
******************************************************************************/

export interface IRoom {
  housing_area_id: mongoose.Types.ObjectId; // Reference to HousingArea
  tenant_id?: mongoose.Types.ObjectId; // Reference to User, optional for available rooms
  room_number: string; // Unique room number or identifier
  title: string;
  price: number;
  area: number; // in square meters
  facilities: {
    name: string,
    code: number,
  }[];
  images: {
    url: string,
    caption?: string,
    uploaded_at?: Date,
  }[];
  boost_history?: {
    start_at: Date, // Start time of the boost
    end_at: Date, // End time of the boost
  }[];
  type: string; // e.g., "single", "double", "suite"
  max_occupancy: number; // Maximum number of occupants
  status?: string; // e.g., "available", "rented", "pending"
  rental_history?: {
    tenant_id: string, // Reference to User
    contract_id: string, // Reference to Contract
    start_date: Date,
    end_date: Date,
  }[];
  boost_status?: boolean; // e.g., "active", "inactive"
  boost_start_at?: Date; // Start time of the boost
  boost_end_at?: Date; // End time of the boost
}
export interface IRoomCreateRequest {
  housing_area_id: string;
  title: string;
  price: number;
  area: number; // in square meters
  facilities: number[];
  images: {
    url: string,
    caption?: string,
    uploaded_at?: Date,
  }[];
  type: string;
  max_occupancy: number;
  room_want_create: number;
}
export interface IRoomDb {
  housing_area_id: string;
  title: string;
  price: number;
  area: number;
  images: {
    url: string,
    caption?: string,
    uploaded_at?: Date,
  }[];
  type: string;
  max_occupancy: number;
}
export interface IUpdateRoomRequest {
  room_number?: string;
  title?: string;
  price?: number;
  area?: number; // in square meters
  facilities: number[];
  images: {
    url: string,
    caption?: string,
    uploaded_at?: Date,
  }[];
  type: string; // e.g., "single", "double", "suite"
  max_occupancy: number; // Maximum number of occupants
  status?: RoomStatus;
}

export interface IUpdateRoom {
  room_number?: string;
  title?: string;
  price?: number;
  area?: number; // in square meters
  facilities: { code: number, name: string }[];
  images?: {
    url: string,
    caption?: string,
    uploaded_at?: Date,
  }[];
  type: string; // e.g., "single", "double"
  max_occupancy: number; // Maximum number of occupants
  status?: RoomStatus;
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

//   const parseAddUser = parseObject<IAddUserReq>({
//   name: isString,
//   email: isEmail,
//   phone: isString,
//   })

/******************************************************************************
                                 Functions
******************************************************************************/
export function testAddRoom(arg: unknown): arg is IRoomCreateRequest {
  if (typeof arg !== "object" || arg === null) return false;

  const data = arg as IRoomCreateRequest;

  if (
    typeof data.housing_area_id !== "string" ||
    typeof data.title !== "string" ||
    typeof data.price !== "number" ||
    typeof data.area !== "number" ||
    !Array.isArray(data.facilities) ||
    typeof data.type !== "string" ||
    typeof data.max_occupancy !== "number" ||
    typeof data.room_want_create !== "number"
  ) {
    return false;
  }

  if (
    !data.facilities.every((f) => typeof f === "number" && f >= 1 && f <= 13)
  ) {
    return false;
  }
  if (data.images !== undefined) {
    if (
      !Array.isArray(data.images) ||
      data.images.some(
        (img) =>
          typeof img !== "object" ||
          img === null ||
          typeof img.url !== "string" ||
          (img.caption !== undefined && typeof img.caption !== "string") ||
          (img.uploaded_at !== undefined && !(img.uploaded_at instanceof Date)),
      )
    ) {
      return false;
    }
  }

  return true;
}

export function testUpdateRoom(
  arg: unknown,
): arg is Partial<IUpdateRoomRequest> {
  if (typeof arg !== "object" || arg === null) return false;

  const data = arg as Partial<IUpdateRoomRequest>;

  // Không có trường nào được gửi lên
  if (
    data.room_number === undefined &&
    data.title === undefined &&
    data.price === undefined &&
    data.area === undefined &&
    data.facilities === undefined &&
    data.images === undefined &&
    data.type === undefined &&
    data.max_occupancy === undefined
    && data.status === undefined
  ) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, "No fields to update");
  }

  // room_number
  if (data.room_number !== undefined && typeof data.room_number !== "string") {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, "Invalid room_number");
  }

  // title
  if (data.title !== undefined && typeof data.title !== "string") {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, "Invalid title");
  }

  // price
  if (data.price !== undefined && typeof data.price !== "number") {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, "Invalid price");
  }

  // area
  if (data.area !== undefined && typeof data.area !== "number") {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, "Invalid area");
  }

  // facilities
  if (data.facilities !== undefined) {
    if (
      !Array.isArray(data.facilities) ||
      !data.facilities.every((f) => typeof f === "number" && f >= 1 && f <= 13)
    ) {
      throw new RouteError(
        HttpStatusCodes.BAD_REQUEST,
        "Invalid facilities: must be an array of numbers from 1 to 13",
      );
    }
  }

  // type
  if (data.type !== undefined && typeof data.type !== "string") {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, "Invalid type");
  }

  // max_occupancy
  if (
    data.max_occupancy !== undefined &&
    (!Number.isInteger(data.max_occupancy) || data.max_occupancy <= 0)
  ) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      "Invalid max_occupancy: must be a positive integer",
    );
  }

  // images
  if (data.images !== undefined) {
    if (!Array.isArray(data.images)) {
      throw new RouteError(
        HttpStatusCodes.BAD_REQUEST,
        "Images must be an array",
      );
    }

    for (const img of data.images) {
      if (
        typeof img !== "object" ||
        img === null ||
        typeof img.url !== "string" ||
        (img.caption !== undefined && typeof img.caption !== "string") ||
        (img.uploaded_at !== undefined &&
          !(
            img.uploaded_at instanceof Date ||
            (typeof img.uploaded_at === "string" &&
              !isNaN(Date.parse(img.uploaded_at)))
          ))
      ) {
        throw new RouteError(
          HttpStatusCodes.BAD_REQUEST,
          "Invalid image format",
        );
      }
    }
  }
  // status
  if (data.status !== undefined) {
    if (typeof data.status !== "string") {
      throw new RouteError(HttpStatusCodes.BAD_REQUEST, "Invalid status");
    }

    const forbiddenStatuses = [RoomStatus.delete , RoomStatus.occupied];
    if (forbiddenStatuses.includes(data.status)) {
      throw new RouteError(
        HttpStatusCodes.BAD_REQUEST,
        `Status "${data.status}" is not allowed`,
      );
    }

    if (!Object.values(RoomStatus).includes(data.status)) {
      throw new RouteError(HttpStatusCodes.BAD_REQUEST, "Invalid status value");
    }
  }

  return true;
}

/******************************************************************************
                                Export default
******************************************************************************/

export default {
  testAddRoom,
  testUpdateRoom,
} as const;
