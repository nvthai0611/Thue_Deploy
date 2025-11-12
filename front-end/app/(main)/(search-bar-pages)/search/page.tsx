"use client";
import CameraIcon from "@/components/icon/camera-icon";
import ClockIcon from "@/components/icon/clock-icon";
import PagingPage from "@/components/pagingation/pagingPage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/range-slide";
import { useDebounce } from "@/hooks/useDebounce";
import type { Room } from "@/lib/type";
import { useSearchRooms } from "@/queries/room.queries";
import { FacilityCodeMap } from "@/utils/constants/facility-codes";
import { Loader2, PackageOpen, Building2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
// interface Room {
//   _id: string;
//   housing_area_id: string;
//   tenant_id?: string;
//   title: string;
//   price: number;
//   area: number;
//   facilities: { name: string; quantity: number; code: number }[];
//   images: { url: string; caption?: string; uploaded_at?: string }[];
//   boost_history: {
//     priority: number;
//     start_at: string;
//     end_at: string;
//     reason: string;
//   }[];
//   type: string;
//   max_occupancy: number;
//   status?: string;
//   rental_history?: {
//     tenant_id: string;
//     contract_id: string;
//     start_date: string;
//     end_date: string;
//   }[];
//   pending_update?: any[];
//   createdAt?: string;
//   updatedAt?: string;
// }

// Main search content component
function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get search query from URL
  const searchQuery = searchParams.get("query") || "";

  // Other filter states
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showAreaFilter, setShowAreaFilter] = useState<boolean>(true);
  const [showMoneyFilter, setShowMoneyFilter] = useState<boolean>(true);
  const pageFromUrl = Number(searchParams.get("page")) || 1;
  const [page, setPage] = useState<number>(pageFromUrl);
  const [limit, setLimit] = useState<number>(13);
  const [showConditionFilter, setShowConditionFilter] = useState<boolean>(true);
  const [showSortby, setShowSortby] = useState<boolean>(false);
  const [showFilterByRoomType, setShowFilterByRoomType] =
    useState<boolean>(true);
  const [range, setRange] = useState<number[]>([0, 6000000]);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [areaRange, setAreaRange] = useState<number[]>([0, 100]);
  const [selectedTypes, setSelectedTypes] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("");
  const [sortByOrder, setSortByOrder] = useState<string>("");
  console.log(selectedFacilities);

  // Debounce search/filter values for better UX
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const debouncedRange = useDebounce(range, 500);
  const debouncedAreaRange = useDebounce(areaRange, 500);
  const debouncedFacilities = useDebounce(selectedFacilities, 600);

  // Fetch rooms based on filters
  const { data, isLoading } = useSearchRooms(
    debouncedSearchQuery,
    page,
    limit,
    debouncedRange[0],
    debouncedRange[1],
    debouncedAreaRange[0],
    debouncedAreaRange[1],
    selectedTypes,
    sortBy,
    sortByOrder,
    debouncedFacilities
  );
  console.log(data);

  const totalpage = data?.pagination?.totalPages || 1;

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [
    debouncedSearchQuery,
    debouncedRange[0],
    debouncedRange[1],
    debouncedAreaRange[0],
    debouncedAreaRange[1],
    debouncedFacilities,
    selectedTypes,
    sortBy,
    sortByOrder,
  ]);

  // Update URL when page changes
  useEffect(() => {
    if (page !== pageFromUrl) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", page.toString());
      router.push(`?${params.toString()}`, { scroll: false });
    }
  }, [page, pageFromUrl, router, searchParams]);

  // Handle facility filter change
  const handleFacilityChange = (facility: string) => {
    setSelectedFacilities((prev) =>
      prev.includes(facility)
        ? prev.filter((f) => f !== facility)
        : [...prev, facility]
    );
  };

  const allRooms: Room[] = data?.data || [];
  const sortFields = [
    { value: "", label: "Mặc định" },
    { value: "price", label: "Giá" },
    { value: "area", label: "Diện tích" },
    { value: "max_occupants", label: "Số người tối đa" },
    { value: "created_at", label: "Ngày tạo" },
  ];
  const sortOrders = [
    { value: "", label: "Mặc định" },
    { value: "asc", label: "Tăng dần" },
    { value: "desc", label: "Giảm dần" },
  ];
  const fixedFacilityCodes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
  const statusLabels: Record<string, string> = {
    AVAILABLE: "Còn trống",
    OCCUPIED: "Đã thuê",
  };
  const roomTypeLabels: Record<string, string> = {
    SINGLE: "Phòng đơn",
    COUPLE: "Phòng đôi",
  };

  return (
    <div className="bg-background overflow-x-hidden w-full sm:w-[90%] lg:w-[70%] mx-auto">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="order-2 lg:order-1 lg:col-span-3">
            {allRooms.length === 0 && !isLoading && (
              <div className="h-[300px] flex flex-col items-center justify-center">
                <PackageOpen
                  className="mx-auto size-24 sm:size-32"
                  strokeWidth={1}
                />
                <h2 className="text-foreground/70 text-center text-lg sm:text-xl mt-4">
                  Không có kết quả phù hợp
                </h2>
              </div>
            )}
            {isLoading && (
              <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="animate-spin h-6 w-6 sm:h-8 sm:w-8 mx-auto" />
              </div>
            )}
            <div className="space-y-3 sm:space-y-4">
              {allRooms.map((listing) => (
                <Card
                  key={listing._id}
                  className="overflow-hidden hover:shadow-md transition-shadow duration-200 border border-gray-200 bg-white"
                >
                  <CardContent className="p-0">
                    <div className="h-full flex flex-col md:flex-row md:items-start">
                      <div className="relative md:w-1/4 h-full min-h-[220px] min-w-[270px] flex-shrink-0 aspect-[10/9]">
                        <img
                          src={listing?.images[0]?.url || "/placeholder.svg"}
                          alt={listing.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />

                        {/* Room Number Badge */}
                        {listing.room_number && (
                          <div className="absolute top-2 left-2">
                            <div className="bg-white/90 backdrop-blur-sm text-gray-800 rounded px-2 py-1 text-xs font-medium shadow-sm">
                              #{listing.room_number}
                            </div>
                          </div>
                        )}

                        {/* Camera Icon and Image Count */}
                        <div className="absolute top-2 right-2">
                          <div className="bg-white/90 backdrop-blur-sm text-gray-800 rounded px-2 py-1 flex items-center gap-1 text-xs font-medium shadow-sm">
                            <CameraIcon className="w-3 h-3" />
                            {listing.images.length}
                          </div>
                        </div>

                        {/* Image Caption */}
                        {listing?.images[0]?.caption && (
                          <div className="absolute bottom-2 left-2 right-2">
                            <div className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs px-2 py-1 rounded text-center font-medium shadow-sm">
                              {listing?.images[0]?.caption}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 p-3 sm:p-4 md:min-h-[160px]">
                        <div className="flex flex-col h-full justify-between">
                          {/* Title and Status */}
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-gray-800 line-clamp-2 leading-tight flex-1 text-sm sm:text-base">
                              {listing.title}
                            </h3>
                            {listing.status && (
                              <div className="ml-3 flex-shrink-0">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium ${
                                    listing.status === "AVAILABLE"
                                      ? "bg-green-100 text-green-700"
                                      : listing.status === "OCCUPIED"
                                        ? "bg-red-200 text-red-800"
                                        : "bg-gray-50 text-gray-600"
                                  }`}
                                >
                                  {statusLabels[listing.status] ?? listing.status}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Housing Area Name */}
                          {listing.housing_area?.name && (
                            <div className="mb-2">
                              <span className="text-sm text-gray-600">
                                <div className="flex items-center gap-2"><Building2 width={15}/><div>{listing.housing_area.name}</div></div>
                              </span>
                            </div>
                          )}
                          {/* Price and Area */}
                          <div className="flex items-center gap-2 sm:gap-3 mb-3">
                            <span className="text-lg sm:text-xl text-red-600 font-semibold text-gray-900">
                              {listing.price?.toLocaleString("vi-VN")}₫
                            </span>
                            {listing.area && (
                              <>
                                <span className="text-gray-400">•</span>
                                <span className="text-xs sm:text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                  {listing.area}m²
                                </span>
                              </>
                            )}
                          </div>

                          {/* Time and Priority */}
                          <div className="flex items-center gap-2 mb-3 text-xs sm:text-sm text-gray-500">
                            <ClockIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="line-clamp-1">
                              {listing.createdAt
                                ? new Date(listing.createdAt).toLocaleString(
                                    "vi-VN",
                                    {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )
                                : ""}
                            </span>
                            <span className="text-gray-400">•</span>
                            {listing.boost_status == "active" ? (
                              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                Tin ưu tiên
                              </span>
                            ) : (
                              ""
                            )}
                          </div>

                          {/* User Info */}
                          <div className="flex items-center justify-between mt-auto">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <Avatar className="w-6 h-6 sm:w-8 sm:h-8">
                                <AvatarImage src={listing?.owner?.avatar_url} />
                                <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                                  CN
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-xs sm:text-sm text-gray-900">
                                {listing.owner.identity_card.full_name}
                                </p>
                                <p className="text-xs text-gray-500">Đang hoạt động</p>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <Link href={`/chat/${listing.housing_area.owner_id}`}>
                              <button className="px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                                Liên hệ
                              </button>
                              </Link>
                              
                              <Link href={`/user/room/${listing._id}`}>
                              <button className="px-3 py-1.5 text-sm text-white bg-red-600 rounded hover:bg-red-700 transition-colors">
                                Chi tiết
                              </button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="my-6 sm:my-8">
              <PagingPage setPage={setPage} page={page} totalpage={totalpage} />
            </div>
          </div>
          {/* Sidebar */}
          <div className="order-1 lg:order-2 space-y-3 sm:space-y-4 lg:sticky lg:top-4">
            {/* Area Filter */}
            <Card className="pt-3">
              <CardContent className="p-3 sm:p-4">
                <div>
                  <button
                    onClick={() => setShowMoneyFilter(!showMoneyFilter)}
                    className="flex items-center justify-between w-full mb-3"
                  >
                    <h3 className="font-medium text-sm sm:text-base">
                      Lọc theo diện tích
                    </h3>
                    <span
                      className={`${showMoneyFilter ? "text-red-400" : ""} text-sm`}
                    >
                      {showMoneyFilter ? "▲" : "▼"}
                    </span>
                  </button>
                  {showMoneyFilter && (
                    <>
                      <div>
                        <Slider
                          value={areaRange}
                          min={0}
                          max={100}
                          step={1}
                          onValueChange={(newRange: number[]) =>
                            setAreaRange(newRange)
                          }
                        />
                      </div>
                      <div className="mt-2 flex justify-between text-xs sm:text-sm">
                        <span>{areaRange[0]} m²</span>
                        <span>{areaRange[1]} m²</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
            {/* Price Filter */}
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div>
                  <button
                    onClick={() => setShowAreaFilter(!showAreaFilter)}
                    className="flex items-center justify-between w-full mb-3"
                  >
                    <h3 className="font-medium text-sm sm:text-base">
                      Lọc theo giá
                    </h3>
                    <span
                      className={`${showAreaFilter ? "text-red-400" : ""} text-sm`}
                    >
                      {showAreaFilter ? "▲" : "▼"}
                    </span>
                  </button>
                  {showAreaFilter && (
                    <>
                      <div>
                        <Slider
                          value={range}
                          min={0}
                          max={6000000}
                          step={200000}
                          onValueChange={(newRange: number[]) =>
                            setRange(newRange)
                          }
                        />
                      </div>
                      <div className="mt-2 flex justify-between text-xs sm:text-sm">
                        <span>{range[0].toLocaleString()}₫</span>
                        <span>{range[1].toLocaleString()}₫</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
            {/* Furniture Status Filter */}
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div>
                  <button
                    onClick={() => setShowConditionFilter(!showConditionFilter)}
                    className="flex items-center justify-between w-full mb-3"
                  >
                    <h3 className="font-medium text-sm sm:text-base">
                      Lọc theo tiện nghi
                    </h3>
                    <span
                      className={`${showConditionFilter ? "text-red-400" : ""} text-sm`}
                    >
                      {showConditionFilter ? "▲" : "▼"}
                    </span>
                  </button>
                  {showConditionFilter && (
                    <div className="space-y-2">
                      {fixedFacilityCodes.map((code) => (
                        <label
                          key={code}
                          className="flex items-center space-x-2 cursor-pointer"
                        >
                          <Checkbox
                            checked={selectedFacilities.includes(
                              code.toString()
                            )}
                            onCheckedChange={() =>
                              handleFacilityChange(code.toString())
                            }
                          />
                          <span className="text-xs sm:text-sm">
                            {FacilityCodeMap[code]}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            {/* Sort By Filter */}
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div>
                  <button
                    onClick={() => setShowSortby(!showSortby)}
                    className="flex items-center justify-between w-full mb-3"
                  >
                    <h3 className="font-medium text-sm sm:text-base">
                      Sắp xếp
                    </h3>
                    <span
                      className={`${!showSortby ? "text-red-400" : ""} text-sm`}
                    >
                      {!showSortby ? "▲" : "▼"}
                    </span>
                  </button>
                  {!showSortby && (
                    <>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2 text-sm"
                      >
                        {sortFields.map((field) => (
                          <option key={field.value} value={field.value}>
                            {field.label}
                          </option>
                        ))}
                      </select>
                      <select
                        value={sortByOrder}
                        onChange={(e) => setSortByOrder(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        {sortOrders.map((order) => (
                          <option key={order.value} value={order.value}>
                            {order.label}
                          </option>
                        ))}
                      </select>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
            {/* Room Type Filter */}
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col w-full">
                  <div className="flex items-center justify-between w-full mb-3">
                    <h3 className="font-medium text-sm sm:text-base">
                      Lọc theo loại phòng
                    </h3>
                    <button
                      onClick={() =>
                        setShowFilterByRoomType(!showFilterByRoomType)
                      }
                      className="flex items-center"
                    >
                      <span
                        className={`${!showFilterByRoomType ? "text-red-400" : ""} text-sm`}
                      >
                        {!showFilterByRoomType ? "▲" : "▼"}
                      </span>
                    </button>
                  </div>
                  {!showFilterByRoomType && (
                    <div className="flex flex-col space-y-2">
                      {["SINGLE", "COUPLE"].map((type) => (
                        <label
                          key={type}
                          className="flex items-center space-x-2 cursor-pointer"
                        >
                          <Checkbox
                            checked={selectedTypes === type}
                            onCheckedChange={() => {
                              setSelectedTypes((prev) =>
                                prev === type ? "" : type
                              );
                            }}
                          />
                          <span className="text-xs sm:text-sm">{roomTypeLabels[type] || type}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main page component
export default function SearchPage() {
  return (
    <Suspense
      fallback={<Loader2 className="animate-spin h-6 w-6 text-white mx-auto" />}
    >
      <SearchContent />
    </Suspense>
  );
}

export const dynamic = "force-dynamic";
