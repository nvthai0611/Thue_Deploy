import UserDetail, {
  UserDetailDocument,
} from "@src/models/mongoose/UserDetail";

/******************************************************************************
                                Functions
******************************************************************************/
/**
 * find one userDetail.
 */
async function findOneUserDetail(
  userId: string,
): Promise<UserDetailDocument | null> {
  const UserDetails = await UserDetail.findOne({ user_id: userId });
  return UserDetails;
}
async function changePostedBeforeStatus(
  userId: string,
): Promise<UserDetailDocument | null> {
  return await UserDetail.findOneAndUpdate(
    { user_id: userId },
    { $set: { hasPostedBefore: true } },
    { new: true },
  );
}
async function updateChatWithUser(
  userId: string,
  chatId: string,
): Promise<UserDetailDocument | null> {
  return await UserDetail.findOneAndUpdate(
    { user_id: userId },
    { $addToSet: { chat_with: chatId } },
    { new: true },
  );
}
async function getUserDetailById(
  userId: string,
): Promise<UserDetailDocument | null> {
  return await UserDetail.findOne({ user_id: userId });
}
async function getAllByUserIds(
  userIds: string[],
): Promise<UserDetailDocument[]> {
  if (!userIds?.length) return [];

  const result = await UserDetail.find({ user_id: { $in: userIds } })
    .select("user_id avatar_url")
    .lean<UserDetailDocument[]>();
  return result;
}
/******************************************************************************
                                Export default
******************************************************************************/

export default {
  findOneUserDetail,
  changePostedBeforeStatus,
  updateChatWithUser,
  getUserDetailById,
  getAllByUserIds,
} as const;
