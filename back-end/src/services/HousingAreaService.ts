import { HousingAreaStatus, RoomStatus } from "@src/common/constants";
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import { getUserIdFromRequest } from "@src/common/util/authorization";
import {
  checkUserCanPostHousingArea,
  validatePublishStatusChange,
  validateUnpublishStatusChange,
} from "@src/common/util/housingAreaValidator";
import { RouteError } from "@src/common/util/route-errors";
import { supabase } from "@src/common/util/supabase";
import {
  IHousingArea,
  IHousingAreaCreate,
  IHousingAreaUpdate,
  IRatingInput,
  IRatingReply,
} from "@src/models/HousingArea";
import HousingArea, {
  HousingAreaDocument,
} from "@src/models/mongoose/HousingArea";
import Room from "@src/models/mongoose/Room";
import HousingAreaRepo, { addRatingReply } from "@src/repos/HousingAreaRepo";
import UserDetailRepo from "@src/repos/UserDetailRepo";
import { IReq } from "@src/routes/common/types";
import mongoose from "mongoose";
import {
  sendHousingAreaApprovedMail,
  sendHousingAreaRejectedMail,
  sendHousingAreaUpdateApprovedMail,
  sendHousingAreaUpdateRejectedMail,
} from "./email/emailService";
import UserRepo from "@src/repos/UserRepo";
// import RoomRepo from "@src/repos/RoomRepo";

/******************************************************************************
                                Constants
******************************************************************************/
const UNAUTHORIZED = "Unauthorized access";
const NOT_FOUND = "Housing area not found";
const INVALID_HOUSING_AREA = "Invalid housing area status for this operation";
const NO_PENDING_UPDATE =
  "No pending update to approve or reject for this housing area";
/******************************************************************************
                                Functions
******************************************************************************/
async function addOne(data: IHousingAreaCreate): Promise<HousingAreaDocument> {
  if (!data.owner_id) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, "owner_id is required");
  }
  const listHousingArea =
    await HousingAreaRepo.findAllHousingAreasByUserIdAndStatus(
      data.owner_id,
      HousingAreaStatus.pending,
    );
  if (listHousingArea.length >= 2) {
    throw new RouteError(
      HttpStatusCodes.FORBIDDEN,
      "You can only post two housing areas pending at the same time",
    );
  }
  const housingArea: IHousingAreaCreate = {
    owner_id: data.owner_id, // Assuming owner_id is part of the data
    name: data.name,
    description: data.description,
    location: data.location,
    expected_rooms: data.expected_rooms,
    legal_documents: data.legal_documents,
  };
  const result = await HousingAreaRepo.add(housingArea);
  return result;
}

async function approveHousingArea(
  id: string,
): Promise<HousingAreaDocument | null> {
  const existingHousingArea = await HousingAreaRepo.findOneById(id);
  if (!existingHousingArea) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, NOT_FOUND);
  }
  if (existingHousingArea.status !== HousingAreaStatus.pending) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      "Only pending housing areas can be approved",
    );
  }
  const updateFields = {
    status: HousingAreaStatus.approved,
    admin_unpublished: false, // Reset admin_unpublished when approved
  };
  const updatedHousingArea = await HousingAreaRepo.update(id, updateFields);
  if (!updatedHousingArea) {
    throw new RouteError(
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to approve housing area",
    );
  }
  const owner = await UserRepo.getUserById(existingHousingArea.owner_id);
  if (!owner) {
    throw new RouteError(
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      "Owner ID is missing in the housing area",
    );
  }
  // Notify the owner about the approval
  if (owner?.email) {
    await sendHousingAreaApprovedMail(
      owner.email,
      owner.name,
      existingHousingArea.name,
    );
  }
  return updatedHousingArea;
}

async function resubmitHousingArea(
  id: string,
  data: Partial<IHousingAreaCreate>,
  userId: string,
): Promise<HousingAreaDocument | null> {
  const existingHousingArea = await HousingAreaRepo.findOneById(id);
  if (!existingHousingArea) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, NOT_FOUND);
  }
  if (existingHousingArea.status !== HousingAreaStatus.rejected) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      "Only rejected housing areas can be resubmitted",
    );
  }
  if (existingHousingArea.owner_id !== userId) {
    throw new RouteError(HttpStatusCodes.UNAUTHORIZED, UNAUTHORIZED);
  }
  const updatedHousingArea = await HousingAreaRepo.reSubmit(id, data);
  return updatedHousingArea;
}

async function rejectHousingArea(
  id: string,
  reason: string,
): Promise<HousingAreaDocument | null> {
  const existingHousingArea = await HousingAreaRepo.findOneById(id);

  if (!existingHousingArea) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, NOT_FOUND);
  }
  if (existingHousingArea.status !== HousingAreaStatus.pending) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      "Only pending housing areas can be rejected",
    );
  }
  const updateFields = {
    status: HousingAreaStatus.rejected,
    reject_reason: reason,
  };
  const updatedHousingArea = await HousingAreaRepo.update(id, updateFields);
  if (!updatedHousingArea) {
    throw new RouteError(
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to reject housing area",
    );
  }
  const owner = await UserRepo.getUserById(existingHousingArea.owner_id);
  // Notify the owner about the rejection
  if (owner?.email) {
    await sendHousingAreaRejectedMail(
      owner.email,
      owner.name,
      existingHousingArea.name,
      reason,
    );
  }
  return updatedHousingArea;
}

async function pubLishHousingArea(
  id: string,
  userId: string,
): Promise<HousingAreaDocument | null> {
  const existingHousingArea = await HousingAreaRepo.findOneById(id);
  const userDetail = await UserDetailRepo.findOneUserDetail(userId);
  if (!userDetail) {
    throw new RouteError(
      HttpStatusCodes.NOT_FOUND,
      "User detail not found for the provided owner_id",
    );
  }
  if (!existingHousingArea) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, "Housing area not found");
  }
  validatePublishStatusChange(existingHousingArea);
  await checkUserCanPostHousingArea(existingHousingArea, userId);

  const updateFields = {
    status: HousingAreaStatus.publish,
    admin_unpublished: false,
  };
  const updatedHousingArea = await HousingAreaRepo.update(id, updateFields);
  return updatedHousingArea;
}

async function unPubLishHousingArea(
  id: string,
  userId: string,
): Promise<HousingAreaDocument | null> {
  const existingHousingArea = await HousingAreaRepo.findOneById(id);
  const userDetail = await UserDetailRepo.findOneUserDetail(userId);
  if (!userDetail) {
    throw new RouteError(
      HttpStatusCodes.NOT_FOUND,
      "User detail not found for the provided owner_id",
    );
  }
  if (!existingHousingArea) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, NOT_FOUND);
  }
  validateUnpublishStatusChange(existingHousingArea);
  await checkUserCanPostHousingArea(existingHousingArea, userId);
  const updateFields = {
    status: HousingAreaStatus.unpublish,
    admin_unpublished: false,
  };
  const updatedHousingArea = await HousingAreaRepo.update(id, updateFields);
  return updatedHousingArea;
}

async function adminPublishHousingArea(
  id: string,
): Promise<HousingAreaDocument | null> {
  const existingHousingArea = await HousingAreaRepo.findOneById(id);
  if (!existingHousingArea) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, NOT_FOUND);
  }
  if (
    existingHousingArea.status !== HousingAreaStatus.approved &&
    existingHousingArea.status !== HousingAreaStatus.unpublish
  ) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      "Only approved and unpublish housing areas can be published",
    );
  }
  const updateFields = {
    status: HousingAreaStatus.publish,
    admin_unpublished: false,
  };
  const updatedHousingArea = await HousingAreaRepo.update(id, updateFields);
  return updatedHousingArea;
}

async function adminUnPublishHousingArea(
  id: string,
): Promise<HousingAreaDocument | null> {
  const existingHousingArea = await HousingAreaRepo.findOneById(id);
  if (!existingHousingArea) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, NOT_FOUND);
  }
  if (
    existingHousingArea.status !== HousingAreaStatus.approved &&
    existingHousingArea.status !== HousingAreaStatus.publish &&
    existingHousingArea.status !== HousingAreaStatus.unpublish
  ) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      "Only approve and published housing areas can be unpublished",
    );
  }
  const updateFields = {
    status: HousingAreaStatus.unpublish,
    admin_unpublished: true,
  };
  const updatedHousingArea = await HousingAreaRepo.update(id, updateFields);
  return updatedHousingArea;
}

async function getHousingAreaById(
  id: string,
): Promise<HousingAreaDocument | null> {
  const housingArea = await HousingAreaRepo.findOneById(id);
  if (!housingArea) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, NOT_FOUND);
  }
  return housingArea;
}

async function updatePending(
  data: Partial<IHousingAreaUpdate>,
  id: string,
  userId: string,
): Promise<HousingAreaDocument | null> {
  const existingHousingArea = await HousingAreaRepo.findOneById(id);

  if (!existingHousingArea) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, NOT_FOUND);
  }
  if (
    existingHousingArea.status !== HousingAreaStatus.approved &&
    existingHousingArea.status !== HousingAreaStatus.publish &&
    existingHousingArea.status !== HousingAreaStatus.unpublish
  ) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, INVALID_HOUSING_AREA);
  }
  // Check if the data contains any fields to update
  if (Object.keys(data).length === 0) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, "No fields to update");
  }
  if (existingHousingArea.pending_update) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      "Having pending update for this housing area",
    );
  }
  if (existingHousingArea.owner_id !== userId) {
    throw new RouteError(HttpStatusCodes.UNAUTHORIZED, UNAUTHORIZED);
  }

  const updatedHousingArea = await HousingAreaRepo.pushPendingUpdate(id, data);
  return updatedHousingArea;
}

async function approveUpdateHousingArea(
  id: string,
): Promise<HousingAreaDocument | null> {
  const existingHousingArea = await HousingAreaRepo.findOneById(id);
  if (!existingHousingArea) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, NOT_FOUND);
  }

  if (
    existingHousingArea.status !== HousingAreaStatus.approved &&
    existingHousingArea.status !== HousingAreaStatus.publish &&
    existingHousingArea.status !== HousingAreaStatus.unpublish
  ) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, INVALID_HOUSING_AREA);
  }
  if (!existingHousingArea.pending_update) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, NO_PENDING_UPDATE);
  }
  if (existingHousingArea.pending_update.legal_documents === null) {
    delete existingHousingArea.pending_update.legal_documents;
  }
  const updateFields = {
    ...existingHousingArea.toObject(),
    ...existingHousingArea.pending_update,
  } as IHousingArea;
  const updatedHousingArea = await HousingAreaRepo.updateAndUnsetPending(
    id,
    updateFields,
  );
  const owner = await UserRepo.getUserById(existingHousingArea.owner_id);
  if (owner?.email) {
    await sendHousingAreaUpdateApprovedMail(
      owner.email,
      owner.name,
      existingHousingArea.name,
    );
  }
  return updatedHousingArea;
}

async function rejectUpdateHousingArea(
  id: string,
  reason: string,
): Promise<HousingAreaDocument | null> {
  const existingHousingArea = await HousingAreaRepo.findOneById(id);

  if (!existingHousingArea) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, NOT_FOUND);
  }
  if (!existingHousingArea.pending_update) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, NO_PENDING_UPDATE);
  }
  if (
    existingHousingArea.status !== HousingAreaStatus.approved &&
    existingHousingArea.status !== HousingAreaStatus.publish &&
    existingHousingArea.status !== HousingAreaStatus.unpublish
  ) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, INVALID_HOUSING_AREA);
  }
  const updateFields = {
    reject_reason: reason,
  } as IHousingArea;
  delete updateFields.pending_update;
  const updatedHousingArea = await HousingAreaRepo.updateAndUnsetPending(
    id,
    updateFields,
  );
  const owner = await UserRepo.getUserById(existingHousingArea.owner_id);
  if (owner?.email) {
    await sendHousingAreaUpdateRejectedMail(
      owner.email,
      owner.name,
      existingHousingArea.name,
      reason,
    );
  }
  return updatedHousingArea;
}

async function deleteHousingArea(
  id: string,
  req: IReq,
): Promise<HousingAreaDocument | null> {
  const existingHousingArea = await HousingAreaRepo.findOneById(id);
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    throw new RouteError(HttpStatusCodes.UNAUTHORIZED, UNAUTHORIZED);
  }
  if (!existingHousingArea) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, NOT_FOUND);
  }
  if (existingHousingArea.owner_id !== userId) {
    throw new RouteError(HttpStatusCodes.UNAUTHORIZED, UNAUTHORIZED);
  }
  const occupiedRoom = await Room.findOne({
    housing_area_id: id,
    status: RoomStatus.occupied,
  });
  if (occupiedRoom) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      "Cannot delete housing area: There are rooms currently occupied.",
    );
  }
  const deletedHousingArea = await HousingAreaRepo.deleteHousingArea(id);
  return deletedHousingArea;
}

async function viewHousingAreaByUserId(
  status: HousingAreaStatus,
  userId: string,
): Promise<HousingAreaDocument[]> {
  if (!Object.values(HousingAreaStatus).includes(status)) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      "Invalid housing area status",
    );
  }
  const housingAreas = await HousingAreaRepo.findByStatusByUserId(
    status,
    userId,
  );
  return housingAreas;
}

async function addHousingAreaRate(
  id: string,
  userId: string,
  rateData: IRatingInput,
): Promise<HousingAreaDocument | null> {
  const existingHousingArea = await HousingAreaRepo.findOneById(id);
  if (!existingHousingArea) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, NOT_FOUND);
  }
  return await HousingAreaRepo.addHousingAreaRate(id, userId, rateData);
}
async function changeHousingAreaRateStatus(
  id: string,
  status: string,
  housingAreaId: string,
): Promise<HousingAreaDocument | null> {
  const existingHousingArea = await HousingAreaRepo.findOneById(housingAreaId);
  if (!existingHousingArea) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, NOT_FOUND);
  }
  return await HousingAreaRepo.changeHousingAreaRateStatus(
    id,
    housingAreaId,
    status,
  );
}
async function getAllRatingsByHousingId(
  housingId: string,
  status?: string,
  page = 1,
  pageSize = 10,
): Promise<any> {
  // make sure >= 1
  page = Math.max(1, page);
  pageSize = Math.max(1, pageSize);

  const pipeline: any[] = [
    { $match: { _id: new mongoose.Types.ObjectId(housingId) } },
    { $unwind: "$rating" },
  ];
  if (status) {
    pipeline.push({ $match: { "rating.status": status } });
  }
  pipeline.push({ $sort: { "rating.created_at": -1 } });
  const countPipeline = [...pipeline, { $count: "total" }];
  const countResult = await HousingArea.aggregate(countPipeline);
  const total = countResult.length > 0 ? countResult[0].total : 0;
  const totalPages = Math.ceil(total / pageSize);
  // Paping
  pipeline.push({ $skip: (page - 1) * pageSize });
  pipeline.push({ $limit: pageSize });
  pipeline.push({
    $group: {
      _id: "$_id",
      ratings: { $push: "$rating" },
    },
  });
  pipeline.push({
    $lookup: {
      from: "userdetails",
      localField: "ratings.user_id",
      foreignField: "user_id",
      as: "usersInfo",
    },
  });

  pipeline.push({
    $project: {
      ratings: {
        $map: {
          input: "$ratings",
          as: "rating",
          in: {
            _id: "$$rating._id",
            score: "$$rating.score",
            comment: "$$rating.comment",
            created_at: "$$rating.created_at",
            status: "$$rating.status",
            user_id: "$$rating.user_id",
            avatar_url: {
              $let: {
                vars: {
                  userDoc: {
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
                in: { $ifNull: ["$$userDoc.avatar_url", ""] },
              },
            },
            replies: {
              $map: {
                input: { $ifNull: ["$$rating.replies", []] },
                as: "reply",
                in: {
                  role: "$$reply.role",
                  content: "$$reply.content",
                  created_at: "$$reply.created_at",
                  user_id: "$$reply.user_id",
                  avatar_url: {
                    $let: {
                      vars: {
                        replyUserDoc: {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: "$usersInfo",
                                as: "user",
                                cond: {
                                  $eq: ["$$user.user_id", "$$reply.user_id"],
                                },
                              },
                            },
                            0,
                          ],
                        },
                      },
                      in: { $ifNull: ["$$replyUserDoc.avatar_url", ""] },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
  const result = await HousingArea.aggregate(pipeline);
  const ratings = result.length > 0 ? result[0].ratings : [];
  return {
    ratings,
    page,
    total,
    totalPages,
  };
}

async function replyToRating(
  housingAreaId: string,
  ratingId: string,
  role: string,
  content: string,
  userId: string,
) {
  const reply: IRatingReply = {
    role,
    content,
    created_at: new Date(),
    user_id: userId,
  };
  const result = await addRatingReply(housingAreaId, ratingId, reply);
  return result;
}

async function updateHousingAreaAdmin(
  id: string,
  data: Partial<IHousingAreaUpdate>,
): Promise<HousingAreaDocument | null> {
  const existingHousingArea = await HousingAreaRepo.findOneById(id);
  if (!existingHousingArea) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, NOT_FOUND);
  }
  if (
    existingHousingArea.status !== HousingAreaStatus.approved &&
    existingHousingArea.status !== HousingAreaStatus.publish &&
    existingHousingArea.status !== HousingAreaStatus.unpublish
  ) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, INVALID_HOUSING_AREA);
  }
  if (Object.keys(data).length === 0) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, "No fields to update");
  }
  const updatedHousingArea = await HousingAreaRepo.update(id, data);
  return updatedHousingArea;
}

async function deleteHousingAreaAdmin(
  id: string,
): Promise<HousingAreaDocument | null> {
  const existingHousingArea = await HousingAreaRepo.findOneById(id);
  if (!existingHousingArea) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, NOT_FOUND);
  }
  const occupiedRoom = await Room.findOne({
    housing_area_id: id,
    status: RoomStatus.occupied,
  });
  if (occupiedRoom) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      "Cannot delete housing area: There are rooms currently occupied.",
    );
  }
  const deletedHousingArea = await HousingAreaRepo.deleteHousingArea(id);
  return deletedHousingArea;
}

async function searchHousingArea(
  status: HousingAreaStatus,
  query: string,
  isPendingUpdate: boolean | string = false,
  page = 1,
  pageSize = 10,
): Promise<{
  results: any[],
  total: number,
  totalPages: number,
  page: number,
  pendingUpdate: boolean,
}> {
  if (typeof isPendingUpdate === "string") {
    isPendingUpdate = isPendingUpdate === "true";
  }

  page = Math.max(1, page);
  pageSize = Math.max(1, pageSize);

  const matchStage: any = {};

  if (query && query.trim().length > 0) {
    matchStage.$or = [
      { name: { $regex: query, $options: "i" } },
      { address: { $regex: query, $options: "i" } },
    ];
  }

  if (status && Object.values(HousingAreaStatus).includes(status)) {
    matchStage.status = status;
  } else {
    matchStage.status = { $ne: HousingAreaStatus.delete };
  }

  if (isPendingUpdate) {
    matchStage.pending_update = { $exists: true };
  } else {
    matchStage.pending_update = { $exists: false };
  }
  const total = await HousingArea.countDocuments(matchStage);
  const totalPages = Math.ceil(total / pageSize);

  const results = await HousingArea.aggregate([
    { $match: matchStage },
    { $skip: (page - 1) * pageSize },
    { $limit: pageSize },
  ]);

  const userIds = [...new Set(results.map((item) => item.owner_id))];

  const { data: users } = await supabase
    .from("users")
    .select("id, name, email, auth_user_id")
    .in("auth_user_id", userIds);

  const supabaseUserIds = (users ?? []).map((u) => u.auth_user_id);

  const userDetails = await UserDetailRepo.getAllByUserIds(supabaseUserIds);

  if (!userDetails) {
    throw new RouteError(
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to fetch user details",
    );
  }
  const detailMap = new Map(
    (userDetails ?? []).map((detail) => [String(detail.user_id), detail]),
  );

  const userMap = new Map(
    (users ?? []).map((user) => {
      const detail = detailMap.get(String(user.auth_user_id));
      const detailObj = detail?.toObject?.() ?? detail ?? {};

      const merged = {
        ...user,
        ...detailObj,
      };

      const {
        user_id, // eslint-disable-line @typescript-eslint/no-unused-vars
        _id, // eslint-disable-line @typescript-eslint/no-unused-vars
        ...sanitizedUser
      } = merged;
      return [user.auth_user_id, sanitizedUser];
    }),
  );
  // Gán user vào từng area
  const resultsWithUser = results.map((area) => ({
    ...area,
    user: userMap.get(area.owner_id) ?? null,
  }));

  return {
    results: resultsWithUser,
    page,
    total,
    totalPages,
    pendingUpdate: isPendingUpdate,
  };
}

async function markHousingAreaAsPaid(
  housingAreaId: string,
): Promise<HousingAreaDocument | null> {
  const existingHousingArea = await HousingAreaRepo.findOneById(housingAreaId);
  if (!existingHousingArea) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, NOT_FOUND);
  }

  if (existingHousingArea.isPaid) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      "This housing area is already marked as paid",
    );
  }
  const updatedHousingArea = await HousingAreaRepo.setIsPaidHousingArea(
    housingAreaId,
    true,
  );
  return updatedHousingArea;
}

export async function getTopHousingAreasWithRooms(topN = 10) {
  return await HousingAreaRepo.getTopHousingAreasWithRoomsRepo(topN);
}

/******************************************************************************
                                Export default
******************************************************************************/

export default {
  addOne,
  updatePending,
  approveHousingArea,
  rejectHousingArea,
  approveUpdateHousingArea,
  rejectUpdateHousingArea,
  pubLishHousingArea,
  unPubLishHousingArea,
  adminPublishHousingArea,
  adminUnPublishHousingArea,
  getHousingAreaById,
  resubmitHousingArea,
  deleteHousingArea,
  viewHousingAreaByUserId,
  addHousingAreaRate,
  changeHousingAreaRateStatus,
  getAllRatingsByHousingId,
  updateHousingAreaAdmin,
  deleteHousingAreaAdmin,
  replyToRating,
  searchHousingArea,
  markHousingAreaAsPaid,
  getTopHousingAreasWithRooms,
} as const;
