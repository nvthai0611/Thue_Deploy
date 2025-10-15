import { HousingAreaStatus, RoomStatus } from "@src/common/constants";
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import { getUserIdFromRequest } from "@src/common/util/authorization";
import { getFacilityNameByCode } from "@src/common/util/business";
import { toRoomResponse } from "@src/common/util/response";
import { RouteError } from "@src/common/util/route-errors";
import { RoomDocument } from "@src/models/mongoose/Room";
import { IRoomCreateRequest, IUpdateRoomRequest } from "@src/models/Room";
import ContractRepo from "@src/repos/ContractRepo";
import HousingAreaRepo from "@src/repos/HousingAreaRepo";
import RoomRepo, { RoomSearchCriteria } from "@src/repos/RoomRepo";
import UserDetailRepo from "@src/repos/UserDetailRepo";
import { IReq } from "@src/routes/common/types";
import logger from "jet-logger";

const HOUSING_AREA_NOT_FOUND_ERR = "Housing area not found";

async function addMany(
  data: IRoomCreateRequest,
  req: IReq,
): Promise<RoomDocument[]> {
  const findByIdHousingArea = await HousingAreaRepo.findOneById(
    data.housing_area_id,
  );
  const userId = getUserIdFromRequest(req);
  if (findByIdHousingArea?.owner_id !== userId) {
    throw new RouteError(
      HttpStatusCodes.FORBIDDEN,
      "You are not the owner of this housing area",
    );
  }
  if (!findByIdHousingArea) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, HOUSING_AREA_NOT_FOUND_ERR);
  }
  if (
    findByIdHousingArea.status !== HousingAreaStatus.approved &&
    findByIdHousingArea.status !== HousingAreaStatus.publish &&
    findByIdHousingArea.status !== HousingAreaStatus.unpublish
  ) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      "Housing area is not approved yet",
    );
  }
  const listRoom = await RoomRepo.getAllRoomByHousingArea(data.housing_area_id);
  const roomLeft = findByIdHousingArea.expected_rooms - listRoom.length;

  if (roomLeft < data.room_want_create) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      "Housing area has reached the maximum number of rooms",
    );
  }

  const roomsToAdd: RoomDocument[] = [];

  for (let i = 0; i < data.room_want_create; i++) {
    const { facilities, ...rest } = data;

    const addedRoom = await RoomRepo.add(rest);
    const roomIdStr = (addedRoom._id as string).toString();

    if (Array.isArray(facilities) && facilities.length > 0) {
      const fullFacilities = facilities
        .map((code) => ({
          code,
          name: getFacilityNameByCode(code),
        }))
        .filter((f) => f.name);

      await Promise.all(
        fullFacilities.map((f) => RoomRepo.addFacilityToRoom(roomIdStr, f)),
      );
    }
    const completeRoom = await RoomRepo.findById(roomIdStr);
    if (!completeRoom) {
      throw new RouteError(HttpStatusCodes.NOT_FOUND, "Room not found");
    }

    roomsToAdd.push(completeRoom);
  }

  return roomsToAdd;
}

async function getListRoomByHousingAreaId(
  id: string,
): Promise<ReturnType<typeof toRoomResponse>[]> {
  const getHousingArea = await HousingAreaRepo.findOneById(id);
  if (!getHousingArea) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, HOUSING_AREA_NOT_FOUND_ERR);
  }
  const listRoomByHousingAreaId = await RoomRepo.getAllRoomByHousingArea(id);
  if (!listRoomByHousingAreaId) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, HOUSING_AREA_NOT_FOUND_ERR);
  }
  return listRoomByHousingAreaId.map(toRoomResponse);
}

const updateRoom = async (
  id: string,
  data: Partial<IUpdateRoomRequest>,
  req: IReq,
) => {
  const findByIdRoom = await RoomRepo.findById(id);
  const userId = getUserIdFromRequest(req);

  if (!findByIdRoom) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, "Room not found");
  }
  if (findByIdRoom.status === RoomStatus.occupied) {
    if (data.status ?? data.price ?? data.max_occupancy) {
      throw new RouteError(
        HttpStatusCodes.BAD_REQUEST,
        "You cannot update room when it is occupied",
      );
    }
  }
  const findByIdHousingArea = await HousingAreaRepo.findOneById(
    findByIdRoom.housing_area_id.toString(),
  );
  if (!findByIdHousingArea) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, HOUSING_AREA_NOT_FOUND_ERR);
  }
  if (
    findByIdHousingArea.status !== HousingAreaStatus.approved &&
    findByIdHousingArea.status !== HousingAreaStatus.publish &&
    findByIdHousingArea.status !== HousingAreaStatus.unpublish
  ) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      "Housing area is not approved yet",
    );
  }
  if (findByIdHousingArea.owner_id !== userId) {
    throw new RouteError(
      HttpStatusCodes.FORBIDDEN,
      "You are not the owner of this housing area",
    );
  }
  const { facilities, ...rest } = data;
  const updatedRoom = await RoomRepo.update(id, rest);
  if (!updatedRoom) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, "Room not found");
  }
  if (facilities && Array.isArray(facilities)) {
    const fullFacilities = facilities
      .map((code) => ({
        code,
        name: getFacilityNameByCode(code),
      }))
      .filter((f) => f.name);
    const currentFacilities = findByIdRoom.facilities.map((f) => f.code);
    const currentCodes = currentFacilities;
    const newCodes = fullFacilities.map((f) => f.code);

    const toAdd = fullFacilities.filter((f) => !currentCodes.includes(f.code));
    const toRemove = currentFacilities.filter(
      (code) => !newCodes.includes(code),
    );
    for (const f of toAdd) {
      await RoomRepo.addFacilityToRoom(id, f);
    }
    for (const f of toRemove) {
      await RoomRepo.removeFacilityFromRoom(id, f);
    }
  }
  return updatedRoom;
};

const deleteRoom = async (id: string, req: IReq) => {
  const findByIdRoom = await RoomRepo.findById(id);
  const userId = getUserIdFromRequest(req);
  if (!findByIdRoom) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, "Room not found");
  }
  if (findByIdRoom.status !== RoomStatus.available) {
    throw new RouteError(
      HttpStatusCodes.FORBIDDEN,
      "You are not the owner of this room",
    );
  }
  const findByIdHousingArea = await HousingAreaRepo.findOneById(
    findByIdRoom.housing_area_id.toString(),
  );
  if (!findByIdHousingArea) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, HOUSING_AREA_NOT_FOUND_ERR);
  }
  if (
    findByIdHousingArea.status !== HousingAreaStatus.approved &&
    findByIdHousingArea.status !== HousingAreaStatus.publish &&
    findByIdHousingArea.status !== HousingAreaStatus.unpublish
  ) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      "Housing area is not approved yet",
    );
  }
  if (findByIdHousingArea.owner_id !== userId) {
    throw new RouteError(
      HttpStatusCodes.FORBIDDEN,
      "You are not the owner of this housing area",
    );
  }
  const result = await RoomRepo.deleteRoom(id);
  if (!result) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, "Room not found");
  }
  return result;
};

async function searchRooms(criteria: RoomSearchCriteria) {
  const page = criteria.page;
  const limit = criteria.limit;
  const sortBy = criteria.sortBy;
  const sortOrder = criteria.sortOrder;
  const sort: Record<string, 1 | -1> = {};

  if (sortBy) {
    const order: -1 | 1 = sortOrder === "desc" ? -1 : 1;
    sort[sortBy] = order;
  }

  const skip = (page - 1) * limit;
  const results = await RoomRepo.searchRooms(criteria, sort, skip, limit);

  return results;
}

const getDetailRoomById = async (id: string) => {
  const room = await RoomRepo.findById(id);

  if (!room) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, "Room not found");
  }

  const contract = await ContractRepo.getContractByRoomId(id);

  const housingArea = await HousingAreaRepo.findOneById(
    room.housing_area_id.toString(),
  );

  return {
    ...room.toObject(),
    housing_area: housingArea,
    contract,
  };
};

const boostingRoom = async (
  roomId: string,
  userId: string,
): Promise<RoomDocument> => {
  const room = await RoomRepo.findById(roomId);
  if (!room) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, "Room not found");
  }
  if (room.status !== RoomStatus.available) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      "Room is not available for boosting",
    );
  }
  if (room.boost_status) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      "Room is already boosted",
    );
  }
  const housingArea = await HousingAreaRepo.findOneById(
    room.housing_area_id.toString(),
  );
  if (!housingArea) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, "Housing area not found");
  }
  if (
    housingArea.status !== HousingAreaStatus.approved &&
    housingArea.status !== HousingAreaStatus.publish &&
    housingArea.status !== HousingAreaStatus.unpublish
  ) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      "Housing area is not approved yet",
    );
  }
  const contract = await ContractRepo.getContractActivingByRoomId(roomId);
  if (contract) {
    throw new RouteError(
      HttpStatusCodes.NOT_FOUND,
      "Room is occupied by a contract",
    );
  }
  const user = await UserDetailRepo.getUserDetailById(userId);
  if (!user) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, "User not found");
  }
  if (!user.verified) {
    throw new RouteError(
      HttpStatusCodes.FORBIDDEN,
      "You must be a verified user to boost a room",
    );
  }
  room.boost_status = true;
  room.boost_start_at = new Date();
  room.boost_end_at = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  return await room.save();
};

const getRoomsHaveBoosting = async (): Promise<RoomDocument[]> => {
  const rooms = await RoomRepo.getRoomsHaveBoosting();
  return rooms;
};

const addSavedRoom = async (userId: string, roomId: string): Promise<void> => {
  logger.info(`Adding saved room ${roomId} for user ${userId}`);
  const userDetail = await UserDetailRepo.getUserDetailById(userId);
  if (!userDetail) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, "User not found");
  }
  if (userDetail.saved_rooms.includes(roomId)) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, "Room is already saved");
  }
  if (Array.isArray(userDetail.property_document)) {
    userDetail.property_document = undefined;
  }
  userDetail.saved_rooms.push(roomId);
  await userDetail.save();
};

const removeSavedRoom = async (
  userId: string,
  roomId: string,
): Promise<void> => {
  const userDetail = await UserDetailRepo.getUserDetailById(userId);
  if (!userDetail) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, "User not found");
  }
  const index = userDetail.saved_rooms.indexOf(roomId);
  if (index === -1) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, "Room is not saved");
  }
  userDetail.saved_rooms.splice(index, 1);
  await userDetail.save();
};

const getListSavedRooms = async (userId: string): Promise<RoomDocument[]> => {
  const userDetail = await UserDetailRepo.getUserDetailById(userId);
  if (!userDetail) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, "User not found");
  }
  const savedRoomIds = userDetail.saved_rooms;
  if (savedRoomIds.length === 0) {
    return [];
  }
  const savedRooms = await RoomRepo.findByIds(savedRoomIds);
  if (!savedRooms || savedRooms.length === 0) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, "No saved rooms found");
  }
  return savedRooms;
};

const getRoomById = async (id: string) => {
  const room = await RoomRepo.findById(id);
  if (!room) {
    return null;
  }
  return room;
};

const findSimilarRooms = async (room: RoomDocument, limit = 5) => {
  if (!room) {
    return [];
  }

  const minPrice = room.price * 0.8;
  const maxPrice = room.price * 1.2;
  const minArea = room.area * 0.8;
  const maxArea = room.area * 1.2;

  const criteria: RoomSearchCriteria = {
    minPrice,
    maxPrice,
    minArea,
    maxArea,
    type: room.type,
    status: RoomStatus.available,
    page: 1,
    limit: limit + 1,
  };

  const sort: Record<string, 1 | -1> = {};
  const skip = 0;
  const similarRooms = await RoomRepo.searchRooms(
    criteria,
    sort,
    skip,
    limit + 1,
  );

  const roomId = String(room._id);
  return (similarRooms as RoomDocument[])
    .filter((similarRoom) => String(similarRoom._id) !== roomId)
    .slice(0, limit);
};

export default {
  addMany,
  updateRoom,
  searchRooms,
  getListRoomByHousingAreaId,
  deleteRoom,
  getDetailRoomById,
  boostingRoom,
  getRoomsHaveBoosting,
  getListSavedRooms,
  addSavedRoom,
  removeSavedRoom,
  getRoomById,
  findSimilarRooms,
} as const;
