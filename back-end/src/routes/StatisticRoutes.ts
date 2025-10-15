import logger from "jet-logger";
import { IReq, IRes } from "./common/types";
import { sendError, sendSuccess } from "@src/common/util/response";
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import StatisticService from "@src/services/StatisticService";
import { getUserIdFromRequest } from "@src/common/util/authorization";
import { RouteError } from "@src/common/util/route-errors";

/******************************************************************************
                                Constants
******************************************************************************/

/******************************************************************************
                                Functions
******************************************************************************/

/**
 * @swagger
 * /api/admin/statistics/housing-area:
 *   get:
 *     summary: Lấy thống kê housing area theo thời gian
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         required: true
 *         schema:
 *           type: string
 *           enum:
 *             - month
 *             - quarter
 *             - year
 *         description: Loại thống kê
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *           example: 2024
 *         description: Năm thống kê
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Tháng (bắt buộc khi period=month)
 *       - in: query
 *         name: quarter
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 4
 *         description: Quý (bắt buộc khi period=quarter)
 *     responses:
 *       200:
 *         description: Lấy thống kê housing area thành công
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
 *                   example: Newly created accommodation statistics for the
 *                 data:
 *                   type: object
 *                   properties:
 *                     period:
 *                       type: string
 *                       example: month
 *                     year:
 *                       type: integer
 *                       example: 2024
 *                     month:
 *                       type: integer
 *                       example: 12
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalCount:
 *                           type: integer
 *                           example: 25
 *                         statusBreakdown:
 *                           type: object
 *                           example: {"publish": 15, "pending": 8, "rejected": 2}
 *                         districtBreakdown:
 *                           type: object
 *                           example: {"Thạch Thất": 20, "Quốc Oai": 5}
 *                         averageExpectedRooms:
 *                           type: number
 *                           example: 12.5
 *                         paidCount:
 *                           type: integer
 *                           example: 20
 *                         unpaidCount:
 *                           type: integer
 *                           example: 5
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
async function housingArea(req: IReq, res: IRes) {
  const { period, year, month, quarter } = req.query as {
    period: "month" | "quarter" | "year",
    year: string,
    month?: string,
    quarter?: string,
  };

  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      throw new RouteError(
        HttpStatusCodes.UNAUTHORIZED,
        "User not authenticated",
      );
    }

    // Validate input
    if (!period || !["month", "quarter", "year"].includes(period)) {
      throw new RouteError(
        HttpStatusCodes.BAD_REQUEST,
        "Invalid statistics type. Must be 'month', 'quarter', or 'year'.",
      );
    }

    const currentYear = parseInt(year) || new Date().getFullYear();
    const currentMonth = month ? parseInt(month) : undefined;
    const currentQuarter = quarter ? parseInt(quarter) : undefined;

    const statistics = await StatisticService.getHousingAreaStatistics(
      period,
      currentYear,
      currentMonth,
      currentQuarter,
    );

    const periodText =
      period === "month" ? "month" : period === "quarter" ? "quarter" : "year";

    sendSuccess(
      res,
      `Newly created accommodation statistics for the selected ${periodText} ` +
        "retrieved successfully.",
      statistics,
      HttpStatusCodes.OK,
    );
  } catch (error) {
    logger.err(error);
    if (error instanceof RouteError) {
      sendError(res, error.message, error.status);
    } else if (error instanceof Error) {
      sendError(res, error.message, HttpStatusCodes.BAD_REQUEST);
    } else {
      sendError(
        res,
        "System error occurred while generating statistics.",
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

/**
 * @swagger
 * /api/admin/statistics/housing-area/overview:
 *   get:
 *     summary: Lấy thống kê tổng quan housing area theo năm
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *           example: 2024
 *         description: Năm thống kê
 *     responses:
 *       200:
 *         description: Lấy thống kê tổng quan housing area thành công
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
 *                   example: Housing area overview statistics retrieved successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     year:
 *                       type: integer
 *                       example: 2024
 *                     overview:
 *                       type: object
 *                       properties:
 *                         totalCount:
 *                           type: integer
 *                           example: 150
 *                         statusBreakdown:
 *                           type: object
 *                           example: {"publish": 120, "pending": 20, "rejected": 10}
 *                     monthlyBreakdown:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: integer
 *                             example: 1
 *                           count:
 *                             type: integer
 *                             example: 12
 *                     trends:
 *                       type: object
 *                       properties:
 *                         peakMonth:
 *                           type: object
 *                           properties:
 *                             month:
 *                               type: integer
 *                               example: 6
 *                             count:
 *                               type: integer
 *                               example: 25
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
async function housingAreaOverview(req: IReq, res: IRes) {
  const { year } = req.query as { year: string };

  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      throw new RouteError(
        HttpStatusCodes.UNAUTHORIZED,
        "User not authenticated",
      );
    }

    const currentYear = parseInt(year) || new Date().getFullYear();
    const overview = await StatisticService.getHousingAreaOverviewStatistics(
      currentYear,
    );

    sendSuccess(
      res,
      "Housing area overview statistics " + "retrieved successfully.",
      overview,
      HttpStatusCodes.OK,
    );
  } catch (error) {
    logger.err(error);
    if (error instanceof RouteError) {
      sendError(res, error.message, error.status);
    } else if (error instanceof Error) {
      sendError(res, error.message, HttpStatusCodes.BAD_REQUEST);
    } else {
      sendError(
        res,
        "System error occurred while generating housing area overview statistics.",
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

/**
 * @swagger
 * /api/admin/statistics/boost-revenue:
 *   get:
 *     summary: Lấy thống kê doanh thu boost theo thời gian
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         required: true
 *         schema:
 *           type: string
 *           enum:
 *             - month
 *             - quarter
 *             - year
 *         description: Loại thống kê
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *           example: 2024
 *         description: Năm thống kê
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Tháng (bắt buộc khi period=month)
 *       - in: query
 *         name: quarter
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 4
 *         description: Quý (bắt buộc khi period=quarter)
 *     responses:
 *       200:
 *         description: Lấy thống kê doanh thu boost thành công
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
 *                   example: Boost revenue statistics
 *                 data:
 *                   type: object
 *                   properties:
 *                     period:
 *                       type: string
 *                       example: month
 *                     year:
 *                       type: integer
 *                       example: 2024
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalBoosts:
 *                           type: integer
 *                           example: 45
 *                         totalRevenue:
 *                           type: integer
 *                           example: 4500000
 *                         averageRevenuePerBoost:
 *                           type: integer
 *                           example: 100000
 *                         uniqueRoomsWithBoost:
 *                           type: integer
 *                           example: 35
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
async function boostRevenue(req: IReq, res: IRes) {
  const { period, year, month, quarter } = req.query as {
    period: "month" | "quarter" | "year",
    year: string,
    month?: string,
    quarter?: string,
  };

  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      throw new RouteError(
        HttpStatusCodes.UNAUTHORIZED,
        "User not authenticated",
      );
    }

    if (!period || !["month", "quarter", "year"].includes(period)) {
      throw new RouteError(
        HttpStatusCodes.BAD_REQUEST,
        "Invalid statistics type. Must be 'month', 'quarter', or 'year'.",
      );
    }

    const currentYear = parseInt(year) || new Date().getFullYear();
    const currentMonth = month ? parseInt(month) : undefined;
    const currentQuarter = quarter ? parseInt(quarter) : undefined;

    const statistics = await StatisticService.getBoostRevenueStatistics(
      period,
      currentYear,
      currentMonth,
      currentQuarter,
    );

    const periodText =
      period === "month" ? "month" : period === "quarter" ? "quarter" : "year";

    sendSuccess(
      res,
      `Boost revenue statistics for the selected ${periodText} ` +
        "retrieved successfully.",
      statistics,
      HttpStatusCodes.OK,
    );
  } catch (error) {
    logger.err(error);
    if (error instanceof RouteError) {
      sendError(res, error.message, error.status);
    } else if (error instanceof Error) {
      sendError(res, error.message, HttpStatusCodes.BAD_REQUEST);
    } else {
      sendError(
        res,
        "System error occurred while generating boost revenue statistics.",
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

/**
 * @swagger
 * /api/admin/statistics/posting-revenue:
 *   get:
 *     summary: Lấy thống kê doanh thu đăng bài theo thời gian
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         required: true
 *         schema:
 *           type: string
 *           enum:
 *             - month
 *             - quarter
 *             - year
 *         description: Loại thống kê
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *           example: 2024
 *         description: Năm thống kê
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Tháng (bắt buộc khi period=month)
 *       - in: query
 *         name: quarter
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 4
 *         description: Quý (bắt buộc khi period=quarter)
 *     responses:
 *       200:
 *         description: Lấy thống kê doanh thu đăng bài thành công
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
 *                   example: Posting revenue statistics
 *                 data:
 *                   type: object
 *                   properties:
 *                     period:
 *                       type: string
 *                       example: month
 *                     year:
 *                       type: integer
 *                       example: 2024
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalPaidPosts:
 *                           type: integer
 *                           example: 80
 *                         totalRevenue:
 *                           type: integer
 *                           example: 4000000
 *                         averageRevenuePerPost:
 *                           type: integer
 *                           example: 50000
 *                         uniqueUsersWithPaidPosts:
 *                           type: integer
 *                           example: 65
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
async function postingRevenue(req: IReq, res: IRes) {
  const { period, year, month, quarter } = req.query as {
    period: "month" | "quarter" | "year",
    year: string,
    month?: string,
    quarter?: string,
  };

  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      throw new RouteError(
        HttpStatusCodes.UNAUTHORIZED,
        "User not authenticated",
      );
    }

    if (!period || !["month", "quarter", "year"].includes(period)) {
      throw new RouteError(
        HttpStatusCodes.BAD_REQUEST,
        "Invalid statistics type. Must be 'month', 'quarter', or 'year'.",
      );
    }

    const currentYear = parseInt(year) || new Date().getFullYear();
    const currentMonth = month ? parseInt(month) : undefined;
    const currentQuarter = quarter ? parseInt(quarter) : undefined;

    // ✅ SỬA LỖI: Gọi đúng service function
    const statistics = await StatisticService.getPostingRevenueStatistics(
      period,
      currentYear,
      currentMonth,
      currentQuarter,
    );

    const periodText =
      period === "month" ? "month" : period === "quarter" ? "quarter" : "year";

    sendSuccess(
      res,
      `Posting revenue statistics for the selected ${periodText} ` +
        "retrieved successfully.",
      statistics,
      HttpStatusCodes.OK,
    );
  } catch (error) {
    logger.err(error);
    if (error instanceof RouteError) {
      sendError(res, error.message, error.status);
    } else if (error instanceof Error) {
      sendError(res, error.message, HttpStatusCodes.BAD_REQUEST);
    } else {
      sendError(
        res,
        "System error occurred while generating posting revenue statistics.",
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

/**
 * @swagger
 * /api/admin/statistics/posting-revenue/overview:
 *   get:
 *     summary: Lấy thống kê tổng quan doanh thu đăng bài theo năm
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *           example: 2024
 *         description: Năm thống kê
 *     responses:
 *       200:
 *         description: Lấy thống kê tổng quan doanh thu đăng bài thành công
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
 *                   example: Posting revenue overview statistics retrieved successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     year:
 *                       type: integer
 *                       example: 2024
 *                     overview:
 *                       type: object
 *                       properties:
 *                         totalPaidPosts:
 *                           type: integer
 *                           example: 800
 *                         totalRevenue:
 *                           type: integer
 *                           example: 40000000
 *                     trends:
 *                       type: object
 *                       properties:
 *                         peakMonth:
 *                           type: object
 *                           properties:
 *                             month:
 *                               type: integer
 *                               example: 6
 *                             totalRevenue:
 *                               type: integer
 *                               example: 5000000
 *                         peakQuarter:
 *                           type: object
 *                           properties:
 *                             quarter:
 *                               type: integer
 *                               example: 2
 *                             totalRevenue:
 *                               type: integer
 *                               example: 12000000
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
async function postingRevenueOverview(req: IReq, res: IRes) {
  const { year } = req.query as { year: string };

  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      throw new RouteError(
        HttpStatusCodes.UNAUTHORIZED,
        "User not authenticated",
      );
    }

    const currentYear = parseInt(year) || new Date().getFullYear();
    const overview = await StatisticService.getPostingRevenueOverview(
      currentYear,
    );

    sendSuccess(
      res,
      "Posting revenue overview statistics " + "retrieved successfully.",
      overview,
      HttpStatusCodes.OK,
    );
  } catch (error) {
    logger.err(error);
    if (error instanceof RouteError) {
      sendError(res, error.message, error.status);
    } else if (error instanceof Error) {
      sendError(res, error.message, HttpStatusCodes.BAD_REQUEST);
    } else {
      sendError(
        res,
        "System error occurred while generating posting revenue overview statistics.",
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

/******************************************************************************
                                Export default
******************************************************************************/

export default {
  housingArea,
  housingAreaOverview,
  boostRevenue,
  postingRevenue,
  postingRevenueOverview,
} as const;
