import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import { sendSuccess, toRoomResponse } from "@src/common/util/response";
import Room from "@src/models/Room";
import RoomService from "@src/services/RoomService";
import { IReq, IRes } from "./common/types";
import { parseReq } from "./common/util";
import { SearchParams } from "@src/common/constants";
import {
  parseCriteria,
  QueryParams,
} from "@src/common/util/parseValueFromQuery";
import { RouteError } from "@src/common/util/route-errors";
import RoomRepo from "@src/repos/RoomRepo";
import { getUserIdFromRequest } from "@src/common/util/authorization";

/******************************************************************************
                                Constants
******************************************************************************/
const Validators = {
  addRoom: parseReq({ room: Room.testAddRoom }),
  updateRoom: parseReq({
    room: Room.testUpdateRoom,
  }),
} as const;
/******************************************************************************
                                Functions
******************************************************************************/
/**
 * @swagger
 * /api/rooms/add-many:
 *   post:
 *     summary: Thêm nhiều phòng vào khu nhà trọ
 *     tags: [Room]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               room:
 *                 $ref: '#/components/schemas/AddRoomRequest'
 *     responses:
 *       201:
 *         description: Thêm phòng thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Room'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
async function addRoom(req: IReq, res: IRes): Promise<any> {
  const { room } = Validators.addRoom(req.body);
  const result = await RoomService.addMany(room, req);
  return sendSuccess(
    res,
    "Rooms added successfully",
    result.map(toRoomResponse), // Convert each room to the response format
    HttpStatusCodes.CREATED,
  );
}
/**
 * @swagger
 * /api/rooms/update/{roomId}:
 *   patch:
 *     summary: Cập nhật thông tin phòng trọ
 *     tags: [Room]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của phòng trọ
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               room:
 *                 $ref: '#/components/schemas/UpdateRoomRequest'
 *     responses:
 *       200:
 *         description: Cập nhật phòng thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Room'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
async function updateRoom(req: IReq, res: IRes): Promise<any> {
  const roomId = req.params.roomId as string;
  const { room } = Validators.updateRoom(req.body);
  const result = await RoomService.updateRoom(roomId, room, req);
  return sendSuccess(
    res,
    "Room updated successfully",
    result,
    HttpStatusCodes.OK,
  );
}
/**
 * @swagger
 * /api/rooms/{roomId}:
 *   delete:
 *     summary: Xoá phòng trọ
 *     tags: [Room]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của phòng trọ cần xoá
 *     responses:
 *       200:
 *         description: Xoá phòng thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Room'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
async function deleteRoom(req: IReq, res: IRes): Promise<any> {
  const roomId = req.params.roomId as string;
  const result = await RoomService.deleteRoom(roomId, req);
  return sendSuccess(
    res,
    "Room deleted successfully",
    result,
    HttpStatusCodes.OK,
  );
}

/**
 * @swagger
 * /api/rooms/search:
 *   get:
 *     summary: Tìm kiếm danh sách phòng
 *     tags: [Room]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang muốn lấy
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng phòng trên mỗi trang
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Giá tối thiểu
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Giá tối đa
 *       - in: query
 *         name: minArea
 *         schema:
 *           type: number
 *         description: Diện tích tối thiểu (m²)
 *       - in: query
 *         name: maxArea
 *         schema:
 *           type: number
 *         description: Diện tích tối đa (m²)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum:
 *             - SINGLE
 *             - COUPLE
 *         description: Loại phòng
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum:
 *             - available
 *             - booked
 *             - unavailable
 *         description: Trạng thái phòng
 *       - in: query
 *         name: maxOccupancy
 *         schema:
 *           type: integer
 *         description: Số người tối đa
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Tiêu đề phòng (tìm kiếm mờ)
 *       - in: query
 *         name: facilities
 *         schema:
 *           type: string
 *           example: "1,2,3"
 *         description: Danh sách mã tiện nghi (ngăn cách bằng dấu phẩy)
 *     responses:
 *       200:
 *         description: Danh sách phòng được trả về thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Rooms retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Room'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 100
 *                     totalPages:
 *                       type: integer
 *                       example: 10
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

async function searchRooms(req: IReq, res: IRes): Promise<any> {
  const searchParamsArray = Object.values(SearchParams) as string[];
  const query: QueryParams = req.query;
  const queryParams = Object.keys(query);
  const invalidParams = queryParams.filter(
    (param) => !searchParamsArray.includes(param),
  );

  if (invalidParams.length > 0) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      `Invalid parameter: ${invalidParams.join(", ")}`,
    );
  }

  const criteria = parseCriteria(query);
  const [rooms, total] = await Promise.all([
    RoomService.searchRooms(criteria),
    RoomRepo.countRooms(criteria),
  ]);

  const roomEachPage = criteria.limit;

  const totalPages = Math.ceil(total / (roomEachPage ?? 10));

  if (rooms.length === 0) {
    return res.status(HttpStatusCodes.NOT_FOUND).json({
      status: HttpStatusCodes.NOT_FOUND,
      message: "No rooms found matching the search criteria",
      pagination: {
        page: criteria.page,
        limit: criteria.limit,
        total,
        totalPages,
      },
    });
  }

  res.json({
    status: HttpStatusCodes.OK,
    message: "Rooms retrieved successfully",
    data: rooms,
    pagination: {
      page: criteria.page,
      limit: criteria.limit,
      total,
      totalPages,
    },
  });
}
/**
 * @swagger
 * /api/rooms/by-housing-area/{housingAreaId}:
 *   get:
 *     summary: Lấy danh sách phòng theo ID khu nhà trọ
 *     tags: [Room]
 *     parameters:
 *       - in: path
 *         name: housingAreaId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của khu nhà trọ
 *     responses:
 *       200:
 *         description: Lấy danh sách phòng thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Room'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
async function getListRoomByHousingAreaId(req: IReq, res: IRes): Promise<any> {
  const housingAreaId = req.params.housingAreaId as string;
  const result = await RoomService.getListRoomByHousingAreaId(housingAreaId);
  return sendSuccess(
    res,
    "Rooms retrieved successfully",
    result,
    HttpStatusCodes.OK,
  );
}
/**
 * @swagger
 * /api/rooms/detail/{roomId}:
 *   get:
 *     summary: Lấy chi tiết phòng theo roomId
 *     tags: [Room]
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của phòng cần lấy
 *     responses:
 *       200:
 *         description: Lấy chi tiết phòng thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Room'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
const getRoomDetailByRoomId = async (req: IReq, res: IRes): Promise<any> => {
  const roomId = req.params.roomId as string;
  const result = await RoomService.getDetailRoomById(roomId);
  if (!result) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, "Room not found");
  }
  return sendSuccess(res, "Room detail retrieved successfully", result);
};
/**
 * @swagger
 * /api/rooms/get-boosting-rooms:
 *   get:
 *     summary: Lấy danh sách phòng đang được boosting
 *     description: Trả về tất cả các phòng đang có trạng thái boosting (quảng cáo đẩy tin).
 *     tags:
 *       - Room
 *     responses:
 *       200:
 *         description: Danh sách phòng boosting được lấy thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Rooms with boosting retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 60c72b2f9b1d4c001c8d4f8a
 *                       room_number:
 *                         type: string
 *                         example: A101
 *                       boost_status:
 *                         type: boolean
 *                         example: true
 *                       boost_start_at:
 *                         type: string
 *                         format: date-time
 *                         example: 2025-06-25T00:00:00.000Z
 *                       boost_end_at:
 *                         type: string
 *                         format: date-time
 *                         example: 2025-06-28T00:00:00.000Z
 *                 status:
 *                   type: number
 *                   example: 200
 *       500:
 *         description: Lỗi máy chủ
 */
const getRoomsHaveBoosting = async (req: IReq, res: IRes): Promise<any> => {
  const result = await RoomRepo.getRoomsHaveBoosting();
  return sendSuccess(
    res,
    "Rooms with boosting retrieved successfully",
    result,
    HttpStatusCodes.OK,
  );
};

/**
 * @swagger
 * /api/rooms/get-list-saved-rooms:
 *   get:
 *     summary: Lấy danh sách phòng đã lưu
 *     tags: [Room]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách phòng đã lưu được trả về thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Saved rooms retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Room'
 */
const getListSavedRooms = async (req: IReq, res: IRes): Promise<any> => {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    throw new RouteError(
      HttpStatusCodes.UNAUTHORIZED,
      "User not authenticated",
    );
  }
  const result = await RoomService.getListSavedRooms(userId);
  return sendSuccess(
    res,
    "Saved rooms retrieved successfully",
    result,
    HttpStatusCodes.OK,
  );
};

/**
 * @swagger
 * /api/rooms/add-saved-room/{roomId}:
 *   post:
 *     summary: Thêm phòng vào danh sách đã lưu
 *     tags: [Room]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của phòng cần lưu
 *     responses:
 *       200:
 *         description: Phòng đã được thêm vào danh sách đã lưu thành công
 */
const addSavedRoom = async (req: IReq, res: IRes): Promise<any> => {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    throw new RouteError(
      HttpStatusCodes.UNAUTHORIZED,
      "User not authenticated",
    );
  }
  const { roomId } = req.params;
  if (!roomId || typeof roomId !== "string") {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      "Room ID is required and must be a string",
    );
  }
  const result = await RoomService.addSavedRoom(userId, roomId);
  return sendSuccess(
    res,
    "Room added to saved rooms successfully",
    result,
    HttpStatusCodes.OK,
  );
};

/**
 * @swagger
 * /api/rooms/delete-room-saved/{roomId}:
 *   delete:
 *     summary: Xoá phòng khỏi danh sách đã lưu
 *     tags: [Room]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của phòng cần xoá khỏi danh sách đã lưu
 *     responses:
 *       200:
 *         description: Phòng đã được xoá khỏi danh sách đã lưu thành công
 */
const deleteRoomSaved = async (req: IReq, res: IRes): Promise<any> => {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    throw new RouteError(
      HttpStatusCodes.UNAUTHORIZED,
      "User not authenticated",
    );
  }
  const roomId = req.params.roomId as string;
  const result = await RoomService.removeSavedRoom(userId, roomId);
  return sendSuccess(
    res,
    "Room removed from saved rooms successfully",
    result,
    HttpStatusCodes.OK,
  );
};
/******************************************************************************
                                Export default
******************************************************************************/

export default {
  addRoom,
  updateRoom,
  searchRooms,
  getListRoomByHousingAreaId,
  deleteRoom,
  getRoomDetailByRoomId,
  getRoomsHaveBoosting,
  addSavedRoom,
  getListSavedRooms,
  deleteRoomSaved,
} as const;
