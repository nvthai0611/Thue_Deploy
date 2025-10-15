import { useQuery } from "@tanstack/react-query";
import fetchWithAuth from "@/utils/api/fetchWithAuth";

interface StatisticsParams {
  period: "month" | "quarter" | "year";
  year: number;
  month?: number;
  quarter?: number;
}

interface StatisticsData {
  period: string;
  year: number;
  month?: number;
  quarter?: number;
  summary: {
    totalCount: number;
    statusBreakdown: Record<string, number>;
    districtBreakdown: Record<string, number>;
    averageExpectedRooms: number;
    paidCount: number;
    unpaidCount: number;
  };
  housingAreas: any[];
}

interface OverviewData {
  year: number;
  overview: {
    totalCount: number;
    statusBreakdown: Record<string, number>;
    districtBreakdown: Record<string, number>;
  };
  monthlyBreakdown: Array<{
    month: number;
    count: number;
    statusBreakdown: Record<string, number>;
  }>;
  quarterlyBreakdown: Array<{
    quarter: number;
    count: number;
    statusBreakdown: Record<string, number>;
  }>;
}

interface BoostRevenueData {
  period: string;
  year: number;
  month?: number;
  quarter?: number;
  summary: {
    totalBoosts: number;
    totalRevenue: number;
    averageRevenuePerBoost: number;
    uniqueRoomsWithBoost: number;
    uniqueHousingAreasWithBoost: number;
    topHousingAreas: any[];
  };
  breakdown: {
    byHousingArea: any[];
    byOwner: any[];
  };
}

interface PostingRevenueData {
  period: string;
  year: number;
  month?: number;
  quarter?: number;
  summary: {
    totalPaidPosts: number;
    totalRevenue: number;
    averageRevenuePerPost: number;
    uniqueUsersWithPaidPosts: number;
    statusBreakdown: Record<string, number>;
    districtBreakdown: Record<string, number>;
    topUsers: any[];
  };
  breakdown: {
    byUser: any[];
    paidHousingAreas: any[];
  };
}

interface PostingRevenueOverview {
  year: number;
  overview: {
    totalPaidPosts: number;
    totalRevenue: number;
    averageRevenuePerPost: number;
    uniqueUsersWithPaidPosts: number;
    statusBreakdown: Record<string, number>;
    districtBreakdown: Record<string, number>;
  };
  monthlyBreakdown: Array<{
    month: number;
    totalPaidPosts: number;
    totalRevenue: number;
    uniqueUsers: number;
  }>;
  quarterlyBreakdown: Array<{
    quarter: number;
    totalPaidPosts: number;
    totalRevenue: number;
    uniqueUsers: number;
  }>;
  trends: {
    // Thêm property này
    peakMonth: {
      month: number;
      totalPaidPosts: number;
      totalRevenue: number;
      uniqueUsers: number;
    };
    peakQuarter: {
      quarter: number;
      totalPaidPosts: number;
      totalRevenue: number;
      uniqueUsers: number;
    };
  };
}

// Interface cho API response wrapper
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const useGetHousingAreaStatistics = (params: StatisticsParams) => {
  let url = `/api/admin/statistics/housing-area?period=${params.period}&year=${params.year}`;
  if (params.period === "month" && params.month) {
    url += `&month=${params.month}`;
  }
  if (params.period === "quarter" && params.quarter) {
    url += `&quarter=${params.quarter}`;
  }

  return useQuery<StatisticsData>({
    queryKey: ["housing-area-statistics", params],
    queryFn: async () => {
      const response = await fetchWithAuth(url);
      const result: ApiResponse<StatisticsData> = await response.json();
      console.log("API Response:", result);

      // Extract data từ wrapper
      if (result.success && result.data) {
        return result.data;
      } else {
        throw new Error(result.message || "Failed to fetch statistics");
      }
    },
    enabled: !!(params.period && params.year),
  });
};

export const useGetHousingAreaOverview = (year: number) => {
  return useQuery<OverviewData>({
    queryKey: ["housing-area-overview", year],
    queryFn: async () => {
      const response = await fetchWithAuth(
        `/api/admin/statistics/housing-area/overview?year=${year}`
      );
      const result: ApiResponse<OverviewData> = await response.json();
      console.log("Overview API Response:", result);

      // Extract data từ wrapper
      if (result.success && result.data) {
        return result.data;
      } else {
        throw new Error(result.message || "Failed to fetch overview");
      }
    },
    enabled: !!year,
  });
};

export const useGetBoostRevenueStatistics = (params: StatisticsParams) => {
  let url = `/api/admin/statistics/boost-revenue?period=${params.period}&year=${params.year}`;
  if (params.period === "month" && params.month) {
    url += `&month=${params.month}`;
  }
  if (params.period === "quarter" && params.quarter) {
    url += `&quarter=${params.quarter}`;
  }

  return useQuery<BoostRevenueData>({
    queryKey: ["boost-revenue-statistics", params],
    queryFn: async () => {
      const response = await fetchWithAuth(url);
      const result: ApiResponse<BoostRevenueData> = await response.json();
      console.log("Boost Revenue API Response:", result);

      if (result.success && result.data) {
        return result.data;
      } else {
        throw new Error(
          result.message || "Failed to fetch boost revenue statistics"
        );
      }
    },
    enabled: !!(params.period && params.year),
  });
};

export const useGetPostingRevenueStatistics = (params: StatisticsParams) => {
  let url = `/api/admin/statistics/posting-revenue?period=${params.period}&year=${params.year}`;
  if (params.period === "month" && params.month) {
    url += `&month=${params.month}`;
  }
  if (params.period === "quarter" && params.quarter) {
    url += `&quarter=${params.quarter}`;
  }

  return useQuery<PostingRevenueData>({
    queryKey: ["posting-revenue-statistics", params],
    queryFn: async () => {
      const response = await fetchWithAuth(url);
      const result: ApiResponse<PostingRevenueData> = await response.json();
      console.log("Posting Revenue API Response:", result);

      if (result.success && result.data) {
        return result.data;
      } else {
        throw new Error(
          result.message || "Failed to fetch posting revenue statistics"
        );
      }
    },
    enabled: !!(params.period && params.year),
  });
};

export const useGetPostingRevenueOverview = (year: number) => {
  return useQuery<PostingRevenueOverview>({
    queryKey: ["posting-revenue-overview", year],
    queryFn: async () => {
      const response = await fetchWithAuth(
        `/api/admin/statistics/posting-revenue/overview?year=${year}`
      );
      const result: ApiResponse<PostingRevenueOverview> = await response.json();
      console.log("Posting Revenue Overview API Response:", result);

      if (result.success && result.data) {
        return result.data;
      } else {
        throw new Error(
          result.message || "Failed to fetch posting revenue overview"
        );
      }
    },
    enabled: !!year,
  });
};
