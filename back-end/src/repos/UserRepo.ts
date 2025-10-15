import { RoleEnum } from "@src/common/constants";
import { filterUndefined } from "@src/common/util/filter-undefined";
import { supabase } from "@src/common/util/supabase";
import userModel, { UserDocument } from "@src/models/mongoose/User";
import userDetailModel, {
  UserDetailDocument,
} from "@src/models/mongoose/UserDetail";
import { IUserCreate } from "@src/models/User";
import { IUserDetailUpdate } from "@src/models/UserDetail";
import logger from "jet-logger";

/******************************************************************************
                                Functions
******************************************************************************/
/**
 * Add one user.
 */
async function add(user: IUserCreate): Promise<UserDocument> {
  const createdUser = await userModel.create({
    name: user.name,
    email: user.email,
    role: RoleEnum.tenant, // Default role
    phone: user.phone || "",
  });
  return createdUser;
}

const getUserById = async (userId: string) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("auth_user_id", userId)
    .single(); 

  if (error) {
    throw new Error(`Failed to get user: ${error.message}`);
  }

  return data;
};

/**
 * Update user detail.
 */
async function updateUserDetail(
  userDetail: IUserDetailUpdate,
): Promise<UserDetailDocument | null> {
  logger.info("Update user detail repository called");
  logger.info(userDetail);
  const updateData = filterUndefined(userDetail);
  logger.info(updateData);
  const updatedUser = await userDetailModel.findOneAndUpdate(
    { user_id: userDetail.user_id },
    { $set: updateData },
    { new: true },
  );
  return updatedUser;
}

async function getAll() {
  return await userModel.find();
}

async function getOne(userId: string): Promise<UserDetailDocument | null> {
  return userDetailModel.findOne({ user_id: userId });
}

async function searchUsers(search?: string) {
  if (search) {
    return userModel.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    });
  }
  return userModel.find();
}

async function changeUserStatus(userId: string) {
  try {
    //get current status from supabase to async
    const { data: supabaseUser, error: supabaseError } = await supabase
      .from("users")
      .select("is_active")
      .eq("auth_user_id", userId)
      .single();
    
    if (supabaseError) {
      logger.err(`Failed to fetch user from Supabase: ${supabaseError.message}`);
      throw new Error(`Failed to fetch user from Supabase: ${supabaseError.message}`);
    }
    const mongoStatus = supabaseUser.is_active ? "active" : "inActive";
    
    const result = await userDetailModel.findOneAndUpdate(
      { user_id: userId },
      { 
        status: mongoStatus,
        updated_at: new Date(),
      },
      { 
        new: true, 
        upsert: true, 
        setDefaultsOnInsert: true,
      },
    );

    logger.info(`Updated MongoDB status for user ${userId}: ${mongoStatus}`);
    return result;
  } catch (error) {
    logger.err(`Error in changeUserStatus:
       ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

async function removePropertyDocument(userId: string, reason?: string) {
  try {
    logger.info(`Removing property_document for user: ${userId}, reason: ${reason}`);
    
    // Remove property_document from MongoDB UserDetail
    const result = await userDetailModel.findOneAndUpdate(
      { user_id: userId },
      { 
        $unset: { property_document: 1 },
        $set: { 
          rejection_reason: reason,
          rejection_date: new Date(),
        },
      },
      { new: true },
    );

    if (!result) {
      throw new Error(`User detail not found for user: ${userId}`);
    }

    logger.info(`Successfully removed property_document for user: ${userId}`);
    return result;
  } catch (error) {
    logger.err(`Error in removePropertyDocument:
       ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}
const getUserByUserId = async (userId: string) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data) {
    throw new Error(`Cannot find user with ID: ${userId}`);
  }

  return data;
};

/******************************************************************************
                                Export default
******************************************************************************/

export default {
  add,
  updateUserDetail,
  getAll,
  getOne,
  searchUsers,
  changeUserStatus,
  getUserById,
  getUserByUserId,
  removePropertyDocument,
} as const;
