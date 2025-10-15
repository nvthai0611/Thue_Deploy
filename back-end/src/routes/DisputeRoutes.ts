import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import { getUserIdFromRequest } from "@src/common/util/authorization";
import { RouteError } from "@src/common/util/route-errors";
import Dispute from "@src/models/Dispute";
import { IReq, IRes } from "./common/types";
import { parseReq } from "./common/util";
import DisputeService from "@src/services/DisputeService";
import { sendSuccess } from "@src/common/util/response";
import { DisputeResolution, DisputeStatus } from "@src/common/constants";

/******************************************************************************
                                Constants
******************************************************************************/
const Validators = {
  addDispute: parseReq({
    dispute: Dispute.createDisputeTest,
  }),
  getListDisputeSearch: parseReq({
    page: (val: any): val is string =>
      val === undefined || (typeof val === "string" && !isNaN(Number(val))),
    limit: (val: any): val is string =>
      val === undefined || (typeof val === "string" && !isNaN(Number(val))),
    status: (val: any): val is string =>
      val === undefined ||
      (typeof val === "string" &&
        Object.values(DisputeStatus).includes(val as DisputeStatus)),
  }),
};
/******************************************************************************
                                Functions
******************************************************************************/
/**
 * @swagger
 * /api/disputes/add:
 *   post:
 *     summary: Tạo khiếu nại (dispute) cho hợp đồng
 *     tags: [Dispute]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDisputeRequest'
 *     responses:
 *       201:
 *         description: Tạo khiếu nại thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Dispute'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *        $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
const addDispute = async (req: IReq, res: IRes) => {
  const { dispute } = Validators.addDispute(req.body);
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    throw new RouteError(
      HttpStatusCodes.UNAUTHORIZED,
      "User ID not found in request",
    );
  }
  const disputeCreate = await DisputeService.createDispute(dispute, userId);
  sendSuccess(
    res,
    "Dispute created successfully",
    disputeCreate,
    HttpStatusCodes.OK,
  );
};

/**
 * @swagger
 * /api/disputes/detail/{disputeId}:
 *   get:
 *     summary: Lấy chi tiết một khiếu nại
 *     tags: [Dispute]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: disputeId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của khiếu nại
 *     responses:
 *       200:
 *         description: Lấy chi tiết khiếu nại thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Dispute'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
const getDisputeDetail = async (req: IReq, res: IRes) => {
  const disputeId = req.params.disputeId as string | undefined;
  if (!disputeId || typeof disputeId !== "string") {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, "Dispute ID is required");
  }
  const dispute = await DisputeService.getDisputeDetail(disputeId);
  if (!dispute) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, "Dispute not found");
  }
  sendSuccess(
    res,
    "Dispute retrieved successfully",
    dispute,
    HttpStatusCodes.OK,
  );
};
/**
 * @swagger
 * /api/disputes/get-by-contract/{contractId}:
 *   get:
 *     summary: Lấy danh sách khiếu nại theo hợp đồng
 *     description: Trả về tất cả các khiếu nại liên quan đến một hợp đồng cụ thể.
 *     tags:
 *       - Dispute
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contractId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của hợp đồng cần lấy khiếu nại
 *     responses:
 *       '200':
 *         description: Danh sách khiếu nại của hợp đồng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Disputes retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Dispute'
 *       '400':
 *         description: Thiếu hoặc sai contractId
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 */
const getDisputeByContractId = async (req: IReq, res: IRes) => {
  const contractId = req.params.contractId as string | undefined;
  if (!contractId || typeof contractId !== "string") {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      "Contract ID is required",
    );
  }
  const disputes = await DisputeService.getDisputeByContractId(contractId);
  sendSuccess(
    res,
    "Disputes retrieved successfully",
    disputes,
    HttpStatusCodes.OK,
  );
};
/**
 * @swagger
 * /api/disputes/get-list-search:
 *   get:
 *     summary: Admin - Lấy danh sách khiếu nại có phân trang và lọc theo trạng thái
 *     description: admin xem danh sách khiếu nại với tùy chọn phân trang và lọc theo trạng thái
 *     tags:
 *       - Dispute
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang hiện tại (pagination)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số bản ghi mỗi trang
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, resolved, rejected]
 *         description: Trạng thái của khiếu nại
 *     responses:
 *       '200':
 *         description: Danh sách khiếu nại được phân trang
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Disputes retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                       example: 35
 *                     totalPages:
 *                       type: number
 *                       example: 4
 *                     page:
 *                       type: number
 *                       example: 1
 *                     disputes:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/DisputeWithUser'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 */
const getListDisputeSearch = async (req: IReq, res: IRes) => {
  const { page, limit, status } = Validators.getListDisputeSearch(req.query);
  const disputes = await DisputeService.getListDisputeSearch(
    Number(page) || 1,
    Number(limit) || 10,
    status as DisputeStatus,
  );
  sendSuccess(
    res,
    "Disputes retrieved successfully",
    disputes,
    HttpStatusCodes.OK,
  );
};

/**
 * @swagger
 * /api/disputes/admin-handle-decision/{disputeId}:
 *   patch:
 *     summary: Admin xử lý kết quả khiếu nại (người khiếu nại thắng hoặc từ chối khiếu nại)
 *     tags: [Dispute]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: disputeId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của khiếu nại cần xử lý
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *               - decision
 *             properties:
 *               reason:
 *                 type: string
 *                 example: Người thuê cung cấp bằng chứng hợp lệ về lỗi vi phạm từ phía chủ trọ
 *                 description: Lý do admin đưa ra quyết định xử lý
 *               decision:
 *                 type: string
 *                 enum: [disputer_wins, rejected]
 *                 example: disputer_wins
 *                 description: Kết quả xử lý khiếu nại do admin đưa ra
 *     responses:
 *       200:
 *         description: Khiếu nại đã được xử lý thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Dispute resolved successfully
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
const adminHandleDispute = async (req: IReq, res: IRes) => {
  const disputeId = req.params.disputeId as string | undefined;
  if (!disputeId || typeof disputeId !== "string") {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, "Dispute ID is required");
  }
  const reason = req.body.reason as string | undefined;
  if (!reason || typeof reason !== "string") {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, "Reason is required");
  }
  const decision = req.body.decision as string | undefined;
  if (
    !decision ||
    typeof decision !== "string"
  ) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      "Decision is required and must be valid",
    );
  }
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    throw new RouteError(
      HttpStatusCodes.UNAUTHORIZED,
      "User ID not found in request",
    );
  }
  await DisputeService.adminHandleDisputeDecision(
    disputeId,
    reason,
    userId,
    decision as DisputeResolution,
  );
  sendSuccess(res, "Dispute resolved successfully", null, HttpStatusCodes.OK);
};

/******************************************************************************
                                Export default
******************************************************************************/

export default {
  addDispute,
  getDisputeDetail,
  getDisputeByContractId,
  getListDisputeSearch,
  adminHandleDispute,
} as const;
