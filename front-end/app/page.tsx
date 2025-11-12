"use client";

import bgHome from "@/assets/bg-home-2.jpg";
import darkBgHome from "@/assets/dark-bg.jpg";
import Footer from "@/components/footer";
import HeaderAuth from "@/components/header-auth-client";
import SearchHeader from "@/components/header-search";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Card, CardContent } from "@/components/ui/card";
import { useGetHousingAreaById } from "@/queries/housing-area.queries";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useGetBoostingRooms,
  useGetTopHousingAreasWithRooms,
} from "@/queries/room.queries";
import { roboto } from "@/utils/constants/font";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Star, Square, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Room } from "@/lib/type";
import { useEffect } from "react";
import { useUserStore } from "@/store/useUserStore";

// Best Seller Skeleton Component
const BestSellerSkeleton = () => (
  <div className="bg-background rounded pb-4 w-full max-w-6xl mx-auto mt-8 p-2">
    <div className="flex items-center gap-2 mb-4">
      <Skeleton className="h-6 w-24" />
    </div>
    <hr className="mb-5" />
    <Carousel className="w-full">
      <CarouselContent>
        {Array.from({ length: 8 }).map((_, index) => (
          <CarouselItem
            key={`bestseller-skeleton-${index}`}
            className="pb-3 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
          >
            <Card className="h-[350px] flex flex-col overflow-hidden border-0 shadow-md bg-white dark:bg-background">
              <div className="relative overflow-hidden">
                {/* Image skeleton */}
                <Skeleton className="w-full h-40" />

                {/* Top left badge skeleton */}
                <div className="absolute top-3 left-3">
                  <Skeleton className="h-6 w-16 rounded" />
                </div>

                {/* Top right badge skeleton */}
                <div className="absolute top-3 right-3">
                  <Skeleton className="h-6 w-12 rounded" />
                </div>

                {/* Bottom left boosted badge skeleton */}
                <div className="absolute bottom-3 left-3">
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>

              <CardContent className="flex-1 flex flex-col p-4 space-y-2">
                {/* Title skeleton */}
                <Skeleton className="h-5 w-full mb-1" />

                {/* Housing area name skeleton */}
                <Skeleton className="h-3 w-3/4 mb-1" />

                {/* Address skeleton */}
                <Skeleton className="h-3 w-full mb-1" />

                {/* Room details skeleton */}
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-3 w-3" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-3 w-3" />
                    <Skeleton className="h-3 w-4" />
                  </div>
                </div>

                {/* Price skeleton */}
                <div className="border-t pt-2 mt-auto">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-3 w-12 mt-1" />
                </div>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  </div>
);

// Suggestion Skeleton Component
const SuggestionSkeleton = () => (
  <div className="w-full max-w-6xl mx-auto bg-background my-5 px-2 rounded">
    <div className="flex items-center gap-2 py-2">
      <Skeleton className="h-6 w-32" />
    </div>
    <hr className="mb-5" />

    <div className="pb-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 w-full gap-4">
      {Array.from({ length: 10 }).map((_, index) => (
        <Card
          key={`suggestion-skeleton-${index}`}
          className="flex flex-col overflow-hidden border-0 shadow-md bg-white dark:bg-background"
        >
          <div className="relative overflow-hidden">
            {/* Image skeleton */}
            <Skeleton className="w-full h-40" />

            {/* Top left badge skeleton */}
            <div className="absolute top-3 left-3">
              <Skeleton className="h-6 w-16 rounded" />
            </div>

            {/* Top right badge skeleton */}
            <div className="absolute top-3 right-3">
              <Skeleton className="h-6 w-12 rounded" />
            </div>
          </div>

          <CardContent className="flex-1 flex flex-col p-4 space-y-2">
            {/* Title skeleton */}
            <Skeleton className="h-5 w-full mb-1" />

            {/* Star rating skeleton */}
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton
                  key={`star-skeleton-${i}`}
                  className="h-4 w-4 rounded"
                />
              ))}
              <Skeleton className="h-3 w-8 ml-1" />
            </div>

            {/* Area name skeleton */}
            <Skeleton className="h-3 w-3/4 mb-1" />

            {/* Address skeleton */}
            <Skeleton className="h-3 w-full mb-1" />

            {/* Room details skeleton */}
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-1">
                <Skeleton className="h-3 w-3" />
                <Skeleton className="h-3 w-8" />
              </div>
              <div className="flex items-center gap-1">
                <Skeleton className="h-3 w-3" />
                <Skeleton className="h-3 w-4" />
              </div>
            </div>

            {/* Price skeleton */}
            <div className="border-t pt-2 mt-auto">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-3 w-12 mt-1" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Load more button skeleton */}
    <div className="flex justify-center py-6">
      <Skeleton className="h-10 w-24 rounded" />
    </div>
  </div>
);

export default function Home() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [visibleCount, setVisibleCount] = useState(10);
  const pathname = usePathname();
  const router = useRouter();
  const { theme } = useTheme();
  const [topN, setTopN] = useState<number>(12);
  const [showAdminButton, setShowAdminButton] = useState(false);
  const { userRole } = useUserStore();

  // Check userRole from both store and localStorage for immediate response
  useEffect(() => {
    const checkAdminRole = () => {
      // Check from Zustand store first
      if (userRole === "admin") {
        setShowAdminButton(true);
        return;
      }
      
      // Fallback to localStorage for immediate check
      if (typeof window !== "undefined") {
        const roleData = localStorage.getItem("user-store");
        if (roleData) {
          try {
            const role = JSON.parse(roleData);
            if (role?.state?.userRole === "admin") {
              setShowAdminButton(true);
            }
          } catch (error) {
            console.error("Error parsing localStorage:", error);
          }
        }
      }
    };

    checkAdminRole();
  }, [userRole]);

  const handleAdminRedirect = () => {
    router.push("/admin/manage/user");
  };

  const handleSearch = (value?: string) => {
    const query = value ?? searchQuery;
    if (pathname !== "/search") {
      router.push(`/search?query=${encodeURIComponent(query)}`);
    } else {
      router.push(`/search?query=${encodeURIComponent(query)}&page=1`);
    }
  };

  const { data: roomHighestRating, isLoading: isLoadingRooms } =
    useGetTopHousingAreasWithRooms(topN);
  const { data: boostingRooms, isLoading: isLoadingBoosting } =
    useGetBoostingRooms();

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  // Best Seller Card subcomponent
  function BestSellerCard({ room }: { room: Room }) {
    const { data: housingArea, isLoading } = useGetHousingAreaById(
      room.housing_area_id
    );
    return (
      <Card className="h-[350px] flex flex-col overflow-hidden hover:shadow-lg transition-all duration-300 group border-0 shadow-md bg-white dark:bg-background">
        <div className="relative overflow-hidden">
          <img
            src={room.images?.[0]?.url || "/default.jpg"}
            alt={room.title}
            className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 left-3">
            <span
              className={cn(
                "text-xs font-medium px-2 py-1 rounded",
                room.type === "COUPLE"
                  ? "bg-pink-100 text-pink-800 hover:bg-pink-200 dark:bg-pink-900 dark:text-pink-200"
                  : room.type === "SINGLE"
                    ? "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200"
              )}
            >
              {room.type === "COUPLE"
                ? "Phòng đôi"
                : room.type === "SINGLE"
                  ? "Phòng đơn"
                  : room.type}
            </span>
          </div>
          <div className="absolute top-3 right-3">
            <span className="bg-white/90 text-xs px-2 py-1 rounded shadow">
              {room.room_number || "N/A"}
            </span>
          </div>
          <div className="absolute bottom-3 left-3">
            <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
              ⭐ NỔI BẬT
            </span>
          </div>
        </div>
        <CardContent className="flex-1 flex flex-col p-4 space-y-2">
          <h3 className="font-semibold text-base text-foreground line-clamp-1 mb-1">
            {room.title}
          </h3>
          <p className="text-xs text-secondary-foreground line-clamp-1 mb-1">
            {isLoading ? "Đang tải..." : housingArea?.name || "Khu trọ"}
          </p>
          <p className="text-xs text-secondary-foreground line-clamp-1 mb-1">
            {isLoading
              ? "Đang tải địa chỉ..."
              : housingArea?.address ||
                housingArea?.location?.address ||
                "Địa chỉ"}
          </p>
          <div className="flex items-center gap-3 text-xs text-secondary-foreground mb-2">
            <div className="flex items-center gap-1">
              <Square className="h-3 w-3" />
              <span>{room.area || 0}m²</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{room.max_occupancy || 1}</span>
            </div>
          </div>
          <div className="border-t pt-2 mt-auto">
            <span className="text-lg font-bold text-red-600">
              {room.price?.toLocaleString() || "N/A"} đ
            </span>
            <span className="text-xs text-secondary-foreground ml-1">
              /tháng
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <nav className="bg-background w-full flex justify-center items-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
          <div className="flex gap-5 items-center font-semibold"></div>
          <HeaderAuth />
        </div>
        <ThemeSwitcher />
      </nav>

      {/* Background */}
      <div
        className="fixed inset-0 w-full h-full -z-10"
        style={{
          backgroundImage: `url(${
            theme === "dark" ? darkBgHome.src : bgHome.src
          })`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Admin Button */}
      {showAdminButton && (
        <div
          style={{
            position: "fixed",
            top: 100,
            right: 32,
            zIndex: 1000,
          }}
          className="hidden sm:flex items-center animate-fade-in"
        >
          <button
            onClick={handleAdminRedirect}
            className="bg-red-600 hover:bg-red-700 rounded-full p-4 shadow-lg text-white transition hover:scale-110"
            title="Đi tới trang quản trị"
          >
            <ArrowRight className="w-8 h-8" />
          </button>
        </div>
      )}
      <SearchHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearch}
      />

      {/* Best Seller Section */}
      {isLoadingBoosting ? (
        <BestSellerSkeleton />
      ) : (
        <div className="bg-background rounded pb-4 w-full max-w-6xl mx-auto mt-8 p-2">
          <p className="text-lg font-semibold">
            <span className={cn(roboto.className)}>Phòng nổi bật</span>
          </p>
          <hr className="mb-5" />
          <Carousel className="w-full">
            <CarouselContent>
              {boostingRooms?.slice(0, 8).map((room: Room, index: number) => (
                <CarouselItem
                  key={room._id || room.id || `boosting-room-${index}`}
                  className="pb-3 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
                >
                  <Link href={`/user/room/${room._id}`}>
                    <BestSellerCard room={room} />
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      )}

      {/* Suggestion Section */}
      {isLoadingRooms ? (
        <SuggestionSkeleton />
      ) : (
        <div className="w-full max-w-6xl mx-auto bg-background my-5 px-2 rounded">
          <p className="text-lg font-semibold py-2">
            <span className={cn(roboto.className)}>Gợi ý cho bạn</span>
          </p>
          <hr className="mb-5" />
          {(() => {
            const roomsWithAreaInfo =
              roomHighestRating?.flatMap((area: any) =>
                area.rooms.map((room: any) => ({
                  ...room,
                  areaName: area.name,
                  areaAddress: area.address,
                  avgRating: area.avgRating,
                }))
              ) || [];

            if (!roomsWithAreaInfo.length) {
              return (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Hiện chưa có phòng nào</p>
                </div>
              );
            }

            const getRoomTypeColor = (type: string) => {
              switch (type) {
                case "COUPLE":
                  return "bg-pink-100 text-pink-800 hover:bg-pink-200 dark:bg-pink-900 dark:text-pink-200";
                case "SINGLE":
                  return "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200";
                default:
                  return "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200";
              }
            };

            const getRoomTypeLabel = (type: string) => {
              switch (type) {
                case "COUPLE":
                  return "Phòng đôi";
                case "SINGLE":
                  return "Phòng đơn";
                default:
                  return type;
              }
            };

            const StarRating = ({ rating }: { rating: number }) => (
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={`star-rating-${i}`}
                    className={cn(
                      "h-4 w-4",
                      i < Math.round(rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-200 text-gray-200"
                    )}
                  />
                ))}
                <span className="text-xs text-muted-foreground ml-1">
                  ({rating})
                </span>
              </div>
            );

            return (
              <>
                <div className="pb-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 w-full gap-4">
                  {roomsWithAreaInfo
                    .slice(0, visibleCount)
                    .map((room: any, idx: number) => (
                      <Link
                        href={`/user/room/${room._id}`}
                        key={room._id || `suggestion-room-${idx}`}
                      >
                        <Card className="h-[350px] flex flex-col overflow-hidden hover:shadow-lg transition-all duration-300 group border-0 shadow-md bg-white dark:bg-background">
                          <div className="relative overflow-hidden">
                            <img
                              src={room.images?.[0]?.url}
                              alt={room.title}
                              className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-3 left-3">
                              <span
                                className={cn(
                                  "text-xs font-medium px-2 py-1 rounded",
                                  getRoomTypeColor(room.type)
                                )}
                              >
                                {getRoomTypeLabel(room.type)}
                              </span>
                            </div>
                            <div className="absolute top-3 right-3">
                              <span className="bg-white/90 text-xs px-2 py-1 rounded shadow">
                                {room.room_number}
                              </span>
                            </div>
                          </div>
                          <CardContent className="flex-1 flex flex-col p-4 space-y-2">
                            <h3 className="font-semibold text-base text-foreground line-clamp-1 mb-1">
                              {room.title}
                            </h3>

                            <StarRating rating={room.avgRating} />
                            <p className="text-xs text-secondary-foreground line-clamp-1 mb-1">
                              {room.areaName}
                            </p>
                            <p className="text-xs text-secondary-foreground line-clamp-1 mb-1">
                              {room.areaAddress}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-secondary-foreground mb-2">
                              <div className="flex items-center gap-1">
                                <Square className="h-3 w-3" />
                                <span>{room.area}m²</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>{room.max_occupancy}</span>
                              </div>
                            </div>
                            <div className="border-t pt-2 mt-auto">
                              <span className="text-lg font-bold text-red-600">
                                {room.price?.toLocaleString()} đ
                              </span>
                              <span className="text-xs text-secondary-foreground ml-1">
                                /tháng
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                </div>
                {visibleCount < roomsWithAreaInfo.length && (
                  <div className="flex justify-center py-6">
                    <button
                      className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-semibold transition"
                      onClick={handleLoadMore}
                    >
                      Xem thêm
                    </button>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      <Footer />
    </>
  );
}