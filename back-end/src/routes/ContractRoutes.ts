import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import { sendSuccess } from "@src/common/util/response";
import ContractService from "@src/services/ContractService";
import { IReq, IRes } from "./common/types";
import { parseReq } from "./common/util";
import { getUserIdFromRequest } from "@src/common/util/authorization";

/******************************************************************************
                                Constants
******************************************************************************/
const Validators = {
  addContract: parseReq({
    end_date: (v: unknown): v is string | Date =>
      typeof v === "string" || v instanceof Date,
  }),
  requestExtensionContract: parseReq({
    new_end_date: (v: unknown): v is string | Date =>
      typeof v === "string" || v instanceof Date,
  }),
};
/******************************************************************************
                                Functions
******************************************************************************/
/**
 * @swagger
 * /api/contracts/add/{roomId}:
 *   post:
 *     summary: Tenant tạo hợp đồng thuê phòng
 *     description: Cho phép người thuê tạo hợp đồng thuê phòng với ngày kết thúc.
 *     tags:
 *       - Contract
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         description: ID của phòng muốn thuê
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               end_date:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-12-31T00:00:00.000Z"
 *             required:
 *               - end_date
 *     responses:
 *       '201':
 *         description: Tạo hợp đồng thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contract'
 *       '400':
 *         $ref: '#/components/responses/BadRequestError'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         $ref: '#/components/responses/ForbiddenError'
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 */

const addContractByTenant = async (req: IReq, res: IRes): Promise<any> => {
  const roomId = req.params.roomId as string;
  const { end_date } = Validators.addContract(req.body);
  const endDateObj =
    typeof end_date === "string" ? new Date(end_date) : end_date;
  const newContract = await ContractService.addContractByTenant(
    roomId,
    endDateObj,
    req,
  );
  return sendSuccess(
    res,
    "Create Contract success",
    newContract,
    HttpStatusCodes.CREATED,
  );
};
/**
 * @swagger
 * /api/contracts/get-by-tenant:
 *   get:
 *     summary: Lấy danh sách hợp đồng theo người thuê
 *     description: Trả về tất cả các hợp đồng mà người dùng hiện tại là người thuê.
 *     tags:
 *       - Contract
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Danh sách hợp đồng của người thuê
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Contract'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 */
const getContractByTenant = async (req: IReq, res: IRes): Promise<any> => {
  const contract = await ContractService.getContractByTenant(req);
  return sendSuccess(res, "Get Contract success", contract, HttpStatusCodes.OK);
};
/**
 * @swagger
 * /api/contracts/get-by-owner:
 *   get:
 *     summary: Lấy danh sách hợp đồng theo chủ phòng
 *     description: Trả về tất cả các hợp đồng mà người dùng hiện tại là chủ phòng.
 *     tags:
 *       - Contract
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Danh sách hợp đồng của chủ phòng
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Contract'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 */
const getContractByOwner = async (req: IReq, res: IRes): Promise<any> => {
  const contract = await ContractService.getContractByOwner(req);
  return sendSuccess(
    res,
    "Get Contract by Owner success",
    contract,
    HttpStatusCodes.OK,
  );
};
/**
 * @swagger
 * /api/contracts/sign-by-landlord/{contractId}:
 *   patch:
 *     summary: Chủ trọ ký hợp đồng
 *     description: Cho phép chủ trọ ký hợp đồng dựa trên `contractId`. Yêu cầu xác thực token.
 *     tags:
 *       - Contract
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contractId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của hợp đồng cần ký
 *     responses:
 *       '200':
 *         description: Chủ trọ ký hợp đồng thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contract'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 *       '500':
 *         description: Lỗi máy chủ nội bộ
 */
const SignByLandlord = async (req: IReq, res: IRes): Promise<any> => {
  const contractId = req.params.contractId as string;
  const contract = await ContractService.SignByLandlord(contractId, req);
  return sendSuccess(
    res,
    "Sign Contract by Landlord success",
    contract,
    HttpStatusCodes.OK,
  );
};
/**
 * @swagger
 * /api/contracts/update-deposit-status/{contractId}:
 *   patch:
 *     summary: Cập nhật trạng thái đặt cọc
 *     description: Cập nhật trạng thái đặt cọc của hợp đồng theo contractId.
 *     tags:
 *       - Contract
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contractId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của hợp đồng cần cập nhật trạng thái đặt cọc
 *     responses:
 *       '200':
 *         description: Cập nhật trạng thái đặt cọc thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contract'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *        $ref: '#/components/responses/ForbiddenError'
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 *       '500':
 *         description: Lỗi máy chủ nội bộ
 */
const updateDepositStatus = async (req: IReq, res: IRes): Promise<any> => {
  const contractId = req.params.contractId as string;
  const contract = await ContractService.updateDepositStatus(contractId);
  return sendSuccess(
    res,
    "Update Deposit Status success",
    contract,
    HttpStatusCodes.OK,
  );
};
/**
 * @swagger
 * /api/contracts/get-by-id/{contractId}:
 *   get:
 *     summary: Lấy hợp đồng theo ID
 *     description: Trả về thông tin chi tiết của hợp đồng theo contractId.
 *     tags:
 *       - Contract
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contractId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của hợp đồng cần truy vấn
 *     responses:
 *       '200':
 *         description: Lấy hợp đồng thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contract'
 *       '400':
 *        $ref: '#/components/responses/BadRequestError'
 *       '500':
 *         description: Lỗi máy chủ nội bộ
 */
const getContractById = async (req: IReq, res: IRes): Promise<any> => {
  const contractId = req.params.contractId as string;
  const contract = await ContractService.getContractById(contractId);
  return sendSuccess(
    res,
    "Get Contract by ID success",
    contract,
    HttpStatusCodes.OK,
  );
};

/**
 * @swagger
 * /api/contracts/request-extension/{contractId}:
 *   patch:
 *     summary: Yêu cầu gia hạn hợp đồng
 *     description: Người thuê/Chủ trọ gửi yêu cầu gia hạn hợp đồng và cung cấp ngày kết thúc mới.
 *     tags:
 *       - Contract
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contractId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của hợp đồng cần yêu cầu gia hạn
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - new_end_date
 *             properties:
 *               new_end_date:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-07-31T00:00:00.000Z"
 *                 description: Ngày kết thúc mới mà người thuê muốn đề xuất
 *     responses:
 *       '200':
 *         description: Gửi yêu cầu gia hạn thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contract'
 *       '400':
 *         $ref: '#/components/responses/BadRequestError'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '500':
 *         description: Lỗi máy chủ nội bộ
 */
const requestExtensionContract = async (req: IReq, res: IRes): Promise<any> => {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return sendSuccess(res, "Unauthorized", null, HttpStatusCodes.UNAUTHORIZED);
  }
  const contractId = req.params.contractId as string;
  const { new_end_date } = Validators.requestExtensionContract(req.body);
  const newEndDateObj: Date =
    typeof new_end_date === "string" ? new Date(new_end_date) : new_end_date;
  const updatedContract = await ContractService.requestExtensionContract(
    contractId,
    newEndDateObj,
    userId,
  );
  return sendSuccess(
    res,
    "Request extension contract success",
    updatedContract,
    HttpStatusCodes.OK,
  );
};
/**
 * @swagger
 * /api/contracts/confirm-extension/{contractId}:
 *   patch:
 *     summary: Xác nhận gia hạn hợp đồng
 *     description: Chủ trọ hoặc người thuê gia đồng ý hạn hợp đồng sau khi gửi yêu cầu.
 *     tags:
 *       - Contract
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contractId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của hợp đồng cần xác nhận gia hạn
 *     responses:
 *       '200':
 *         description: Xác nhận gia hạn thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contract'
 *       '400':
 *         $ref: '#/components/responses/BadRequestError'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '403':
 *         $ref: '#/components/responses/ForbiddenError'
 *       '404':
 *         description: Không tìm thấy hợp đồng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Contract not found
 *                 statusCode:
 *                   type: integer
 *                   example: 404
 *       '500':
 *         description: Lỗi máy chủ nội bộ
 */
const confirmExtensionContract = async (req: IReq, res: IRes): Promise<any> => {
  const contractId = req.params.contractId as string;
  const updatedContract = await ContractService.confirmExtensionContract(
    contractId,req);
  return sendSuccess(
    res,
    "Confirm extension contract success",
    updatedContract,
    HttpStatusCodes.OK,
  );
};

/**
 * @swagger
 * /api/contracts/statistics-by-owner:
 *   get:
 *     summary: Get contract statistics by room for landlord
 *     description: Returns detailed statistics about contract counts by room and status.
 *     tags:
 *       - Contract
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Contract statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalContracts:
 *                   type: number
 *                   description: Total number of contracts
 *                 contractsByRoom:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       room_id:
 *                         type: string
 *                       room_title:
 *                         type: string
 *                       room_number:
 *                         type: string
 *                       housing_area_name:
 *                         type: string
 *                       contractCount:
 *                         type: number
 *                       contracts:
 *                         type: array
 *                         items:
 *                           type: object
 *                 contractsByStatus:
 *                   type: object
 *                   properties:
 *                     pending:
 *                       type: number
 *                     active:
 *                       type: number
 *                     expired:
 *                       type: number
 *                     terminated:
 *                       type: number
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '404':
 *         $ref: '#/components/responses/NotFoundError'
 */
const getContractStatisticsByOwner = async (req: IReq, res: IRes): Promise<any> => {
  const statistics = await ContractService.getContractStatisticsByOwner(req);
  return sendSuccess(
    res,
    "Get contract statistics success",
    statistics,
    HttpStatusCodes.OK,
  );
};

/******************************************************************************
                                Export default
******************************************************************************/

export default {
  addContractByTenant,
  getContractByTenant,
  getContractByOwner,
  getContractStatisticsByOwner,
  SignByLandlord,
  updateDepositStatus,
  getContractById,
  requestExtensionContract,
  confirmExtensionContract,
} as const;
