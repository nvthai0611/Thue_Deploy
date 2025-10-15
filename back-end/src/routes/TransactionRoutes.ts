import Transaction from "@src/models/Transaction";
import { parseReq } from "./common/util";
import { IReq, IRes } from "./common/types";
import TransactionService from "@src/services/TransactionService";
import { sendSuccess } from "@src/common/util/response";
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import { getUserIdFromRequest } from "@src/common/util/authorization";

/******************************************************************************
                                Constants
******************************************************************************/
const Validators = {
  addTransaction: parseReq({
    transaction: Transaction.testAddTransactionReq,
  }),
};
/******************************************************************************
                                Functions
******************************************************************************/
/**
 * @swagger
 * /api/transactions/add:
 *   post:
 *     summary: Thêm giao dịch mới
 *     description: Thêm một transaction thuộc loại deposit hoặc service
 *     tags:
 *       - Transaction
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               transaction:
 *                 oneOf:
 *                   - $ref: '#/components/schemas/DepositTransaction'
 *                   - $ref: '#/components/schemas/ServiceTransaction'
 *           example:
 *             transaction:
 *               type: service
 *               zalo_payment:
 *                 app_id: 2554
 *                 app_trans_id: "5"
 *                 app_time: 666
 *                 app_user: "user123"
 *                 amount: 1234
 *                 channel: 1234
 *               notes: "Thanh toán dịch vụ nước"
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
const addTransaction = async (req: IReq, res: IRes): Promise<any> => {
  const { transaction } = Validators.addTransaction(req.body);
  const result = await TransactionService.addTransaction(transaction);
  return sendSuccess(
    res,
    "Transaction added successfully",
    result,
    HttpStatusCodes.CREATED,
  );
};

/**
 * Get transaction history of user
 */
/**
 * @swagger
 * /api/transactions/history:
 *   get:
 *     summary: Lấy danh sách giao dịch của người dùng
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang muốn lấy (bắt đầu từ 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng giao dịch trên mỗi trang
 *     responses:
 *       200:
 *         description: Lấy danh sách giao dịch thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Get transaction successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 20
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 2
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

async function getTransaction(req: IReq, res: IRes) {
  const userId = getUserIdFromRequest(req);

  if (!userId) {
    res.status(HttpStatusCodes.UNAUTHORIZED).json({
      message: "User not authenticated",
    });
    return;
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const result = await TransactionService.getTransaction(userId, page, limit);

  res.status(HttpStatusCodes.OK).json({
    message: "Get transaction successfully",
    data: result.data,
    pagination: {
      total: result.total,
      page,
      totalPages: result.totalPages,
    },
  });
}

/******************************************************************************
                                Export default
******************************************************************************/

export default {
  addTransaction,
  getTransaction,
} as const;
