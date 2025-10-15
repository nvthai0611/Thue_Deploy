import { IRoom } from "@src/models/Room";
import { ApiErrorResponse, ApiSuccessResponse } from "@src/types/response";
import { Response } from "express";

export function sendSuccess<T>(
  res: Response,
  message: string,
  data: T,
  statusCode = 200,
): Response {
  const response: ApiSuccessResponse<T> = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(response);
}

export function sendError(
  res: Response,
  message: string,
  code = 400,
  errors?: Record<string, string>,
): Response {
  const response: ApiErrorResponse = {
    success: false,
    message,
    errors,
    code,
  };
  return res.status(code).json(response);
}

export function toHousingAreaResponse(doc: any) {
  return {
    id: doc._id,
    name: doc.name,
    owner_id: doc.owner_id,
    description: doc.description,
    location: doc.location,
    expected_rooms: doc.expected_rooms,
    legal_documents: doc.legal_documents,
    status: doc.status,
    reject_reason: doc.reject_reason,
    pending_update: doc.pending_update,
    createdAt: doc.createdAt,
    view_count: doc.view_count,
    user: doc.user,
  };
}

export function toRoomResponse(room: IRoom) {
  return {
    id: (room as any)._id,
    tenant_id: room.tenant_id,
    housing_area_id: room.housing_area_id,
    room_number: room.room_number,
    title: room.title,
    price: room.price,
    area: room.area,
    facilities: room.facilities,
    images: room.images,
    type: room.type,
    max_occupancy: room.max_occupancy,
    status: room.status,
    boost_status: room.boost_status,
  };
}

