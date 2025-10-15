import { HousingAreaStatus } from "@src/common/constants";
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import { getUserIdFromRequest } from "@src/common/util/authorization";
import { sendSuccess, toHousingAreaResponse } from "@src/common/util/response";
import { RouteError } from "@src/common/util/route-errors";
import HousingArea from "@src/models/HousingArea";
import HousingAreaService from "@src/services/HousingAreaService";
import { IReq, IRes } from "./common/types";
import { parseReq } from "./common/util";
import { getTopHousingAreasWithRooms } from "@src/services/HousingAreaService";

/******************************************************************************
                                Constants
******************************************************************************/
const Validators = {
  addHousingArea: parseReq({ housingArea: HousingArea.testAdd }),
  updatePendingHousingArea: parseReq({
    pendingUpdate: HousingArea.testUpdateHousingArea,
  }),
  rejectHousingArea: parseReq({
    reason: (v: unknown) => v === undefined || typeof v === "string",
  }),
  resubmitHousingArea: parseReq({
    resubmit: HousingArea.testPartialAddHousingArea,
  }),
  viewHousingAreaByUserId: parseReq({
    status: (v: unknown): v is HousingAreaStatus =>
      typeof v === "string" &&
      Object.values(HousingAreaStatus).includes(v as HousingAreaStatus) &&
      v !== HousingAreaStatus.delete,
  }),
  addHousingRate: parseReq({
    score: (v: unknown): v is number =>
      typeof v === "number" && v >= 1 && v <= 5,
    comment: (v: unknown): v is string => typeof v === "string" && v.length > 0,
    status: (v: unknown): v is "pending" | "approved" | "rejected" =>
      typeof v === "string" && ["pending", "approved", "rejected"].includes(v),
  }),
  changeHousingAreaRateStatus: parseReq({
    status: (
      v: unknown,
    ): v is Exclude<HousingAreaStatus, HousingAreaStatus.delete> =>
      typeof v === "string" &&
      Object.values(HousingAreaStatus).includes(v as HousingAreaStatus) &&
      v !== HousingAreaStatus.delete,
  }),
  searchHousingArea: parseReq({
    search: (v: unknown): v is string =>
      v === undefined || (typeof v === "string" && v.trim().length > 0),
    page: (v: unknown): v is number =>
      v === undefined ||
      (typeof v === "number" && v > 0) ||
      (typeof v === "string" && /^\d+$/.test(v) && Number(v) > 0),
    pageSize: (v: unknown): v is number =>
      v === undefined ||
      (typeof v === "number" && v > 0) ||
      (typeof v === "string" && /^\d+$/.test(v) && Number(v) > 0),
    isPendingUpdate: (v: unknown): v is boolean =>
      v === undefined ||
      typeof v === "boolean" ||
      (typeof v === "string" && (v === "true" || v === "false")),
    status: (v: unknown): v is HousingAreaStatus =>
      v === undefined ||
      (typeof v === "string" &&
        Object.values(HousingAreaStatus).includes(v as HousingAreaStatus) &&
        v !== HousingAreaStatus.delete),
  }),
} as const;
/******************************************************************************
                                Functions
******************************************************************************/
/**
 * @swagger
 * /api/housing-areas/add:
 *   post:
 *     summary: Thêm khu nhà trọ mới
 *     tags:
 *       - HousingArea
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddHousingAreaRequest'
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *        $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
const addNewHousingArea = async (req: IReq, res: IRes): Promise<any> => {
  const { housingArea } = Validators.addHousingArea(req.body);
  const ownerId = getUserIdFromRequest(req);

  if (!ownerId) {
    throw new RouteError(
      HttpStatusCodes.UNAUTHORIZED,
      "User ID not found in request",
    );
  }

  housingArea.owner_id = ownerId;
  const result = await HousingAreaService.addOne(housingArea);

  return sendSuccess(
    res,
    "Housing area added successfully",
    toHousingAreaResponse(result),
    HttpStatusCodes.CREATED,
  );
};
/**
 * @swagger
 * /api/housing-areas/approve/{housingAreaId}:
 *   patch:
 *     summary: Duyệt khu nhà trọ
 *     tags: [HousingArea]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: housingAreaId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của khu nhà trọ cần duyệt
 *     responses:
 *       200:
 *         description: Duyệt thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HousingArea'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       400:
 *        $ref: '#/components/responses/BadRequestError'
 */
const approveHousingArea = async (req: IReq, res: IRes): Promise<any> => {
  const id = req.params.housingAreaId as string;
  const result = await HousingAreaService.approveHousingArea(id);

  if (!result) {
    throw new RouteError(
      HttpStatusCodes.NOT_FOUND,
      "Housing area not found or already approved",
    );
  }

  return sendSuccess(
    res,
    "Housing area approved successfully",
    toHousingAreaResponse(result),
    HttpStatusCodes.OK,
  );
};

/**
 * @swagger
 * /api/housing-areas/reject/{housingAreaId}:
 *   patch:
 *     summary: Từ chối khu nhà trọ
 *     tags: [HousingArea]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: housingAreaId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của khu nhà trọ cần từ chối
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: Thiếu giấy tờ hợp pháp
 *     responses:
 *       200:
 *         description: Từ chối thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HousingArea'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
const rejectHousingArea = async (req: IReq, res: IRes): Promise<any> => {
  const id = req.params.housingAreaId as string;
  const { reason } = Validators.rejectHousingArea(req.body);
  const result = await HousingAreaService.rejectHousingArea(id, reason ?? "");

  if (!result) {
    throw new RouteError(
      HttpStatusCodes.NOT_FOUND,
      "Housing area not found or already rejected",
    );
  }

  return sendSuccess(
    res,
    "Housing area rejected successfully",
    toHousingAreaResponse(result),
    HttpStatusCodes.OK,
  );
};
/**
 * @swagger
 * /api/housing-areas/resubmit/{housingAreaId}:
 *   patch:
 *     summary: Nộp lại khu nhà trọ sau khi bị từ chối
 *     tags: [HousingArea]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: housingAreaId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của khu nhà trọ cần nộp lại
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResubmitHousingAreaRequest'
 *     responses:
 *       200:
 *         description: Nộp lại thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HousingArea'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
const resubmitHousingArea = async (req: IReq, res: IRes): Promise<any> => {
  const id = req.params.housingAreaId as string;
  const { resubmit } = Validators.resubmitHousingArea(req.body);
  const getUserId = getUserIdFromRequest(req);

  if (!getUserId) {
    throw new RouteError(
      HttpStatusCodes.UNAUTHORIZED,
      "User ID not found in request",
    );
  }
  const result = await HousingAreaService.resubmitHousingArea(
    id,
    resubmit,
    getUserId,
  );

  if (!result) {
    throw new RouteError(
      HttpStatusCodes.NOT_FOUND,
      "Housing area not found or already resubmitted",
    );
  }

  return sendSuccess(
    res,
    "Housing area resubmitted successfully",
    toHousingAreaResponse(result),
    HttpStatusCodes.OK,
  );
};
/**
 * @swagger
 * /api/housing-areas/user-publish/{housingAreaId}:
 *   patch:
 *     summary: Đăng khu nhà trọ (publish)
 *     tags: [HousingArea]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: housingAreaId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của khu nhà trọ cần duyệt đăng
 *     responses:
 *       200:
 *         description: Đăng khu nhà trọ thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HousingArea'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       402:
 *        $ref: '#/components/responses/PaymentRequiredError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
const publishHousingArea = async (req: IReq, res: IRes): Promise<any> => {
  const id = req.params.housingAreaId as string;
  const getUserId = getUserIdFromRequest(req);
  if (!getUserId) {
    throw new RouteError(
      HttpStatusCodes.UNAUTHORIZED,
      "User ID not found in request",
    );
  }
  const result = await HousingAreaService.pubLishHousingArea(id, getUserId);

  if (!result) {
    throw new RouteError(
      HttpStatusCodes.NOT_FOUND,
      "Housing area not found or already published",
    );
  }

  return sendSuccess(
    res,
    "Housing area published successfully",
    toHousingAreaResponse(result),
    HttpStatusCodes.OK,
  );
};
/**
 * @swagger
 * /api/housing-areas/user-unpublish/{housingAreaId}:
 *   patch:
 *     summary: Gỡ đăng khu nhà trọ (unpublish)
 *     tags: [HousingArea]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: housingAreaId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của khu nhà trọ cần gỡ đăng
 *     responses:
 *       200:
 *         description: Gỡ đăng khu nhà trọ thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HousingArea'
 *       400:
 *        $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       402:
 *        $ref: '#/components/responses/PaymentRequiredError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
const unPubLishHousingArea = async (req: IReq, res: IRes): Promise<any> => {
  const id = req.params.housingAreaId as string;
  const getUserId = getUserIdFromRequest(req);
  if (!getUserId) {
    throw new RouteError(
      HttpStatusCodes.UNAUTHORIZED,
      "User ID not found in request",
    );
  }
  const result = await HousingAreaService.unPubLishHousingArea(id, getUserId);

  if (!result) {
    throw new RouteError(
      HttpStatusCodes.NOT_FOUND,
      "Housing area not found or already unpublished",
    );
  }

  return sendSuccess(
    res,
    "Housing area unpublished successfully",
    toHousingAreaResponse(result),
    HttpStatusCodes.OK,
  );
};
/**
 * @swagger
 * /api/housing-areas/admin-publish/{housingAreaId}:
 *   patch:
 *     summary: Admin duyệt và public khu nhà trọ
 *     tags: [HousingArea]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: housingAreaId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của khu nhà trọ
 *     responses:
 *       200:
 *         description: Public thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HousingArea'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
const adminPublishHousingArea = async (req: IReq, res: IRes): Promise<any> => {
  const id = req.params.housingAreaId as string;
  const result = await HousingAreaService.adminPublishHousingArea(id);

  if (!result) {
    throw new RouteError(
      HttpStatusCodes.NOT_FOUND,
      "Housing area not found or already published",
    );
  }

  return sendSuccess(
    res,
    "Housing area published successfully",
    toHousingAreaResponse(result),
    HttpStatusCodes.OK,
  );
};
/**
 * @swagger
 * /api/housing-areas/admin-unpublish/{housingAreaId}:
 *   patch:
 *     summary: Admin gỡ public khu nhà trọ
 *     tags: [HousingArea]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: housingAreaId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của khu nhà trọ
 *     responses:
 *       200:
 *         description: Unpublish thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HousingArea'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
const adminUnPublishHousingArea = async (
  req: IReq,
  res: IRes,
): Promise<any> => {
  const id = req.params.housingAreaId as string;
  const result = await HousingAreaService.adminUnPublishHousingArea(id);

  if (!result) {
    throw new RouteError(
      HttpStatusCodes.NOT_FOUND,
      "Housing area not found or already unpublished",
    );
  }

  return sendSuccess(
    res,
    "Housing area unpublished successfully",
    toHousingAreaResponse(result),
    HttpStatusCodes.OK,
  );
};
/**
 * @swagger
 * /api/housing-areas/detail/{housingAreaId}:
 *   get:
 *     summary: Lấy thông tin khu nhà trọ theo ID
 *     tags: [HousingArea]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: housingAreaId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của khu nhà trọ
 *     responses:
 *       200:
 *         description: Lấy thông tin thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HousingArea'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
const getHousingAreaById = async (req: IReq, res: IRes): Promise<any> => {
  const id = req.params.housingAreaId as string;
  const result = await HousingAreaService.getHousingAreaById(id);

  if (!result) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, "Housing area not found");
  }

  return sendSuccess(
    res,
    "Housing area retrieved successfully",
    toHousingAreaResponse(result),
    HttpStatusCodes.OK,
  );
};
/**
 * @swagger
 * /api/housing-areas/update-pending/{housingAreaId}:
 *   patch:
 *     summary: Gửi bản cập nhật chờ duyệt cho khu nhà trọ
 *     tags: [HousingArea]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: housingAreaId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của khu nhà trọ
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pendingUpdate:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: "Tôi yêu FPT"
 *     responses:
 *       200:
 *         description: Cập nhật chờ duyệt thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HousingArea'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *        $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 */
const updatePendingHousingArea = async (req: IReq, res: IRes): Promise<any> => {
  const id = req.params.housingAreaId as string;
  const getUserId = getUserIdFromRequest(req);

  if (!getUserId) {
    throw new RouteError(
      HttpStatusCodes.UNAUTHORIZED,
      "User ID not found in request",
    );
  }

  const { pendingUpdate } = Validators.updatePendingHousingArea(req.body);
  const result = await HousingAreaService.updatePending(
    pendingUpdate,
    id,
    getUserId,
  );

  if (!result) {
    throw new RouteError(
      HttpStatusCodes.NOT_FOUND,
      "Housing area not found or already updated",
    );
  }

  return sendSuccess(
    res,
    "Pending update for housing area submitted successfully",
    toHousingAreaResponse(result),
    HttpStatusCodes.OK,
  );
};
/**
 * @swagger
 * /api/housing-areas/approve-update/{housingAreaId}:
 *   patch:
 *     summary: Admin duyệt bản cập nhật của khu nhà trọ
 *     tags: [HousingArea]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: housingAreaId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của khu nhà trọ
 *     responses:
 *       200:
 *         description: Duyệt bản cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HousingArea'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
const approveUpdateHousingArea = async (req: IReq, res: IRes): Promise<any> => {
  // Lấy id từ query, pendingUpdate từ body
  const id = req.params.housingAreaId as string;
  const result = await HousingAreaService.approveUpdateHousingArea(id);

  if (!result) {
    throw new RouteError(
      HttpStatusCodes.NOT_FOUND,
      "Housing area not found or already approved",
    );
  }

  return sendSuccess(
    res,
    "Housing area update approved successfully",
    toHousingAreaResponse(result),
    HttpStatusCodes.OK,
  );
};
/**
 * @swagger
 * /api/housing-areas/reject-update/{housingAreaId}:
 *   patch:
 *     summary: Admin từ chối bản cập nhật khu nhà trọ
 *     tags: [HousingArea]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: housingAreaId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của khu nhà trọ
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "Thiếu giấy tờ pháp lý"
 *     responses:
 *       200:
 *         description: Từ chối cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HousingArea'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
const rejectUpdateHousingArea = async (req: IReq, res: IRes): Promise<any> => {
  const id = req.params.housingAreaId as string;
  const { reason } = Validators.rejectHousingArea(req.body);
  const result = await HousingAreaService.rejectUpdateHousingArea(
    id,
    reason ?? "",
  );

  if (!result) {
    throw new RouteError(
      HttpStatusCodes.NOT_FOUND,
      "Housing area not found or already rejected",
    );
  }

  return sendSuccess(
    res,
    "Housing area update rejected successfully",
    toHousingAreaResponse(result),
    HttpStatusCodes.OK,
  );
};
/**
 * @swagger
 * /api/housing-areas/delete/{housingAreaId}:
 *   delete:
 *     summary: Xóa khu nhà trọ
 *     tags: [HousingArea]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: housingAreaId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của khu nhà trọ
 *     responses:
 *       200:
 *         description: Xóa thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HousingArea'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
const deleteHousingArea = async (req: IReq, res: IRes): Promise<any> => {
  const id = req.params.housingAreaId as string;
  const result = await HousingAreaService.deleteHousingArea(id, req);
  if (!result) {
    throw new RouteError(
      HttpStatusCodes.NOT_FOUND,
      "Housing area not found or already deleted",
    );
  }
  return sendSuccess(
    res,
    "Housing area deleted successfully",
    toHousingAreaResponse(result),
    HttpStatusCodes.OK,
  );
};
/**
 * @swagger
 * /api/housing-areas/by-user:
 *   get:
 *     summary: Xem danh sách khu nhà trọ do người dùng tạo
 *     tags: [HousingArea]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, published, unpublished]
 *         required: false
 *         description: Lọc theo trạng thái khu nhà trọ
 *     responses:
 *       200:
 *         description: Lấy danh sách thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/HousingArea'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
const viewHousingAreaByUserId = async (req: IReq, res: IRes): Promise<any> => {
  const userId = getUserIdFromRequest(req);

  if (!userId) {
    throw new RouteError(
      HttpStatusCodes.UNAUTHORIZED,
      "User ID not found in request",
    );
  }

  const { status } = Validators.viewHousingAreaByUserId(req.query);
  const result = await HousingAreaService.viewHousingAreaByUserId(
    status,
    userId,
  );

  if (!result) {
    throw new RouteError(
      HttpStatusCodes.NOT_FOUND,
      "Housing areas not found for this user",
    );
  }

  return sendSuccess(
    res,
    "Housing areas retrieved successfully",
    result.map(toHousingAreaResponse),
    HttpStatusCodes.OK,
  );
};
/**
 * @swagger
 * /api/housing-areas/{housingAreaId}/rate:
 *   post:
 *     summary: Thêm đánh giá cho khu nhà trọ
 *     tags: [HousingArea]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: housingAreaId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của khu nhà trọ
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               score:
 *                 type: number
 *                 example: 5
 *               comment:
 *                 type: string
 *                 example: "Nhà đẹp, sạch sẽ"
 *     responses:
 *       200:
 *         description: Thêm đánh giá thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HousingAreaRating'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
const addHousingAreaRate = async (req: IReq, res: IRes): Promise<any> => {
  const id = req.params.housingAreaId as string;
  const rateData = Validators.addHousingRate(req.body);
  const userId = getUserIdFromRequest(req);

  if (!userId) {
    throw new RouteError(
      HttpStatusCodes.UNAUTHORIZED,
      "User ID not found in request",
    );
  }
  const rate = await HousingAreaService.addHousingAreaRate(
    id,
    userId,
    rateData,
  );
  return sendSuccess(
    res,
    "Add rate sucessfull",
    toHousingAreaResponse(rate),
    HttpStatusCodes.OK,
  );
};
/**
 * @swagger
 * /api/housing-areas/{housingAreaId}/rate/{id}/status:
 *   patch:
 *     summary: Thay đổi trạng thái đánh giá (duyệt hoặc từ chối)
 *     tags: [HousingArea]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: housingAreaId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của khu nhà trọ
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của đánh giá
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *                 example: approved
 *     responses:
 *       200:
 *         description: Thay đổi trạng thái thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HousingAreaRating'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
const changeHousingAreaRateStatus = async (
  req: IReq,
  res: IRes,
): Promise<any> => {
  const housingAreaId = req.params.housingAreaId as string;
  const id = req.params.id as string;
  const { status } = Validators.changeHousingAreaRateStatus(req.body) as {
    status: "approved" | "rejected",
  };
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    throw new RouteError(
      HttpStatusCodes.UNAUTHORIZED,
      "User ID not found in request",
    );
  }
  const rate = await HousingAreaService.changeHousingAreaRateStatus(
    id,
    status,
    housingAreaId,
  );
  return sendSuccess(
    res,
    "Change rate status successfully",
    toHousingAreaResponse(rate),
    HttpStatusCodes.OK,
  );
};
/**
 * @swagger
 * /api/housing-areas/{housingAreaId}/ratings:
 *   get:
 *     summary: Lấy danh sách đánh giá của khu nhà trọ
 *     tags: [HousingArea]
 *     parameters:
 *       - in: path
 *         name: housingAreaId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của khu nhà trọ
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *         description: Lọc theo trạng thái đánh giá (approved, pending, rejected)
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *         description: Trang hiện tại
 *       - in: query
 *         name: pageSize
 *         required: false
 *         schema:
 *           type: integer
 *         description: Số lượng đánh giá mỗi trang
 *     responses:
 *       200:
 *         description: Lấy danh sách đánh giá thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ratings:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/HousingAreaRating'
 *                 page:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
const getAllRatingsByHousingId = async (req: IReq, res: IRes): Promise<any> => {
  const housingId = req.params.housingAreaId as string;
  const status = req.query.status as string;
  const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
  const pageSize = req.query.pageSize
    ? parseInt(req.query.pageSize as string, 10)
    : 10;
  const allRate = await HousingAreaService.getAllRatingsByHousingId(
    housingId,
    status,
    page,
    pageSize,
  );
  return sendSuccess(res, "Get rates data successful!", allRate);
};
/**
 * @swagger
 * /api/housing-areas/update-admin/{housingAreaId}:
 *   patch:
 *     summary: Cập nhật thông tin khu nhà trọ admin
 *     tags: [HousingArea]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: housingAreaId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của khu nhà trọ
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pendingUpdate:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: "Tôi yêu FPT"
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HousingArea'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 */
const updateHousingAreaAdmin = async (req: IReq, res: IRes): Promise<any> => {
  const id = req.params.housingAreaId as string;
  const { pendingUpdate } = Validators.updatePendingHousingArea(req.body);
  const getUserId = getUserIdFromRequest(req);
  if (!getUserId) {
    throw new RouteError(
      HttpStatusCodes.UNAUTHORIZED,
      "User ID not found in request",
    );
  }
  const result = await HousingAreaService.updateHousingAreaAdmin(
    id,
    pendingUpdate,
  );
  if (!result) {
    throw new RouteError(
      HttpStatusCodes.NOT_FOUND,
      "Housing area not found or already updated",
    );
  }
  return sendSuccess(
    res,
    "Pending update for housing area submitted successfully",
    toHousingAreaResponse(result),
    HttpStatusCodes.OK,
  );
};
/**
 * @swagger
 * /api/housing-areas/delete-admin/{housingAreaId}:
 *   delete:
 *     summary: Xóa khu nhà trọ admin
 *     tags: [HousingArea]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: housingAreaId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của khu nhà trọ
 *     responses:
 *       200:
 *         description: Xóa thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HousingArea'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
const deleteHousingAreAdmin = async (req: IReq, res: IRes): Promise<any> => {
  const id = req.params.housingAreaId as string;

  const result = await HousingAreaService.deleteHousingAreaAdmin(id);
  if (!result) {
    throw new RouteError(
      HttpStatusCodes.NOT_FOUND,
      "Housing area not found or already deleted",
    );
  }
  return sendSuccess(
    res,
    "Housing area deleted successfully",
    toHousingAreaResponse(result),
    HttpStatusCodes.OK,
  );
};

/**
 * @swagger
 * /api/housing-areas/{housingAreaId}/ratings/{ratingId}/reply:
 *   post:
 *     summary: Trả lời một đánh giá của khu nhà trọ
 *     tags: [HousingArea]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: housingAreaId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của khu nhà trọ
 *       - in: path
 *         name: ratingId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của đánh giá
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 example: user
 *               content:
 *                 type: string
 *                 example: "Cảm ơn bạn đã đánh giá!"
 *     responses:
 *       200:
 *         description: Trả lời đánh giá thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/HousingAreaRating'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
const replyToRating = async (req: IReq, res: IRes): Promise<any> => {
  const housingAreaId = req.params.housingAreaId as string;
  const ratingId = req.params.ratingId as string;
  const { role, content } = req.body as { role: string, content: string };
  const userId = getUserIdFromRequest(req);

  // Debug logs

  if (!role || !content) {
    return res
      .status(400)
      .json({ success: false, message: "Missing role or content" });
  }
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  try {
    const result = await HousingAreaService.replyToRating(
      housingAreaId,
      ratingId,
      role,
      content,
      userId,
    );
    return res
      .status(200)
      .json({ success: true, message: "Reply successful", data: result });
  } catch (err: any) {
    return res.status(403).json({ success: false, message: err.message });
  }
};

/**
 * @swagger
 * /api/housing-areas/search:
 *   get:
 *     summary: Tìm kiếm danh sách khu nhà trọ
 *     tags: [HousingArea]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         required: false
 *         description: Trạng thái của khu nhà trọ
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Từ khóa tìm kiếm theo tên hoặc mô tả
 *       - in: query
 *         name: isPendingUpdate
 *         schema:
 *           type: boolean
 *         required: false
 *         description: Lọc các khu nhà trọ đang chờ cập nhật
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         required: false
 *         description: Số trang (mặc định là 1)
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *         required: false
 *         description: Số lượng phần tử mỗi trang (mặc định là 10)
 *     responses:
 *       200:
 *         description: Lấy danh sách khu nhà trọ thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Housing areas retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 42
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *                     results:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/HousingArea'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
const searchHousingArea = async (req: IReq, res: IRes): Promise<any> => {
  const { status, search, isPendingUpdate, page, pageSize } =
    Validators.searchHousingArea(req.query);
  const result = await HousingAreaService.searchHousingArea(
    status,
    search,
    isPendingUpdate,
    page,
    pageSize,
  );
  if (!result) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, "Housing areas not found");
  }
  return sendSuccess(
    res,
    "Housing areas retrieved successfully",
    {
      ...result,
      results: result.results.map(toHousingAreaResponse),
    },
    HttpStatusCodes.OK,
  );
};

/**
 * @swagger
 * /api/housing-areas/top-rated-with-rooms:
 *   get:
 *     summary: Lấy top N khu nhà trọ có rating cao nhất kèm danh sách phòng
 *     tags: [HousingArea]
 *     parameters:
 *       - in: query
 *         name: topN
 *         schema:
 *           type: integer
 *         description: Số lượng khu nhà trọ muốn lấy (default 10)
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   address:
 *                     type: string
 *                   avgRating:
 *                     type: number
 *                   rooms:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         title:
 *                           type: string
 *                         price:
 *                           type: number
 *                         area:
 *                           type: number
 *                         images:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               url:
 *                                 type: string
 *                               caption:
 *                                 type: string
 *                               uploaded_at:
 *                                 type: string
 *                                 format: date-time
 *                         type:
 *                           type: string
 *                         max_occupancy:
 *                           type: number
 */
const getTopHousingAreasWithRoomsHandler = async (req: IReq, res: IRes): Promise<any> => {
  const topN = Number(req.query.topN) || 10;
  const result = await getTopHousingAreasWithRooms(topN);
  res.json(result);
};

/******************************************************************************
                                Export default
******************************************************************************/

/**
 * @swagger
 * components:
 *   schemas:
 *     HousingAreaRating:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         user_id:
 *           type: string
 *         score:
 *           type: number
 *         comment:
 *           type: string
 *         status:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         avatar_url:
 *           type: string
 *         replies:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Reply'
 *     Reply:
 *       type: object
 *       properties:
 *         role:
 *           type: string
 *         content:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         user_id:
 *           type: string
 *         avatar_url:
 *           type: string
 */

export default {
  addNewHousingArea,
  updatePendingHousingArea,
  approveHousingArea,
  rejectHousingArea,
  approveUpdateHousingArea,
  rejectUpdateHousingArea,
  publishHousingArea,
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
  deleteHousingAreAdmin,
  replyToRating,
  searchHousingArea,
  getTopHousingAreasWithRooms: getTopHousingAreasWithRoomsHandler,
} as const;
