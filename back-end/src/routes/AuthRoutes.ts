import authService from "@src/services/AuthService";
import logger from "jet-logger";
import { IReq, IRes } from "./common/types";
import { sendError, sendSuccess } from "@src/common/util/response";
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";

/******************************************************************************
                                Constants
******************************************************************************/

/******************************************************************************
                                Functions
******************************************************************************/

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Đăng ký người dùng mới
 *     description: Tạo tài khoản người dùng mới trong hệ thống sau khi
 *                  authentication thành công từ Supabase
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "07d0f7a1-eff8-4e8b-bc2e-6ebb873d7320"
 *                 description: ID của user từ Supabase Auth
 *     responses:
 *       '200':
 *         description: Đăng ký thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User registered successfully"
 *                 data:
 *                   $ref: '#/components/schemas/UserDetail'
 *       '400':
 *         description: Dữ liệu đầu vào không hợp lệ
 *       '401':
 *         description: Không có quyền truy cập
 *       '500':
 *         description: Lỗi máy chủ nội bộ
 */
async function signUp(req: IReq, res: IRes) {
  const { userId } = req.body as { userId: string };
  logger.info("Sign up route called");
  try {
    const userDetail = await authService.signUp(userId);
    sendSuccess(
      res,
      "User registered successfully",
      userDetail,
      HttpStatusCodes.OK,
    );
  } catch (error) {
    logger.err(error);
    if (error instanceof Error) {
      sendError(res, error.message, HttpStatusCodes.UNAUTHORIZED);
    } else {
      sendError(
        res,
        "Internal server error",
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

/******************************************************************************
                                Export default
******************************************************************************/

export default {
  signUp,
} as const;
