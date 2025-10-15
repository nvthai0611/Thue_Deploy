import { HousingAreaStatus, RoomStatus } from "@src/common/constants";
import { rateStatus } from "@src/common/constants";
import {
  IHousingArea,
  IHousingAreaCreate,
  IHousingAreaUpdate,
  IRatingInput,
  IRating,
  IRatingReply,
} from "@src/models/HousingArea";
import HousingArea, {
  HousingAreaDocument,
} from "@src/models/mongoose/HousingArea";
import Room from "@src/models/mongoose/Room";
import mongoose from "mongoose";

/******************************************************************************
                                Functions
******************************************************************************/

/**
 * Add one housing area.
 */
async function add(
  housingArea: IHousingAreaCreate,
): Promise<HousingAreaDocument> {
  const newHousingArea = new HousingArea({
    ...housingArea,
    status: HousingAreaStatus.pending,
    admin_unpublished: false, // luôn set status là pending khi tạo mới
  });
  return await newHousingArea.save();
}
/**
 * Find one housing area by ID.
 */
async function findOneById(id: string): Promise<HousingAreaDocument | null> {
  return await HousingArea.findOne({
    _id: id,
    status: { $ne: HousingAreaStatus.delete },
  }).exec();
}
/**
 * Update one housing area.
 */
async function update(
  id: string,
  housingArea: Partial<IHousingAreaUpdate>,
): Promise<HousingAreaDocument | null> {
  return await HousingArea.findByIdAndUpdate(
    id,
    { $set: housingArea },
    { new: true },
  );
}

async function reSubmit(
  id: string,
  data: Partial<IHousingAreaUpdate>,
): Promise<HousingAreaDocument | null> {
  return await HousingArea.findByIdAndUpdate(
    id,
    {
      $set: { ...data, status: HousingAreaStatus.pending },
      $unset: { reject_reason: "" },
    },
    { new: true },
  );
}
async function updateAndUnsetPending(
  id: string,
  housingArea: Partial<IHousingArea>,
): Promise<HousingAreaDocument | null> {
  return await HousingArea.findByIdAndUpdate(
    id,
    { $set: housingArea, $unset: { pending_update: "" } },
    { new: true },
  );
}

async function pushPendingUpdate(
  id: string,
  pendingUpdate: Partial<IHousingAreaUpdate>,
): Promise<HousingAreaDocument | null> {
  return await HousingArea.findByIdAndUpdate(
    id,
    {
      $set: {
        pending_update: pendingUpdate,
      },
      $unset: { reject_reason: "" },
    },
    { new: true },
  );
}

async function deleteHousingArea(
  id: string,
): Promise<HousingAreaDocument | null> {
  const deletedHousingArea = await HousingArea.findByIdAndUpdate(
    id,
    { $set: { status: HousingAreaStatus.delete } },
    { new: true },
  ).exec();
  await Room.updateMany(
    { housing_area_id: id },
    { $set: { status: RoomStatus.delete } },
  ).exec();

  return deletedHousingArea;
}

async function findByStatusByUserId(
  status: HousingAreaStatus,
  userId: string,
): Promise<HousingAreaDocument[]> {
  return await HousingArea.find({ status, owner_id: userId });
}

async function addHousingAreaRate(
  id: string,
  userId: string,
  rateData: IRatingInput,
): Promise<HousingAreaDocument | null> {
  return await HousingArea.findByIdAndUpdate(
    id,
    {
      $push: {
        rating: {
          user_id: userId,
          score: rateData.score,
          comment: rateData.comment,
          status: rateStatus.approved,
          created_at: new Date(),
        },
      },
    },
    { new: true },
  );
}

async function changeHousingAreaRateStatus(
  id: string,
  housingAreaId: string,
  status: string,
): Promise<HousingAreaDocument | null> {
  return await HousingArea.findOneAndUpdate(
    {
      _id: housingAreaId,
      "rating._id": id,
    },
    {
      $set: {
        "rating.$.status": status,
      },
    },
    { new: true },
  );
}

export async function updateRatingReply(
  housingAreaId: string,
  ratingId: string,
  type: "landlord" | "user",
  reply: IRatingReply,
) {
  const updateField =
    type === "landlord" ? "rating.$.landlord_reply" : "rating.$.user_reply";
  return await HousingArea.updateOne(
    { _id: housingAreaId, "rating._id": ratingId },
    { $set: { [updateField]: reply } },
  );
}

export async function addRatingReply(
  housingAreaId: string,
  ratingId: string,
  reply: IRatingReply,
) {
  return await HousingArea.updateOne(
    { _id: housingAreaId, "rating._id": ratingId },
    { $push: { "rating.$.replies": reply } },
  );
}

async function getAllRatingsByHousingId(
  housingId: string,
  status?: string,
): Promise<IRating[]> {
  const pipeline: any[] = [
    {
      $match: { _id: new mongoose.Types.ObjectId(housingId) },
    },
    {
      $unwind: "$rating",
    },
    ...(status ? [{ $match: { "rating.status": status } }] : []),
    {
      $sort: { "rating.created_at": -1 },
    },
    {
      $group: {
        _id: "$_id",
        ratings: { $push: "$rating" },
      },
    },
    {
      $lookup: {
        from: "userdetails",
        localField: "ratings.user_id",
        foreignField: "user_id",
        as: "usersInfo",
      },
    },
    {
      $project: {
        _id: 0,
        ratings: {
          $map: {
            input: "$ratings",
            as: "rating",
            in: {
              score: "$$rating.score",
              comment: "$$rating.comment",
              created_at: "$$rating.created_at",
              status: "$$rating.status",
              user_id: "$$rating.user_id",
              avatar_url: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$usersInfo",
                      as: "user",
                      cond: { $eq: ["$$user.user_id", "$$rating.user_id"] },
                    },
                  },
                  0,
                ],
              },
            },
          },
        },
      },
    },
    {
      $unwind: "$ratings",
    },

    {
      $replaceRoot: { newRoot: "$ratings" },
    },
  ];
  const result = await HousingArea.aggregate(pipeline);
  return result.map((item: any) => ({
    score: item.score,
    comment: item.comment,
    created_at: item.created_at,
    status: item.status,
    user_id: item.user_id,
    avatar_url: item.avatar_url?.avatar_url ?? "",
  })) as IRating[];
}

const findAllHousingAreasByUserIdAndStatus = async (
  userId: string,
  status: HousingAreaStatus,
): Promise<HousingAreaDocument[]> => {
  return await HousingArea.find({ owner_id: userId, status: status });
};

const setIsPaidHousingArea = async (
  id: string,
  isPaid: boolean,
): Promise<HousingAreaDocument | null> => {
  return await HousingArea.findByIdAndUpdate(
    id,
    { $set: { isPaid } },
    { new: true },
  );
};

/**
 * Get the top N housing areas with the highest average rating,
 *  including only the first room of each housing area (to avoid cluttering)
 */
async function getTopHousingAreasWithRoomsRepo(topN = 10) {
  const areas = await HousingArea.find({ status: HousingAreaStatus.publish });
  const areasWithAvgRating = await Promise.all(
    areas.map(async (area) => {
      const ratings = area.rating?.filter((r) => r.status === "approved") ?? [];
      const avgRating = ratings.length
        ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
        : 0;
      // only get the first available room to avoid cluttering
      const rooms = await Room.find({
        housing_area_id: area._id,
        status: RoomStatus.available,
      }).limit(1); // Chỉ lấy 1 room đầu tiên

      return {
        _id: area._id,
        name: area.name,
        address: area.location?.address,
        avgRating,
        rooms: rooms.map((r) => ({
          _id: r._id,
          room_number: r.room_number,
          title: r.title,
          price: r.price,
          area: r.area,
          images: r.images,
          type: r.type,
          max_occupancy: r.max_occupancy,
        })),
      };
    }),
  );

  // Lọc ra những housing area có ít nhất 1 room available
  const areasWithRooms = areasWithAvgRating.filter(
    (area) => area.rooms.length > 0,
  );

  return areasWithRooms
    .sort((a, b) => b.avgRating - a.avgRating)
    .slice(0, topN);
}

async function getHousingAreasByDateRange(
  startDate: Date,
  endDate: Date,
): Promise<IHousingArea[]> {
  return await HousingArea.find({
    createdAt: {
      $gte: startDate,
      $lte: endDate,
    },
  })
    .populate("owner_id", "full_name email phone_number")
    .sort({ createdAt: -1 })
    .lean();
}

async function countHousingAreasByStatusAndDateRange(
  startDate: Date,
  endDate: Date,
  status?: string,
): Promise<number> {
  const query: any = {
    createdAt: {
      $gte: startDate,
      $lte: endDate,
    },
  };

  if (status) {
    query.status = status;
  }

  return await HousingArea.countDocuments(query);
}

/**
 * Lấy housing areas đã thanh toán trong khoảng thời gian
 */
async function getPaidHousingAreasByDateRange(
  startDate: Date,
  endDate: Date,
): Promise<HousingAreaDocument[]> {
  return await HousingArea.find({
    isPaid: true,
    createdAt: {
      $gte: startDate,
      $lte: endDate,
    },
    status: { $ne: HousingAreaStatus.delete },
  }).populate("owner_id", "full_name email phone_number");
}

/**
 * Đếm housing areas đã thanh toán theo user và khoảng thời gian
 */
async function countPaidHousingAreasByUserAndDateRange(
  startDate: Date,
  endDate: Date,
): Promise<any[]> {
  return await HousingArea.aggregate([
    {
      $match: {
        isPaid: true,
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
        status: { $ne: HousingAreaStatus.delete },
      },
    },
    {
      $group: {
        _id: "$owner_id",
        totalPaidPosts: { $sum: 1 },
        housingAreas: {
          $push: {
            id: "$_id",
            name: "$name",
            location: "$location",
            createdAt: "$createdAt",
            status: "$status",
          },
        },
      },
    },
    {
      $addFields: {
        totalRevenue: { $multiply: ["$totalPaidPosts", 50000] },
      },
    },
    {
      $lookup: {
        from: "userdetails",
        localField: "_id",
        foreignField: "user_id",
        as: "userInfo",
      },
    },
    {
      $addFields: {
        userInfo: { $arrayElemAt: ["$userInfo", 0] },
      },
    },
    {
      $sort: { totalRevenue: -1 },
    },
  ]);
}

/**
 * Thống kê tổng doanh thu từ đăng bài theo khoảng thời gian
 */
async function getPostingRevenueStats(startDate: Date, endDate: Date) {
  const result = await HousingArea.aggregate([
    {
      $match: {
        isPaid: true,
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
        status: { $ne: HousingAreaStatus.delete },
      },
    },
    {
      $group: {
        _id: null,
        totalPaidPosts: { $sum: 1 },
        uniqueUsers: { $addToSet: "$owner_id" },
        statusBreakdown: { $push: "$status" },
        districtBreakdown: { $push: "$location.district" },
      },
    },
    {
      $addFields: {
        totalRevenue: { $multiply: ["$totalPaidPosts", 50000] },
        uniqueUsersCount: { $size: "$uniqueUsers" },
      },
    },
  ]);

  return (
    result[0] ?? {
      totalPaidPosts: 0,
      totalRevenue: 0,
      uniqueUsers: [],
      uniqueUsersCount: 0,
      statusBreakdown: [],
      districtBreakdown: [],
    }
  );
}

/******************************************************************************
                                Export default
******************************************************************************/

export default {
  add,
  findOneById,
  update,
  pushPendingUpdate,
  updateAndUnsetPending,
  reSubmit,
  deleteHousingArea,
  findByStatusByUserId,
  addHousingAreaRate,
  changeHousingAreaRateStatus,
  getAllRatingsByHousingId,
  updateRatingReply,
  addRatingReply,
  findAllHousingAreasByUserIdAndStatus,
  setIsPaidHousingArea,
  getTopHousingAreasWithRoomsRepo,
  getHousingAreasByDateRange,
  countHousingAreasByStatusAndDateRange,
  getPaidHousingAreasByDateRange,
  countPaidHousingAreasByUserAndDateRange,
  getPostingRevenueStats,
} as const;
