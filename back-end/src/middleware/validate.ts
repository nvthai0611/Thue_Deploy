import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import { getUserIdFromRequest } from "@src/common/util/authorization";
import { RouteError } from "@src/common/util/route-errors";
import UserDetailRepo from "@src/repos/UserDetailRepo";
import { IReq, IRes } from "@src/routes/common/types";
import { NextFunction } from "express";
import mongoose from "mongoose";

export function validateObjectId(paramName: string) {
  return (req: IReq, res: IRes, next: NextFunction) => {
    const id = req.params[paramName];
    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return next(
        new RouteError(HttpStatusCodes.BAD_REQUEST, `Invalid ${paramName}`),
      );
    }
    next();
  };
}

export const  checkUserVerified = async (
  req: IReq,
  res: IRes,
  next: NextFunction,
) => {
  const userId = getUserIdFromRequest(req);  
  if (!userId) {
    return next(
      new RouteError(HttpStatusCodes.UNAUTHORIZED, "User not authenticated"),
    );
  }
  const getUserDetail = await UserDetailRepo.getUserDetailById(userId);
  if (!getUserDetail) {
    return next(
      new RouteError(HttpStatusCodes.NOT_FOUND, "User detail not found"),
    );
  }
  if (!getUserDetail.verified) {
    return next(
      new RouteError(
        HttpStatusCodes.FORBIDDEN,
        "User is not verified, please verify your account",
      ),
    );
  }
  next();
};

