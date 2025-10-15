import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import { RouteError } from "@src/common/util/route-errors";
import { UserDetailDocument } from "@src/models/mongoose/UserDetail";
import authRepository from "@src/repos/AuthRepo";

/******************************************************************************
                                Constants
******************************************************************************/

/******************************************************************************
                                Functions
******************************************************************************/
/**
 * Sign up a new user.
 */
async function signUp(userId: string): Promise<UserDetailDocument> {
  // Check if userId is provided
  if (!userId) {
    throw new RouteError(HttpStatusCodes.UNAUTHORIZED, "User ID is required");
  }

  return authRepository.signUp(userId); /*  */
}

/******************************************************************************
                                Export default
******************************************************************************/

export default {
  signUp,
} as const;
