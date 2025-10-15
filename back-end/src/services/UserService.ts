import { supabase } from "@src/common/util/supabase";
import { UserDocument } from "@src/models/mongoose/User";
import { UserDetailDocument } from "@src/models/mongoose/UserDetail";
import { IUserCreate } from "@src/models/User";
import { IUserDetailUpdate } from "@src/models/UserDetail";
import {
  default as UserRepo,
  default as userRepository,
} from "@src/repos/UserRepo";

/******************************************************************************
                                Constants
******************************************************************************/

export const USER_NOT_FOUND_ERR = "User not found";

/******************************************************************************
                                Functions
******************************************************************************/

/**
 * Add one user.
 */
function addOne(user: IUserCreate): Promise<UserDocument> {
  return userRepository.add(user);
}

/*
 * Get one user.
 */
export const getUserById = async (userId: string) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("auth_user_id", userId)
    .single();

  if (error || !data) {
    throw new Error(`Không tìm thấy user với id: ${userId}`);
  }

  return data;
};

async function getOne(userId: string): Promise<UserDetailDocument | null> {
  return await userRepository.getOne(userId);
}


/**
 * Update user detail.
 */
function updateUserDetail(
  userDetail: IUserDetailUpdate,
): Promise<UserDetailDocument | null> {
  return userRepository.updateUserDetail(userDetail);
}

async function getAll() {
  return UserRepo.getAll();
}

/**
 * Search users by name or email with property_document
 */
async function searchUsers(search?: string) {
  return UserRepo.searchUsers(search);
}

async function changeUserStatus(userId: string) {
  return UserRepo.changeUserStatus(userId);
}

/**
 * Remove property_document from user (reject landlord application)
 */
async function removePropertyDocument(userId: string, reason?: string) {
  return UserRepo.removePropertyDocument(userId, reason);
}

/******************************************************************************
                                Export default
******************************************************************************/

export default {
  addOne,
  updateUserDetail,
  getAll,
  getUserById,
  searchUsers,
  changeUserStatus,
  getOne,
  removePropertyDocument,
  
} as const;
