"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { TrendingUp, Home, DollarSign, Loader2 } from "lucide-react";
import {
  useGetHousingAreaStatistics,
  useGetHousingAreaOverview,
  useGetBoostRevenueStatistics,
  useGetPostingRevenueStatistics,
  useGetPostingRevenueOverview,
} from "@/queries/statistics.queries";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function StatisticsPage() {
  const [period, setPeriod] = useState<"month" | "quarter" | "year">("month");
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [quarter, setQuarter] = useState(1);
  const [overviewYear, setOverviewYear] = useState(new Date().getFullYear());
  const [boostPeriod, setBoostPeriod] = useState<"month" | "quarter" | "year">(
    "month"
  );
  const [boostYear, setBoostYear] = useState(new Date().getFullYear());
  const [boostMonth, setBoostMonth] = useState(new Date().getMonth() + 1);
  const [boostQuarter, setBoostQuarter] = useState(1);
  const [postingPeriod, setPostingPeriod] = useState<
    "month" | "quarter" | "year"
  >("month");
  const [postingYear, setPostingYear] = useState(new Date().getFullYear());
  const [postingMonth, setPostingMonth] = useState(new Date().getMonth() + 1);
  const [postingQuarter, setPostingQuarter] = useState(1);
  const [postingOverviewYear, setPostingOverviewYear] = useState(
    new Date().getFullYear()
  );

  // Helper function to safely handle object entries
  const safeObjectEntries = (obj: Record<string, any> | undefined) => {
    return obj ? Object.entries(obj) : [];
  };

  // React Query hooks
  const {
    data: statisticsData,
    isLoading: isLoadingStats,
    error: statsError,
    refetch: refetchStats,
  } = useGetHousingAreaStatistics({
    period,
    year,
    month: period === "month" ? month : undefined,
    quarter: period === "quarter" ? quarter : undefined,
  });

  const {
    data: overviewData,
    isLoading: isLoadingOverview,
    error: overviewError,
    refetch: refetchOverview,
  } = useGetHousingAreaOverview(overviewYear);

  const {
    data: boostRevenueData,
    isLoading: isLoadingBoostStats,
    error: boostStatsError,
    refetch: refetchBoostStats,
  } = useGetBoostRevenueStatistics({
    period: boostPeriod,
    year: boostYear,
    month: boostPeriod === "month" ? boostMonth : undefined,
    quarter: boostPeriod === "quarter" ? boostQuarter : undefined,
  });

  const {
    data: postingRevenueData,
    isLoading: isLoadingPostingStats,
    error: postingStatsError,
    refetch: refetchPostingStats,
  } = useGetPostingRevenueStatistics({
    period: postingPeriod,
    year: postingYear,
    month: postingPeriod === "month" ? postingMonth : undefined,
    quarter: postingPeriod === "quarter" ? postingQuarter : undefined,
  });

  const {
    data: postingOverviewData,
    isLoading: isLoadingPostingOverview,
    error: postingOverviewError,
    refetch: refetchPostingOverview,
  } = useGetPostingRevenueOverview(postingOverviewYear);

  // Helper function to format the date
  const postingStatusChartData = safeObjectEntries(
    postingRevenueData?.summary?.statusBreakdown
  ).map(([key, value]) => ({
    name: key,
    value: value,
  }));

  const postingDistrictChartData = safeObjectEntries(
    postingRevenueData?.summary?.districtBreakdown
  ).map(([key, value]) => ({
    name: key,
    count: value,
  }));

  const postingMonthlyChartData =
    postingOverviewData?.monthlyBreakdown?.map((item) => ({
      month: `Month ${item.month}`,
      revenue: item.totalRevenue,
      posts: item.totalPaidPosts,
    })) || [];

  const statusChartData = safeObjectEntries(
    statisticsData?.summary?.statusBreakdown
  ).map(([key, value]) => ({
    name: key,
    value: value,
  }));

  const districtChartData = safeObjectEntries(
    statisticsData?.summary?.districtBreakdown
  ).map(([key, value]) => ({
    name: key,
    count: value,
  }));

  const monthlyChartData =
    overviewData?.monthlyBreakdown?.map((item) => ({
      month: `Month ${item.month}`,
      count: item.count,
    })) || [];

  console.log(postingRevenueData);

  return (
    <div className="p-6 space-y-6 bg-neutral-900">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-neutral-100">
          Housing Area Statistics
        </h1>
      </div>

      <Tabs defaultValue="statistics" className="space-y-6">
        <TabsList className="bg-neutral-800 border-neutral-700">
          <TabsTrigger
            value="statistics"
            className="text-neutral-100 hover:text-neutral-100 data-[state=active]:bg-neutral-700 data-[state=active]:text-neutral-100"
          >
            Time-based Statistics
          </TabsTrigger>
          <TabsTrigger
            value="overview"
            className="text-neutral-100 hover:text-neutral-100 data-[state=active]:bg-neutral-700 data-[state=active]:text-neutral-100"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="boost-revenue"
            className="text-neutral-100 hover:text-neutral-100 data-[state=active]:bg-neutral-700 data-[state=active]:text-neutral-100"
          >
            Boost Revenue
          </TabsTrigger>
          <TabsTrigger
            value="posting-revenue"
            className="text-neutral-100 hover:text-neutral-100 data-[state=active]:bg-neutral-700 data-[state=active]:text-neutral-100"
          >
            Posting Revenue
          </TabsTrigger>
        </TabsList>

        {/* Time-based Statistics */}
        <TabsContent value="statistics" className="space-y-6">
          {/* Filters */}
          <Card className="bg-neutral-800 border-neutral-700">
            <CardHeader>
              <CardTitle className="text-neutral-100">
                Statistics Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-neutral-100">Statistics Type</Label>
                  <Select
                    value={period}
                    onValueChange={(value: "month" | "quarter" | "year") =>
                      setPeriod(value)
                    }
                  >
                    <SelectTrigger className="bg-neutral-900 border-neutral-700 text-neutral-100 focus:border-neutral-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-neutral-700">
                      <SelectItem
                        value="month"
                        className="text-neutral-100 hover:bg-neutral-700"
                      >
                        By Month
                      </SelectItem>
                      <SelectItem
                        value="quarter"
                        className="text-neutral-100 hover:bg-neutral-700"
                      >
                        By Quarter
                      </SelectItem>
                      <SelectItem
                        value="year"
                        className="text-neutral-100 hover:bg-neutral-700"
                      >
                        By Year
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-neutral-100">Year</Label>
                  <Input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number.parseInt(e.target.value))}
                    min="2020"
                    max="2030"
                    className="bg-neutral-900 border-neutral-700 text-neutral-100 focus:border-neutral-500"
                  />
                </div>
                {period === "month" && (
                  <div>
                    <Label className="text-neutral-100">Month</Label>
                    <Select
                      value={month.toString()}
                      onValueChange={(value) =>
                        setMonth(Number.parseInt(value))
                      }
                    >
                      <SelectTrigger className="bg-neutral-900 border-neutral-700 text-neutral-100 focus:border-neutral-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-neutral-900 border-neutral-700">
                        {Array.from({ length: 12 }, (_, i) => (
                          <SelectItem
                            key={i + 1}
                            value={(i + 1).toString()}
                            className="text-neutral-100 hover:bg-neutral-700"
                          >
                            Month {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {period === "quarter" && (
                  <div>
                    <Label className="text-neutral-100">Quarter</Label>
                    <Select
                      value={quarter.toString()}
                      onValueChange={(value) =>
                        setQuarter(Number.parseInt(value))
                      }
                    >
                      <SelectTrigger className="bg-neutral-900 border-neutral-700 text-neutral-100 focus:border-neutral-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-neutral-900 border-neutral-700">
                        <SelectItem
                          value="1"
                          className="text-neutral-100 hover:bg-neutral-700"
                        >
                          Quarter 1
                        </SelectItem>
                        <SelectItem
                          value="2"
                          className="text-neutral-100 hover:bg-neutral-700"
                        >
                          Quarter 2
                        </SelectItem>
                        <SelectItem
                          value="3"
                          className="text-neutral-100 hover:bg-neutral-700"
                        >
                          Quarter 3
                        </SelectItem>
                        <SelectItem
                          value="4"
                          className="text-neutral-100 hover:bg-neutral-700"
                        >
                          Quarter 4
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="flex items-end">
                  <Button
                    onClick={() => refetchStats()}
                    disabled={isLoadingStats}
                    className="bg-blue-500 text-white border-none hover:bg-blue-600"
                  >
                    {isLoadingStats ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Fetch Statistics"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error handling */}
          {statsError && (
            <Card className="bg-neutral-800 border-red-500">
              <CardContent className="pt-6">
                <p className="text-red-400">
                  Error loading data:{" "}
                  {statsError instanceof Error
                    ? statsError.message
                    : "Unknown error"}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Loading state */}
          {isLoadingStats && (
            <div className="flex justify-center items-center py-8 text-neutral-100">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading data...</span>
            </div>
          )}

          {/* Summary Cards */}
          {statisticsData && !isLoadingStats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-neutral-800 border-neutral-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-neutral-100">
                    Total Properties
                  </CardTitle>
                  <Home className="h-4 w-4 text-neutral-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-neutral-100">
                    {statisticsData?.summary?.totalCount}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-neutral-800 border-neutral-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-neutral-100">
                    Paid
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-neutral-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">
                    {statisticsData?.summary?.paidCount}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-neutral-800 border-neutral-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-neutral-100">
                    Unpaid
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-neutral-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-500">
                    {statisticsData?.summary?.unpaidCount}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-neutral-800 border-neutral-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-neutral-100">
                    Avg Rooms/Property
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-neutral-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-neutral-100">
                    {statisticsData?.summary?.averageExpectedRooms}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Charts */}
          {statisticsData && !isLoadingStats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Breakdown */}
              <Card className="bg-neutral-800 border-neutral-700">
                <CardHeader>
                  <CardTitle className="text-neutral-100">
                    Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              {/* District Breakdown */}
              <Card className="bg-neutral-800 border-neutral-700">
                <CardHeader>
                  <CardTitle className="text-neutral-100">
                    District Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={districtChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                      <XAxis dataKey="name" stroke="#e5e7eb" />
                      <YAxis stroke="#e5e7eb" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#171717",
                          borderColor: "#374151",
                        }}
                      />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-neutral-100">
              Overview for {overviewYear}
            </h2>
            <div className="flex gap-4 items-center">
              <Input
                type="number"
                value={overviewYear}
                onChange={(e) =>
                  setOverviewYear(Number.parseInt(e.target.value))
                }
                min="2020"
                max="2030"
                className="w-24 bg-neutral-900 border-neutral-700 text-neutral-100 focus:border-neutral-500"
              />
              <Button
                onClick={() => refetchOverview()}
                disabled={isLoadingOverview}
                className="bg-blue-500 text-white border-none hover:bg-blue-600"
              >
                {isLoadingOverview ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Fetch Overview"
                )}
              </Button>
            </div>
          </div>

          {/* Error handling for overview */}
          {overviewError && (
            <Card className="bg-neutral-800 border-red-500">
              <CardContent className="pt-6">
                <p className="text-red-400">
                  Error loading overview data:{" "}
                  {overviewError instanceof Error
                    ? overviewError.message
                    : "Unknown error"}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Loading state for overview */}
          {isLoadingOverview && (
            <div className="flex justify-center items-center py-8 text-neutral-100">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading overview data...</span>
            </div>
          )}

          {/* Overview Summary Cards */}
          {overviewData && !isLoadingOverview && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-neutral-800 border-neutral-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-neutral-100">
                    Total Properties in {overviewYear}
                  </CardTitle>
                  <Home className="h-4 w-4 text-neutral-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-neutral-100">
                    {overviewData?.overview?.totalCount}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-neutral-800 border-neutral-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-neutral-100">
                    Peak Month
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-neutral-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-neutral-100">
                    {overviewData?.monthlyBreakdown?.reduce(
                      (max, current) =>
                        current?.count > max?.count ? current : max,
                      overviewData?.monthlyBreakdown[0]
                    )?.month || "N/A"}
                  </div>
                  <p className="text-xs text-neutral-400">
                    {overviewData?.monthlyBreakdown?.reduce(
                      (max, current) =>
                        current?.count > max?.count ? current : max,
                      overviewData?.monthlyBreakdown[0]
                    )?.count || 0}{" "}
                    properties
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-neutral-800 border-neutral-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-neutral-100">
                    Peak Quarter
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-neutral-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-neutral-100">
                    Quarter{" "}
                    {overviewData?.quarterlyBreakdown?.reduce(
                      (max, current) =>
                        current?.count > max?.count ? current : max,
                      overviewData?.quarterlyBreakdown[0]
                    )?.quarter || "N/A"}
                  </div>
                  <p className="text-xs text-neutral-400">
                    {overviewData?.quarterlyBreakdown?.reduce(
                      (max, current) =>
                        current?.count > max?.count ? current : max,
                      overviewData?.quarterlyBreakdown[0]
                    )?.count || 0}{" "}
                    properties
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Monthly Trend Chart */}
          {overviewData && !isLoadingOverview && (
            <div className="grid grid-cols-1 gap-6">
              <Card className="bg-neutral-800 border-neutral-700">
                <CardHeader>
                  <CardTitle className="text-neutral-100">
                    Monthly Trend for {overviewYear}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={monthlyChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                      <XAxis dataKey="month" stroke="#e5e7eb" />
                      <YAxis stroke="#e5e7eb" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#171717",
                          borderColor: "#374151",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#8884d8"
                        strokeWidth={2}
                        dot={{ fill: "#8884d8" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              {/* Quarterly Breakdown */}
              <Card className="bg-neutral-800 border-neutral-700">
                <CardHeader>
                  <CardTitle className="text-neutral-100">
                    Quarterly Distribution for {overviewYear}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={
                        overviewData?.quarterlyBreakdown?.map((item) => ({
                          quarter: `Quarter ${item.quarter}`,
                          count: item.count,
                        })) || []
                      }
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                      <XAxis dataKey="quarter" stroke="#e5e7eb" />
                      <YAxis stroke="#e5e7eb" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#171717",
                          borderColor: "#374151",
                        }}
                      />
                      <Bar dataKey="count" fill="#00C49F" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              {/* Status breakdown for overview */}
              <Card className="bg-neutral-800 border-neutral-700">
                <CardHeader>
                  <CardTitle className="text-neutral-100">
                    Status Distribution Overview for {overviewYear}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={safeObjectEntries(
                          overviewData?.overview?.statusBreakdown
                        ).map(([key, value]) => ({
                          name: key,
                          value: value,
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {safeObjectEntries(
                          overviewData?.overview?.statusBreakdown
                        ).map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Boost Revenue */}
        <TabsContent value="boost-revenue" className="space-y-6">
          {/* Filters for boost revenue */}
          <Card className="bg-neutral-800 border-neutral-700">
            <CardHeader>
              <CardTitle className="text-neutral-100">
                Boost Revenue Statistics Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-neutral-100">Statistics Type</Label>
                  <Select
                    value={boostPeriod}
                    onValueChange={(value: "month" | "quarter" | "year") =>
                      setBoostPeriod(value)
                    }
                  >
                    <SelectTrigger className="bg-neutral-900 border-neutral-700 text-neutral-100 focus:border-neutral-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-neutral-700">
                      <SelectItem
                        value="month"
                        className="text-neutral-100 hover:bg-neutral-700"
                      >
                        By Month
                      </SelectItem>
                      <SelectItem
                        value="quarter"
                        className="text-neutral-100 hover:bg-neutral-700"
                      >
                        By Quarter
                      </SelectItem>
                      <SelectItem
                        value="year"
                        className="text-neutral-100 hover:bg-neutral-700"
                      >
                        By Year
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-neutral-100">Year</Label>
                  <Input
                    type="number"
                    value={boostYear}
                    onChange={(e) =>
                      setBoostYear(Number.parseInt(e.target.value))
                    }
                    min="2020"
                    max="2030"
                    className="bg-neutral-900 border-neutral-700 text-neutral-100 focus:border-neutral-500"
                  />
                </div>
                {boostPeriod === "month" && (
                  <div>
                    <Label className="text-neutral-100">Month</Label>
                    <Select
                      value={boostMonth.toString()}
                      onValueChange={(value) =>
                        setBoostMonth(Number.parseInt(value))
                      }
                    >
                      <SelectTrigger className="bg-neutral-900 border-neutral-700 text-neutral-100 focus:border-neutral-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-neutral-900 border-neutral-700">
                        {Array.from({ length: 12 }, (_, i) => (
                          <SelectItem
                            key={i + 1}
                            value={(i + 1).toString()}
                            className="text-neutral-100 hover:bg-neutral-700"
                          >
                            Month {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {boostPeriod === "quarter" && (
                  <div>
                    <Label className="text-neutral-100">Quarter</Label>
                    <Select
                      value={boostQuarter.toString()}
                      onValueChange={(value) =>
                        setBoostQuarter(Number.parseInt(value))
                      }
                    >
                      <SelectTrigger className="bg-neutral-900 border-neutral-700 text-neutral-100 focus:border-neutral-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-neutral-900 border-neutral-700">
                        <SelectItem
                          value="1"
                          className="text-neutral-100 hover:bg-neutral-700"
                        >
                          Quarter 1
                        </SelectItem>
                        <SelectItem
                          value="2"
                          className="text-neutral-100 hover:bg-neutral-700"
                        >
                          Quarter 2
                        </SelectItem>
                        <SelectItem
                          value="3"
                          className="text-neutral-100 hover:bg-neutral-700"
                        >
                          Quarter 3
                        </SelectItem>
                        <SelectItem
                          value="4"
                          className="text-neutral-100 hover:bg-neutral-700"
                        >
                          Quarter 4
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="flex items-end">
                  <Button
                    onClick={() => refetchBoostStats()}
                    disabled={isLoadingBoostStats}
                    className="bg-blue-500 text-white border-none hover:bg-blue-600"
                  >
                    {isLoadingBoostStats ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Fetch Statistics"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards for boost revenue */}
          {boostRevenueData && !isLoadingBoostStats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-neutral-800 border-neutral-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-neutral-100">
                    Total Revenue
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-neutral-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">
                    {boostRevenueData?.summary?.totalRevenue?.toLocaleString()}{" "}
                    VND
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-neutral-800 border-neutral-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-neutral-100">
                    Total Boosts
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-neutral-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-neutral-100">
                    {boostRevenueData?.summary?.totalBoosts}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-neutral-800 border-neutral-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-neutral-100">
                    Boosted Rooms
                  </CardTitle>
                  <Home className="h-4 w-4 text-neutral-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-neutral-100">
                    {boostRevenueData?.summary?.uniqueRoomsWithBoost}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-neutral-800 border-neutral-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-neutral-100">
                    Properties with Boost
                  </CardTitle>
                  <Home className="h-4 w-4 text-neutral-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-neutral-100">
                    {boostRevenueData?.summary?.uniqueHousingAreasWithBoost}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Charts for boost revenue */}
          {boostRevenueData && !isLoadingBoostStats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Housing Areas by Revenue */}
              <Card className="bg-neutral-800 border-neutral-700">
                <CardHeader>
                  <CardTitle className="text-neutral-100">
                    Top Properties by Boost Count
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={
                        boostRevenueData?.summary?.topHousingAreas?.slice(
                          0,
                          5
                        ) || []
                      }
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                      <XAxis dataKey="housing_area_name" stroke="#e5e7eb" />
                      <YAxis stroke="#e5e7eb" />
                      <Tooltip
                        formatter={(value) => [`${value} boosts`, "Count"]}
                        contentStyle={{
                          backgroundColor: "#171717",
                          borderColor: "#374151",
                        }}
                      />
                      <Bar dataKey="total_boosts" fill="#00C49F" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              {/* Revenue by Owner */}
              <Card className="bg-neutral-800 border-neutral-700">
                <CardHeader>
                  <CardTitle className="text-neutral-100">
                    Revenue by Owner
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={
                          boostRevenueData?.breakdown?.byOwner
                            ?.slice(0, 5)
                            ?.map((owner, index) => ({
                              name: `Owner ${index + 1}`,
                              value: owner.total_revenue,
                            })) || []
                        }
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {boostRevenueData?.breakdown?.byOwner
                          ?.slice(0, 5)
                          ?.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [
                          `${value?.toLocaleString()} VND`,
                          "Revenue",
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Posting Revenue */}
        <TabsContent value="posting-revenue" className="space-y-6">
          <Tabs defaultValue="posting-stats" className="space-y-6">
            <TabsList className="bg-neutral-800 border-neutral-700">
              <TabsTrigger
                value="posting-stats"
                className="text-neutral-100 hover:text-neutral-100 data-[state=active]:bg-neutral-700 data-[state=active]:text-neutral-100"
              >
                Time-based Statistics
              </TabsTrigger>
              <TabsTrigger
                value="posting-overview"
                className="text-neutral-100 hover:text-neutral-100 data-[state=active]:bg-neutral-700 data-[state=active]:text-neutral-100"
              >
                Revenue Overview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="posting-stats" className="space-y-6">
              {/* Filters for posting revenue */}
              <Card className="bg-neutral-800 border-neutral-700">
                <CardHeader>
                  <CardTitle className="text-neutral-100">
                    Posting Revenue Statistics Filters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-neutral-100">
                        Statistics Type
                      </Label>
                      <Select
                        value={postingPeriod}
                        onValueChange={(value: "month" | "quarter" | "year") =>
                          setPostingPeriod(value)
                        }
                      >
                        <SelectTrigger className="bg-neutral-900 border-neutral-700 text-neutral-100 focus:border-neutral-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-900 border-neutral-700">
                          <SelectItem
                            value="month"
                            className="text-neutral-100 hover:bg-neutral-700"
                          >
                            By Month
                          </SelectItem>
                          <SelectItem
                            value="quarter"
                            className="text-neutral-100 hover:bg-neutral-700"
                          >
                            By Quarter
                          </SelectItem>
                          <SelectItem
                            value="year"
                            className="text-neutral-100 hover:bg-neutral-700"
                          >
                            By Year
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-neutral-100">Year</Label>
                      <Input
                        type="number"
                        value={postingYear}
                        onChange={(e) =>
                          setPostingYear(Number.parseInt(e.target.value))
                        }
                        min="2020"
                        max="2030"
                        className="bg-neutral-900 border-neutral-700 text-neutral-100 focus:border-neutral-500"
                      />
                    </div>
                    {postingPeriod === "month" && (
                      <div>
                        <Label className="text-neutral-100">Month</Label>
                        <Select
                          value={postingMonth.toString()}
                          onValueChange={(value) =>
                            setPostingMonth(Number.parseInt(value))
                          }
                        >
                          <SelectTrigger className="bg-neutral-900 border-neutral-700 text-neutral-100 focus:border-neutral-500">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-neutral-900 border-neutral-700">
                            {Array.from({ length: 12 }, (_, i) => (
                              <SelectItem
                                key={i + 1}
                                value={(i + 1).toString()}
                                className="text-neutral-100 hover:bg-neutral-700"
                              >
                                Month {i + 1}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    {postingPeriod === "quarter" && (
                      <div>
                        <Label className="text-neutral-100">Quarter</Label>
                        <Select
                          value={postingQuarter.toString()}
                          onValueChange={(value) =>
                            setPostingQuarter(Number.parseInt(value))
                          }
                        >
                          <SelectTrigger className="bg-neutral-900 border-neutral-700 text-neutral-100 focus:border-neutral-500">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-neutral-900 border-neutral-700">
                            <SelectItem
                              value="1"
                              className="text-neutral-100 hover:bg-neutral-700"
                            >
                              Quarter 1
                            </SelectItem>
                            <SelectItem
                              value="2"
                              className="text-neutral-100 hover:bg-neutral-700"
                            >
                              Quarter 2
                            </SelectItem>
                            <SelectItem
                              value="3"
                              className="text-neutral-100 hover:bg-neutral-700"
                            >
                              Quarter 3
                            </SelectItem>
                            <SelectItem
                              value="4"
                              className="text-neutral-100 hover:bg-neutral-700"
                            >
                              Quarter 4
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className="flex items-end">
                      <Button
                        onClick={() => refetchPostingStats()}
                        disabled={isLoadingPostingStats}
                        className="bg-blue-500 text-white border-none hover:bg-blue-600"
                      >
                        {isLoadingPostingStats ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          "Fetch Statistics"
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Error handling */}
              {postingStatsError && (
                <Card className="bg-neutral-800 border-red-500">
                  <CardContent className="pt-6">
                    <p className="text-red-400">
                      Error loading data:{" "}
                      {postingStatsError instanceof Error
                        ? postingStatsError.message
                        : "Unknown error"}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Loading state */}
              {isLoadingPostingStats && (
                <div className="flex justify-center items-center py-8 text-neutral-100">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading data...</span>
                </div>
              )}

              {/* Summary Cards for posting revenue */}
              {postingRevenueData && !isLoadingPostingStats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="bg-neutral-800 border-neutral-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-neutral-100">
                        Total Revenue
                      </CardTitle>
                      <DollarSign className="h-4 w-4 text-neutral-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-500">
                        {postingRevenueData?.summary?.totalRevenue?.toLocaleString()}{" "}
                        VND
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-neutral-800 border-neutral-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-neutral-100">
                        Paid Posts
                      </CardTitle>
                      <Home className="h-4 w-4 text-neutral-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-neutral-100">
                        {postingRevenueData?.summary?.totalPaidPosts}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-neutral-800 border-neutral-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-neutral-100">
                        Users with Paid Posts
                      </CardTitle>
                      <TrendingUp className="h-4 w-4 text-neutral-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-neutral-100">
                        {postingRevenueData?.summary?.uniqueUsersWithPaidPosts}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-neutral-800 border-neutral-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-neutral-100">
                        Price per Post
                      </CardTitle>
                      <DollarSign className="h-4 w-4 text-neutral-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-500">
                        50,000 VND
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Charts for posting revenue */}
              {postingRevenueData && !isLoadingPostingStats && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Status Breakdown */}
                  <Card className="bg-neutral-800 border-neutral-700">
                    <CardHeader>
                      <CardTitle className="text-neutral-100">
                        Post Status Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={postingStatusChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) =>
                              `${name} ${(percent * 100).toFixed(0)}%`
                            }
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {postingStatusChartData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  <Card className="bg-neutral-800 border-neutral-700">
                    <CardHeader>
                      <CardTitle className="text-neutral-100">
                        Top Users by Revenue
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                          data={
                            postingRevenueData?.summary?.topUsers?.slice(
                              0,
                              5
                            ) || []
                          }
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#4b5563"
                          />
                          <XAxis
                            dataKey="userInfo.full_name"
                            stroke="#e5e7eb"
                          />
                          <YAxis stroke="#e5e7eb" />
                          <Tooltip
                            formatter={(value) => [
                              `${value?.toLocaleString()} VND`,
                              "Revenue",
                            ]}
                            contentStyle={{
                              backgroundColor: "#171717",
                              borderColor: "#374151",
                            }}
                          />
                          <Bar dataKey="totalRevenue" fill="#00C49F" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  {/* District Breakdown */}
                  <Card className="bg-neutral-800 border-neutral-700">
                    <CardHeader>
                      <CardTitle className="text-neutral-100">
                        Distribution by District
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={postingDistrictChartData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#4b5563"
                          />
                          <XAxis dataKey="name" stroke="#e5e7eb" />
                          <YAxis stroke="#e5e7eb" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#171717",
                              borderColor: "#374151",
                            }}
                          />
                          <Bar dataKey="count" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  {/* Posts vs Revenue Comparison */}
                  <Card className="bg-neutral-800 border-neutral-700">
                    <CardHeader>
                      <CardTitle className="text-neutral-100">
                        Posts vs Revenue Comparison by User
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                          data={
                            postingRevenueData?.breakdown?.byUser?.slice(
                              0,
                              8
                            ) || []
                          }
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#4b5563"
                          />
                          <XAxis
                            dataKey="userInfo.full_name"
                            stroke="#e5e7eb"
                          />
                          <YAxis stroke="#e5e7eb" />
                          <Tooltip
                            formatter={(value, name) => [
                              name === "totalPaidPosts"
                                ? `${value} posts`
                                : `${value?.toLocaleString()} VND`,
                              name === "totalPaidPosts" ? "Posts" : "Revenue",
                            ]}
                            contentStyle={{
                              backgroundColor: "#171717",
                              borderColor: "#374151",
                            }}
                          />
                          <Bar
                            dataKey="totalPaidPosts"
                            fill="#0088FE"
                            name="totalPaidPosts"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="posting-overview" className="space-y-6">
              {/* Posting Overview Content */}
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-neutral-100">
                  Posting Revenue Overview for {postingOverviewYear}
                </h2>
                <div className="flex gap-4 items-center">
                  <Input
                    type="number"
                    value={postingOverviewYear}
                    onChange={(e) =>
                      setPostingOverviewYear(Number.parseInt(e.target.value))
                    }
                    min="2020"
                    max="2030"
                    className="w-24 bg-neutral-900 border-neutral-700 text-neutral-100 focus:border-neutral-500"
                  />
                  <Button
                    onClick={() => refetchPostingOverview()}
                    disabled={isLoadingPostingOverview}
                    className="bg-blue-500 text-white border-none hover:bg-blue-600"
                  >
                    {isLoadingPostingOverview ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Fetch Overview"
                    )}
                  </Button>
                </div>
              </div>

              {/* Error handling for posting overview */}
              {postingOverviewError && (
                <Card className="bg-neutral-800 border-red-500">
                  <CardContent className="pt-6">
                    <p className="text-red-400">
                      Error loading posting overview data:{" "}
                      {postingOverviewError instanceof Error
                        ? postingOverviewError.message
                        : "Unknown error"}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Loading state for posting overview */}
              {isLoadingPostingOverview && (
                <div className="flex justify-center items-center py-8 text-neutral-100">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading posting overview data...</span>
                </div>
              )}

              {/* Overview Summary Cards */}
              {postingOverviewData && !isLoadingPostingOverview && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <Card className="bg-neutral-800 border-neutral-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-neutral-100">
                        Total Revenue for {postingOverviewYear}
                      </CardTitle>
                      <DollarSign className="h-4 w-4 text-neutral-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-500">
                        {postingOverviewData?.overview?.totalRevenue?.toLocaleString()}{" "}
                        VND
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-neutral-800 border-neutral-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-neutral-100">
                        Peak Month
                      </CardTitle>
                      <TrendingUp className="h-4 w-4 text-neutral-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-neutral-100">
                        Month{" "}
                        {postingOverviewData?.trends?.peakMonth?.month || "N/A"}
                      </div>
                      <p className="text-xs text-neutral-400">
                        {postingOverviewData?.trends?.peakMonth?.totalRevenue?.toLocaleString() ||
                          0}{" "}
                        VND
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-neutral-800 border-neutral-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-neutral-100">
                        Peak Quarter
                      </CardTitle>
                      <TrendingUp className="h-4 w-4 text-neutral-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-neutral-100">
                        Quarter{" "}
                        {postingOverviewData?.trends?.peakQuarter?.quarter ||
                          "N/A"}
                      </div>
                      <p className="text-xs text-neutral-400">
                        {postingOverviewData?.trends?.peakQuarter?.totalRevenue?.toLocaleString() ||
                          0}{" "}
                        VND
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-neutral-800 border-neutral-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-neutral-100">
                        Total Paid Posts
                      </CardTitle>
                      <Home className="h-4 w-4 text-neutral-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-neutral-100">
                        {postingOverviewData?.overview?.totalPaidPosts}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Charts for posting overview */}
              {postingOverviewData && !isLoadingPostingOverview && (
                <div className="grid grid-cols-1 gap-6">
                  {/* Monthly Revenue Trend */}
                  <Card className="bg-neutral-800 border-neutral-700">
                    <CardHeader>
                      <CardTitle className="text-neutral-100">
                        Monthly Posting Revenue Trend for {postingOverviewYear}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={postingMonthlyChartData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#4b5563"
                          />
                          <XAxis dataKey="month" stroke="#e5e7eb" />
                          <YAxis stroke="#e5e7eb" />
                          <Tooltip
                            formatter={(value, name) => [
                              name === "revenue"
                                ? `${value?.toLocaleString()} VND`
                                : `${value} posts`,
                              name === "revenue" ? "Revenue" : "Posts",
                            ]}
                            contentStyle={{
                              backgroundColor: "#171717",
                              borderColor: "#374151",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="#00C49F"
                            strokeWidth={2}
                            dot={{ fill: "#00C49F" }}
                            name="revenue"
                          />
                          <Line
                            type="monotone"
                            dataKey="posts"
                            stroke="#0088FE"
                            strokeWidth={2}
                            dot={{ fill: "#0088FE" }}
                            name="posts"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  {/* Quarterly Revenue */}
                  <Card className="bg-neutral-800 border-neutral-700">
                    <CardHeader>
                      <CardTitle className="text-neutral-100">
                        Quarterly Posting Revenue for {postingOverviewYear}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                          data={
                            postingOverviewData?.quarterlyBreakdown?.map(
                              (item) => ({
                                quarter: `Quarter ${item.quarter}`,
                                revenue: item.totalRevenue,
                                posts: item.totalPaidPosts,
                              })
                            ) || []
                          }
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#4b5563"
                          />
                          <XAxis dataKey="quarter" stroke="#e5e7eb" />
                          <YAxis stroke="#e5e7eb" />
                          <Tooltip
                            formatter={(value, name) => [
                              name === "revenue"
                                ? `${value?.toLocaleString()} VND`
                                : `${value} posts`,
                              name === "revenue" ? "Revenue" : "Posts",
                            ]}
                            contentStyle={{
                              backgroundColor: "#171717",
                              borderColor: "#374151",
                            }}
                          />
                          <Bar
                            dataKey="revenue"
                            fill="#FF8042"
                            name="revenue"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  {/* Status breakdown for posting overview */}
                  <Card className="bg-neutral-800 border-neutral-700">
                    <CardHeader>
                      <CardTitle className="text-neutral-100">
                        Post Status Distribution for {postingOverviewYear}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={safeObjectEntries(
                              postingOverviewData?.overview?.statusBreakdown
                            ).map(([key, value]) => ({
                              name: key,
                              value: value,
                            }))}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) =>
                              `${name} ${(percent * 100).toFixed(0)}%`
                            }
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {safeObjectEntries(
                              postingOverviewData?.overview?.statusBreakdown
                            ).map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#171717",
                              borderColor: "#374151",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}
