import HousingAreaRepo from "@src/repos/HousingAreaRepo";
import RoomRepo from "@src/repos/RoomRepo";
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import { RouteError } from "@src/common/util/route-errors";

/**
 * Get newly created housing areas statistics by month, quarter, or year
 */
async function getHousingAreaStatistics(
  period: "month" | "quarter" | "year",
  year: number,
  month?: number,
  quarter?: number,
) {
  let startDate: Date;
  let endDate: Date;

  switch (period) {
  case "month": {
    if (!month || month < 1 || month > 12) {
      throw new RouteError(
        HttpStatusCodes.BAD_REQUEST,
        "Invalid month. Must be between 1 and 12.",
      );
    }
    startDate = new Date(year, month - 1, 1);
    endDate = new Date(year, month, 0, 23, 59, 59, 999);
    break;
  }

  case "quarter": {
    if (!quarter || quarter < 1 || quarter > 4) {
      throw new RouteError(
        HttpStatusCodes.BAD_REQUEST,
        "Invalid quarter. Must be between 1 and 4.",
      );
    }
    const quarterStartMonth = (quarter - 1) * 3;
    startDate = new Date(year, quarterStartMonth, 1);
    endDate = new Date(year, quarterStartMonth + 3, 0, 23, 59, 59, 999);
    break;
  }

  case "year": {
    startDate = new Date(year, 0, 1);
    endDate = new Date(year, 11, 31, 23, 59, 59, 999);
    break;
  }

  default:
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      "Invalid period. Must be 'month', 'quarter', or 'year'.",
    );
  }

  // Get housing areas within the selected time range
  const housingAreas = await HousingAreaRepo.getHousingAreasByDateRange(
    startDate,
    endDate,
  );

  // Group by status
  const statusStats = housingAreas.reduce<Record<string, number>>(
    (acc, area) => {
      acc[area.status] = (acc[area.status] ?? 0) + 1;
      return acc;
    },
    {},
  );

  // Group by district
  const districtStats = housingAreas.reduce<Record<string, number>>(
    (acc, area) => {
      const district = area.location.district;
      acc[district] = (acc[district] ?? 0) + 1;
      return acc;
    },
    {},
  );

  return {
    period,
    year,
    ...(period === "month" && { month }),
    ...(period === "quarter" && { quarter }),
    dateRange: {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    },
    summary: {
      totalCount: housingAreas.length,
      statusBreakdown: statusStats,
      districtBreakdown: districtStats,
      averageExpectedRooms:
        housingAreas.length > 0
          ? Math.round(
            (housingAreas.reduce(
              (sum, area) => sum + area.expected_rooms,
              0,
            ) /
                housingAreas.length) *
                100,
          ) / 100
          : 0,
      paidCount: housingAreas.filter((area) => area.isPaid).length,
      unpaidCount: housingAreas.filter((area) => !area.isPaid).length,
    },
    housingAreas: housingAreas.map((area) => ({
      name: area.name,
      owner_id: area.owner_id,
      location: {
        address: area.location.address,
        district: area.location.district,
        city: area.location.city,
      },
      status: area.status,
      expected_rooms: area.expected_rooms,
      isPaid: area.isPaid ?? false,
      view_count: area.view_count,
      rating_count: area.rating?.length ?? 0,
      average_rating:
        area.rating && area.rating.length > 0
          ? Math.round(
            (area.rating.reduce((sum, r) => sum + r.score, 0) /
                area.rating.length) *
                100,
          ) / 100
          : 0,
      createdAt: area.createdAt,
      admin_unpublished: area.admin_unpublished,
    })),
  };
}

/**
 * Get yearly overview including monthly and quarterly statistics
 */
async function getHousingAreaOverviewStatistics(year: number) {
  const yearlyStats = await getHousingAreaStatistics("year", year);

  // Monthly statistics
  const monthlyStats = [];
  for (let month = 1; month <= 12; month++) {
    const monthStats = await getHousingAreaStatistics("month", year, month);
    monthlyStats.push({
      month,
      count: monthStats.summary.totalCount,
      statusBreakdown: monthStats.summary.statusBreakdown,
    });
  }

  // Quarterly statistics
  const quarterlyStats = [];
  for (let quarter = 1; quarter <= 4; quarter++) {
    const quarterStats = await getHousingAreaStatistics(
      "quarter",
      year,
      undefined,
      quarter,
    );
    quarterlyStats.push({
      quarter,
      count: quarterStats.summary.totalCount,
      statusBreakdown: quarterStats.summary.statusBreakdown,
    });
  }

  return {
    year,
    overview: yearlyStats.summary,
    monthlyBreakdown: monthlyStats,
    quarterlyBreakdown: quarterlyStats,
    trends: {
      peakMonth: monthlyStats.reduce(
        (max, current) => (current.count > max.count ? current : max),
        monthlyStats[0],
      ),
      peakQuarter: quarterlyStats.reduce(
        (max, current) => (current.count > max.count ? current : max),
        quarterlyStats[0],
      ),
    },
  };
}

/**
 * Lấy thống kê doanh thu boost theo thời gian
 */
async function getBoostRevenueStatistics(
  period: "month" | "quarter" | "year",
  year: number,
  month?: number,
  quarter?: number,
) {
  let startDate: Date;
  let endDate: Date;

  switch (period) {
  case "month": {
    if (!month || month < 1 || month > 12) {
      throw new RouteError(
        HttpStatusCodes.BAD_REQUEST,
        "Invalid month. Must be between 1 and 12.",
      );
    }
    startDate = new Date(year, month - 1, 1);
    endDate = new Date(year, month, 0, 23, 59, 59, 999);
    break;
  }
  case "quarter": {
    if (!quarter || quarter < 1 || quarter > 4) {
      throw new RouteError(
        HttpStatusCodes.BAD_REQUEST,
        "Invalid quarter. Must be between 1 and 4.",
      );
    }
    const quarterStartMonth = (quarter - 1) * 3;
    startDate = new Date(year, quarterStartMonth, 1);
    endDate = new Date(year, quarterStartMonth + 3, 0, 23, 59, 59, 999);
    break;
  }
  case "year": {
    startDate = new Date(year, 0, 1);
    endDate = new Date(year, 11, 31, 23, 59, 59, 999);
    break;
  }
  default:
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      "Invalid period. Must be 'month', 'quarter', or 'year'.",
    );
  }

  // Lấy thống kê boost
  const boostByHousingArea = await RoomRepo.getBoostStatsByHousingArea(
    startDate,
    endDate,
  );

  const BOOST_PRICE = 100000; // 100k per boost

  const totalBoosts = boostByHousingArea.reduce(
    (sum, area) => sum + area.total_boosts,
    0,
  );
  const totalRevenue = totalBoosts * BOOST_PRICE;
  const uniqueRoomsCount = boostByHousingArea.reduce(
    (sum, area) => sum + area.unique_rooms_count,
    0,
  );

  // Thống kê theo owner
  const ownerStats = boostByHousingArea.reduce<Record<string, any>>(
    (acc, item) => {
      const ownerId = String(item?.owner_id ?? "");
      acc[ownerId] ??= {
        owner_id: ownerId,
        total_boosts: 0,
        total_revenue: 0,
        housing_areas_count: 0,
      };
      acc[ownerId].total_boosts += item.total_boosts;
      acc[ownerId].total_revenue += item.total_revenue;
      acc[ownerId].housing_areas_count += 1;
      return acc;
    },
    {},
  );

  return {
    period,
    year,
    ...(period === "month" && { month }),
    ...(period === "quarter" && { quarter }),
    dateRange: {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    },
    summary: {
      totalBoosts,
      totalRevenue,
      averageRevenuePerBoost: BOOST_PRICE,
      uniqueRoomsWithBoost: uniqueRoomsCount,
      uniqueHousingAreasWithBoost: boostByHousingArea.length,
      topHousingAreas: boostByHousingArea.slice(0, 10),
    },
    breakdown: {
      byHousingArea: boostByHousingArea,
      byOwner: Object.values(ownerStats).sort(
        (a: any, b: any) => b.total_revenue - a.total_revenue,
      ),
    },
  };
}

/**
 * Lấy thống kê doanh thu đăng bài theo thời gian
 */
async function getPostingRevenueStatistics(
  period: "month" | "quarter" | "year",
  year: number,
  month?: number,
  quarter?: number,
) {
  let startDate: Date;
  let endDate: Date;

  switch (period) {
  case "month":
    if (!month || month < 1 || month > 12) {
      throw new RouteError(
        HttpStatusCodes.BAD_REQUEST,
        "Invalid month. Must be between 1 and 12.",
      );
    }
    startDate = new Date(year, month - 1, 1);
    endDate = new Date(year, month, 0, 23, 59, 59, 999);
    break;

  case "quarter": {
    if (!quarter || quarter < 1 || quarter > 4) {
      throw new RouteError(
        HttpStatusCodes.BAD_REQUEST,
        "Invalid quarter. Must be between 1 and 4.",
      );
    }
    const quarterStartMonth = (quarter - 1) * 3;
    startDate = new Date(year, quarterStartMonth, 1);
    endDate = new Date(year, quarterStartMonth + 3, 0, 23, 59, 59, 999);
    break;
  }

  case "year": {
    startDate = new Date(year, 0, 1);
    endDate = new Date(year, 11, 31, 23, 59, 59, 999);
    break;
  }

  default:
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      "Invalid period. Must be 'month', 'quarter', or 'year'.",
    );
  }

  // Lấy thống kê tổng quan
  const overallStats = await HousingAreaRepo.getPostingRevenueStats(
    startDate,
    endDate,
  );

  // Lấy thống kê theo user
  const userStats =
    await HousingAreaRepo.countPaidHousingAreasByUserAndDateRange(
      startDate,
      endDate,
    );

  // Lấy danh sách housing areas đã thanh toán
  const paidHousingAreas = await HousingAreaRepo.getPaidHousingAreasByDateRange(
    startDate,
    endDate,
  );

  const POSTING_PRICE = 50000; // 50k per post

  // Xử lý status breakdown
  const statusBreakdown = (overallStats.statusBreakdown as string[]).reduce(
    (acc: Record<string, number>, status: string) => {
      acc[status] = (acc[status] ?? 0) + 1;
      return acc;
    },
    {},
  );

  // Xử lý district breakdown
  const districtBreakdown = (overallStats.districtBreakdown as string[]).reduce(
    (acc: Record<string, number>, district: string) => {
      acc[district] = (acc[district] ?? 0) + 1;
      return acc;
    },
    {},
  );

  return {
    period,
    year,
    ...(period === "month" && { month }),
    ...(period === "quarter" && { quarter }),
    dateRange: {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    },
    summary: {
      totalPaidPosts: overallStats.totalPaidPosts,
      totalRevenue: overallStats.totalRevenue,
      averageRevenuePerPost: POSTING_PRICE,
      uniqueUsersWithPaidPosts: overallStats.uniqueUsersCount,
      statusBreakdown,
      districtBreakdown,
      topUsers: userStats.slice(0, 10),
    },
    breakdown: {
      byUser: userStats,
      paidHousingAreas: paidHousingAreas.map((area) => ({
        id: area._id,
        name: area.name,
        owner_id: area.owner_id,
        location: area.location,
        status: area.status,
        expected_rooms: area.expected_rooms,
        createdAt: area.createdAt,
        revenue: POSTING_PRICE,
      })),
    },
  };
}

/**
 * Thống kê tổng quan doanh thu đăng bài theo năm
 */
async function getPostingRevenueOverview(year: number) {
  const yearlyStats = await getPostingRevenueStatistics("year", year);

  // Thống kê theo từng tháng trong năm
  const monthlyStats = [];
  for (let month = 1; month <= 12; month++) {
    const monthStats = await getPostingRevenueStatistics("month", year, month);
    monthlyStats.push({
      month,
      totalPaidPosts: monthStats.summary.totalPaidPosts,
      totalRevenue: monthStats.summary.totalRevenue,
      uniqueUsers: monthStats.summary.uniqueUsersWithPaidPosts,
    });
  }

  // Thống kê theo từng quý
  const quarterlyStats = [];
  for (let quarter = 1; quarter <= 4; quarter++) {
    const quarterStats = await getPostingRevenueStatistics(
      "quarter",
      year,
      undefined,
      quarter,
    );
    quarterlyStats.push({
      quarter,
      totalPaidPosts: quarterStats.summary.totalPaidPosts,
      totalRevenue: quarterStats.summary.totalRevenue,
      uniqueUsers: quarterStats.summary.uniqueUsersWithPaidPosts,
    });
  }

  return {
    year,
    overview: yearlyStats.summary,
    monthlyBreakdown: monthlyStats,
    quarterlyBreakdown: quarterlyStats,
    trends: {
      peakMonth: monthlyStats.reduce(
        (max, current) =>
          current.totalRevenue > max.totalRevenue ? current : max,
        monthlyStats[0],
      ),
      peakQuarter: quarterlyStats.reduce(
        (max, current) =>
          current.totalRevenue > max.totalRevenue ? current : max,
        quarterlyStats[0],
      ),
    },
  };
}

/******************************************************************************
                                Export Default
******************************************************************************/

export default {
  getHousingAreaStatistics,
  getHousingAreaOverviewStatistics,
  getBoostRevenueStatistics,
  getPostingRevenueStatistics,
  getPostingRevenueOverview,
} as const;
