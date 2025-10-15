import { UserDetailDocument } from "@src/models/mongoose/UserDetail";
import userDetailModel from "@src/models/mongoose/UserDetail";

/******************************************************************************
                                Functions
******************************************************************************/

/**
 * Sign up a new user.
 */
async function signUp(userId: string): Promise<UserDetailDocument> {
  const createdUserDetail = await userDetailModel.create({
    user_id: userId,
    status: "active",
    verified: false,
  });
  return createdUserDetail;
}

/******************************************************************************
                                Export default
******************************************************************************/

export default {
  signUp,
} as const;
