import { RoomStatus, Sort } from "../constants";

/******************************************************************************
                                 Classes
******************************************************************************/

export interface QueryParams {
  minPrice?: string;
  maxPrice?: string;
  minArea?: string;
  maxArea?: string;
  type?: string;
  maxOccupancy?: string;
  status?: string;
  title?: string;
  room_number?: string;
  facilities?: string[];
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
}

export function parseCriteria(query: QueryParams) {
  const toNumber = (val: string | undefined) => (val ? Number(val) : undefined);
  const toString = (val: string | undefined) =>
    typeof val === "string" ? val : undefined;
  const toArray = (val: string[] | undefined) =>
    Array.isArray(val) ? val : val ? [val] : undefined;

  return {
    minPrice: toNumber(query.minPrice),
    maxPrice: toNumber(query.maxPrice),
    minArea: toNumber(query.minArea),
    maxArea: toNumber(query.maxArea),
    type: toString(query.type),
    maxOccupancy: toNumber(query.maxOccupancy),
    status: toString(query.status) as RoomStatus,
    title: toString(query.title),
    room_number: toString(query.room_number),
    facilities: toArray(query.facilities),
    page: toNumber(query.page) ?? 1,
    limit: toNumber(query.limit) ?? 10,
    sortBy: toString(query.sortBy) ?? Sort.sortBy,
    sortOrder: query.sortOrder === Sort.desc ? Sort.desc : Sort.asc,
  };
}
