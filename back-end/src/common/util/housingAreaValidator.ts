import { HousingAreaDocument } from "@src/models/mongoose/HousingArea";
import { UserDetailDocument } from "@src/models/mongoose/UserDetail";
import UserDetailRepo from "@src/repos/UserDetailRepo";
import { RouteError } from "./route-errors";
import HttpStatusCodes from "../constants/HttpStatusCodes";
import { HousingAreaStatus } from "../constants";

export async function checkUserCanPostHousingArea(
  existingHousingArea: HousingAreaDocument,
  userId: string,
) {
  const userDetail: UserDetailDocument | null =
    await UserDetailRepo.getUserDetailById(userId);
  if (!userDetail) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, "User detail not found");
  }
  if (!userDetail.hasPostedBefore) {
    await UserDetailRepo.changePostedBeforeStatus(userId);
  } else {
    if (!existingHousingArea.isPaid) {
      throw new RouteError(
        HttpStatusCodes.PAYMENT_REQUIRED,
        "You can only post one housing area for free. Please make a payment to continue",
      );
    }
  }
}

export function validateUnpublishStatusChange(
  housingArea: HousingAreaDocument,
) {
  if (
    housingArea.status !== HousingAreaStatus.approved &&
    housingArea.status !== HousingAreaStatus.publish
  ) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      "Only published housing areas can be unpublished",
    );
  }

  if (housingArea.admin_unpublished) {
    throw new RouteError(
      HttpStatusCodes.FORBIDDEN,
      "This housing area was unpublished by admin and cannot be published by owner.",
    );
  }
}

export function validatePublishStatusChange(housingArea: HousingAreaDocument) {
  if (
    housingArea.status !== HousingAreaStatus.approved &&
    housingArea.status !== HousingAreaStatus.unpublish
  ) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      "Only approved and unpublish housing areas can be published",
    );
  }
  if (housingArea.admin_unpublished) {
    throw new RouteError(
      HttpStatusCodes.FORBIDDEN,
      "This housing area was unpublished by admin and cannot be published by owner.",
    );
  }
}

