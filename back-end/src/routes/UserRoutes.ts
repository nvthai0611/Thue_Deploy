import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import { getUserIdFromRequest } from "@src/common/util/authorization";
import User from "@src/models/User";
import UserDetail from "@src/models/UserDetail";
import userService from "@src/services/UserService";
import logger from "jet-logger";
import { IReq, IRes } from "./common/types";
import { parseReq } from "./common/util";
import { sendSuccess } from "@src/common/util/response";
import UserDetailService from "@src/services/UserDetailService";
/******************************************************************************
                                Constants
******************************************************************************/

const Validators = {
  add: parseReq({ user: User.testUserCreate }),
  createUserDetail: parseReq({ userDetail: UserDetail.testUserDetailCreate }),
  updateUserDetail: parseReq({ userDetail: UserDetail.testUserDetailUpdate }),
} as const;

/******************************************************************************
                                Functions
******************************************************************************/

/**
 * @swagger
 * /api/users/test:
 *   get:
 *     summary: Test route
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Test message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Hello world
 */
function testHello(req: IReq, res: IRes) {
  res.status(200).json({ message: "Hello world" });
}

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Add a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user]
 *             properties:
 *               user:
 *                 type: object
 *                 required: [name, email, phone]
 *                 properties:
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   phone:
 *                     type: string
 *     responses:
 *       201:
 *         description: User added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User added successfully
 */
async function add(req: IReq, res: IRes) {
  const { user } = Validators.add(req.body);
  await userService.addOne(user);
  res.status(HttpStatusCodes.CREATED).json({
    message: "User added successfully",
  });
}

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
async function getAll(req: IReq, res: IRes) {
  const users = await userService.getAll();
  res.status(200).json(users);
}

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userDetail]
 *             properties:
 *               userDetail:
 *                 type: object
 *     responses:
 *       200:
 *         description: User detail updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User detail updated successfully
 *                 data:
 *                   type: object
 *       401:
 *         description: User not authenticated
 */
async function update(req: IReq, res: IRes) {
  const userId = getUserIdFromRequest(req);

  if (!userId) {
    res.status(HttpStatusCodes.UNAUTHORIZED).json({
      message: "User not authenticated",
    });
    return;
  }

  const { userDetail } = Validators.updateUserDetail(req.body);
  // Set user_id from authenticated user

  userDetail.user_id = userId;

  // Call userService to update user detail
  const updatedUserDetail = await userService.updateUserDetail(userDetail);
  //console.log(updatedUserDetail);

  res.status(HttpStatusCodes.OK).json({
    message: "User detail updated successfully",
    data: updatedUserDetail,
  });
}

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user detail by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User detail retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User detail retrieved successfully
 *                 data:
 *                   type: object
 */
async function getOne(req: IReq, res: IRes) {
  logger.info("Get one user detail called");
  const userDetail = await userService.getOne(String(req.params.id));

  res.status(HttpStatusCodes.OK).json({
    message: "User detail retrieved successfully",
    data: userDetail,
  });
}
/**
 * @swagger
 * /api/users/search:
 *   get:
 *     summary: Search users
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */

async function getSearchList(req: IReq, res: IRes) {
  const search = req.query.search as string;
  const users = await userService.searchUsers(search);
  res.status(200).json(users);
}
/**
 * @swagger
 * /api/users/{id}/status:
 *   patch:
 *     summary: Change user status
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       201:
 *         description: User status changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */

async function changeUserStatus(req: IReq, res: IRes) {
  const userId = req.params.id as string;
  const userUpdated = await userService.changeUserStatus(userId);
  res.status(201).json(userUpdated);
}
/**
 * @swagger
 * /api/users/update-chat/{chatId}:
 *   patch:
 *     summary: Cập nhật danh sách người đã chat của người dùng hiện tại
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của người dùng muốn lưu vào danh sách đã chat
 *     responses:
 *       200:
 *         description: Cập nhật thành công
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
 *                   example: Chat updated successfully

 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Không tìm thấy thông tin người dùng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: User detail not found
 *                 code:
 *                   type: integer
 *                   example: 404
 */
async function updateChat(req: IReq, res: IRes) {
  const userId = getUserIdFromRequest(req);
  const chatId = req.params.chatId as string;
  if (!userId) {
    res.status(HttpStatusCodes.UNAUTHORIZED).json({
      message: "User not authenticated",
    });
    return;
  }
  const updatedUserDetail = await UserDetailService.updateChatWithUser(
    userId,
    chatId,
  );
  if (!updatedUserDetail) {
    res.status(HttpStatusCodes.NOT_FOUND).json({
      message: "User detail not found",
    });
    return;
  }
  sendSuccess(res, "Chat updated successfully", updatedUserDetail);
}
/**
 * Remove property_document from user (reject landlord application)
 * @swagger
 * /api/users/{userId}/property-document:
 *   delete:
 *     summary: Remove property_document from user (reject landlord application)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for rejection
 *     responses:
 *       200:
 *         description: Property document removed successfully
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
 *                   example: Property document removed successfully
 *       404:
 *         description: User not found
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
async function removePropertyDocument(req: IReq, res: IRes) {
  try {
    const userId = req.params.userId as string;
    const { reason } = req.body as { reason?: string };

    const result = await userService.removePropertyDocument(userId, reason);

    sendSuccess(res, "Property document removed successfully", result);
  } catch (error) {
    logger.err("Error in removePropertyDocument:", error);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to remove property document",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/******************************************************************************
                                Export default
******************************************************************************/

export default {
  add,
  update,
  testHello,
  getAll,
  getOne,
  getSearchList,
  changeUserStatus,
  updateChat,
  removePropertyDocument,
} as const;
