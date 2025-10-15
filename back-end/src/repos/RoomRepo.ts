import { HousingAreaStatus, RoomStatus } from "@src/common/constants";
import {
  default as Room,
  RoomDocument,
  default as RoomModel,
} from "@src/models/mongoose/Room";
import { IRoomDb, IUpdateRoom } from "@src/models/Room";
import mongoose from "mongoose";
import { Mongo_Field } from "./../common/constants/index";

export interface RoomSearchCriteria {
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  type?: string; // e.g., "single", "double"
  maxOccupancy?: number; // Maximum number of occupants
  status?: RoomStatus; //AVAILABLE/OCCUPIED
  title?: string; // Partial match on room title
  room_number?: string; // Room number or identifier
  facilities?: string[];
  sortBy?: string;
  sortOrder?: string;
  page: number;
  limit: number;
}

export interface RoomQuery {
  price?: { $gte?: number, $lte?: number };
  area?: { $gte?: number, $lte?: number };
  type?: string;
  max_occupancy?: { $lte?: number };
  status?: string;
  title?: { $regex: string, $options: string };
  room_number?: { $regex: string, $options: string };
  facilities?: {
    $all: {
      $elemMatch: {
        code: number,
      },
    }[],
  };
}
/******************************************************************************
                                Functions
******************************************************************************/

/**
 * Add one room.
 */
const add = async (room: IRoomDb): Promise<RoomDocument> => {
  const newRoom = new Room({
    housing_area_id: new mongoose.Types.ObjectId(room.housing_area_id),
    room_number: "R" + Math.floor(Math.random() * 10000),
    title: room.title,
    price: room.price,
    area: room.area,
    type: room.type,
    max_occupancy: room.max_occupancy,
    status: RoomStatus.available,
  });
  return await newRoom.save();
};

// const addMany = async (room: IRoomCreate): Promise<RoomDocument[]> => {
//   const rooms: RoomDocument[] = [];
//   for (let i = 0; i < room.room_want_create; i++) {
//     const newRoom = new Room({
//       housing_area_id: room.housing_area_id,
//       room_number: `${Number(room.room_number) + i}`,
//       title: room.title,
//       price: room.price,
//       area: room.area,
//       facilities: room.facilities.map((f) => ({
//         code: f,
//         name: getFacilityNameByCode(f),
//       })),
//       images: room.images ?? [],
//       type: room.type,
//       max_occupancy: room.max_occupancy,
//       status: RoomStatus.available,
//       boost_status: BoostStatus.inactive,
//     });
//     const savedRoom = await newRoom.save();
//     rooms.push(savedRoom);
//   }
//   return rooms;
// };
const getAllRoomByHousingArea = async (
  housingAreaId: string,
): Promise<RoomDocument[]> => {
  const rooms = await Room.find({
    housing_area_id: housingAreaId,
    status: { $ne: RoomStatus.delete },
  });
  return rooms;
};

const update = async (
  roomId: string,
  room: Partial<IUpdateRoom>,
): Promise<RoomDocument | null> => {
  return await Room.findByIdAndUpdate(roomId, { $set: room }, { new: true });
};
async function addFacilityToRoom(
  roomId: string,
  facility: { code: number, name: string },
) {
  return await Room.findByIdAndUpdate(
    roomId,
    { $addToSet: { facilities: facility } },
    { new: true },
  );
}
async function removeFacilityFromRoom(roomId: string, code: number) {
  return await Room.findByIdAndUpdate(
    roomId,
    { $pull: { facilities: { code } } },
    { new: true },
  );
}
const findById = async (roomId: string): Promise<RoomDocument | null> => {
  const room = await Room.findOne({
    _id: roomId,
    status: { $ne: RoomStatus.delete },
  });
  return room;
};
const deleteRoom = async (roomId: string): Promise<RoomDocument | null> => {
  return await Room.findByIdAndUpdate(
    roomId,
    { $set: { status: RoomStatus.delete } },
    { new: true },
  );
};

function buildSearchRoomQuery(criteria: RoomSearchCriteria): RoomQuery {
  const query: RoomQuery = {
    status: RoomStatus.available,
  };

  if (criteria.minPrice != null || criteria.maxPrice != null) {
    query.price = {
      ...(criteria.minPrice != null && { $gte: criteria.minPrice }),
      ...(criteria.maxPrice != null && { $lte: criteria.maxPrice }),
    };
  }

  if (criteria.minArea != null || criteria.maxArea != null) {
    query.area = {
      ...(criteria.minArea != null && { $gte: criteria.minArea }),
      ...(criteria.maxArea != null && { $lte: criteria.maxArea }),
    };
  }

  if (criteria.type) query.type = criteria.type;
  if (criteria.status) query.status = criteria.status;
  if (criteria.maxOccupancy)
    query.max_occupancy = { $lte: criteria.maxOccupancy };
  if (criteria.title) query.title = { $regex: criteria.title, $options: "i" };
  if (criteria.room_number)
    query.room_number = { $regex: criteria.room_number, $options: "i" };

  if (criteria.facilities?.length) {
    const codes = criteria.facilities[0]?.split(",").map(Number) || [];
    query.facilities = {
      $all: codes.map((code) => ({ $elemMatch: { code } })),
    };
  }

  return query;
}

//Join Room and Housing Area and Users
//Join Room and Housing Area and Users
function buildRoomAggregationPipeline(
  query: RoomQuery,
  sort: Record<string, 1 | -1>,
  skip: number,
  limit: number,
) {
  return [
    // Filter rooms by criteria from buildSearchRoomQuery
    { $match: query },
    // Link to HousingArea
    {
      $lookup: {
        from: Mongo_Field.housingareas,
        localField: Mongo_Field.housing_area_id,
        foreignField: Mongo_Field._id,
        as: Mongo_Field.housing_area,
        pipeline: [
          {
            $project: {
              _id: 0,
              name: 1,
              owner_id: 1,
              description: 1,
              location: 1,
              view_count: 1,
              status: 1,
            },
          },
        ],
      },
    },
    // Unwind housing_area (Many room just one housing_area)
    { $unwind: `$${Mongo_Field.housing_area}` },
    // Filter out unpublished housing areas AFTER unwind - sử dụng dot notation
    {
      $match: {
        "housing_area.status": { $ne: "unpublished" },
      },
    },
    // Link to User (owner)
    {
      $lookup: {
        from: Mongo_Field.userdetails,
        localField: `${Mongo_Field.housing_area}.${Mongo_Field.owner_id}`,
        foreignField: Mongo_Field.user_id,
        as: Mongo_Field.owner,
        pipeline: [
          {
            $project: {
              _id: 0,
              "identity_card.full_name": 1,
              status: 1,
              verified: 1,
              avatar_url: 1,
            },
          },
        ],
      },
    },
    { $unwind: `$${Mongo_Field.owner}` },
    //Sort, skip và limit
    { $sort: sort },
    { $skip: skip },
    { $limit: limit },
  ];
}

//Search Room by query
async function searchRooms(
  criteria: RoomSearchCriteria,
  sort: Record<string, 1 | -1>,
  skip: number,
  limit: number,
) {
  const query = buildSearchRoomQuery(criteria);
  const pipeline = buildRoomAggregationPipeline(query, sort, skip, limit);
  return await RoomModel.aggregate<mongoose.PipelineStage>(pipeline);
}

//Count total element of each query
async function countRooms(criteria: RoomSearchCriteria) {
  const query = buildSearchRoomQuery(criteria);

  const countPipeline = [
    { $match: query },
    // Link to HousingArea
    {
      $lookup: {
        from: Mongo_Field.housingareas,
        localField: Mongo_Field.housing_area_id,
        foreignField: Mongo_Field._id,
        as: Mongo_Field.housing_area,
      },
    },
    { $unwind: `$${Mongo_Field.housing_area}` },
    // Filter out unpublished housing areas - sử dụng dot notation
    {
      $match: {
        "housing_area.status": { $ne: HousingAreaStatus.unpublish },
      },
    },
    { $count: "total" },
  ];

  const result = await RoomModel.aggregate(countPipeline);
  return result.length > 0 ? result[0].total : 0;
}

async function getHousingAreaByRoomId(roomId: string): Promise<any> {
  // Populate the housing_area_id field
  const room = await RoomModel.findById(roomId).populate(`housing_area_id`);
  return room;
}

async function getRoomsHaveBoosting(): Promise<RoomDocument[]> {
  return await RoomModel.find({
    status: RoomStatus.available,
    boost_status: true,
  });
}

async function findByIds(roomIds: string[]): Promise<RoomDocument[]> {
  return await RoomModel.find({
    _id: { $in: roomIds },
    status: { $ne: RoomStatus.delete },
  });
}

/**
 * Lấy rooms có boost history trong khoảng thời gian
 */
async function getRoomsWithBoostByDateRange(startDate: Date, endDate: Date) {
  return await Room.find({
    boost_history: {
      $elemMatch: {
        start_at: { $gte: startDate },
        end_at: { $lte: endDate },
      },
    },
  }).populate("housing_area_id", "name owner_id location");
}

/**
 * Đếm số lượng boost trong khoảng thời gian
 */
async function countBoostsByDateRange(startDate: Date, endDate: Date) {
  const result = await Room.aggregate([
    {
      $unwind: "$boost_history",
    },
    {
      $match: {
        "boost_history.start_at": { $gte: startDate },
        "boost_history.end_at": { $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        totalBoosts: { $sum: 1 },
        roomsWithBoost: { $addToSet: "$_id" },
      },
    },
  ]);

  return result[0] ?? { totalBoosts: 0, roomsWithBoost: [] };
}

/**
 * Thống kê boost theo housing area
 */
async function getBoostStatsByHousingArea(startDate: Date, endDate: Date) {
  return await Room.aggregate([
    {
      $match: {
        boost_status: true,
        boost_start_at: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $lookup: {
        from: "housingareas",
        localField: "housing_area_id",
        foreignField: "_id",
        as: "housing_area",
      },
    },
    {
      $unwind: "$housing_area",
    },
    {
      $group: {
        _id: "$housing_area_id",
        housing_area_name: { $first: "$housing_area.name" },
        owner_id: { $first: "$housing_area.owner_id" },
        total_boosts: { $sum: 1 },
        rooms_boosted: { $addToSet: "$_id" },
        // Thêm thông tin chi tiết về boost
        boost_details: {
          $push: {
            room_id: "$_id",
            room_number: "$room_number",
            room_title: "$title",
            boost_start_at: "$boost_start_at",
            boost_end_at: "$boost_end_at",
          },
        },
      },
    },
    {
      $addFields: {
        unique_rooms_count: { $size: "$rooms_boosted" },
        total_revenue: { $multiply: ["$total_boosts", 100000] }, // 100k per boost
      },
    },
    {
      $sort: { total_revenue: -1 },
    },
  ]);
}

/******************************************************************************
                                Export default
******************************************************************************/

export default {
  add,
  getAllRoomByHousingArea,
  update,
  findById,
  searchRooms,
  countRooms,
  buildSearchRoomQuery,
  deleteRoom,
  addFacilityToRoom,
  removeFacilityFromRoom,
  getHousingAreaByRoomId,
  getRoomsHaveBoosting,
  findByIds,
  getRoomsWithBoostByDateRange,
  countBoostsByDateRange,
  getBoostStatsByHousingArea,
} as const;
