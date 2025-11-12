"use client";

import NotFound from "@/components/not-found";
import SimpleMap from "@/components/simple-map";
import RoomDetailSkeleton from "@/components/skeleton/room-detail-skeleton-2";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { SimpleBreadcrumb } from "@/components/ui/simple-breadcrumb";
import { createClient } from "@/lib/client";
import { RoomImage } from "@/lib/type";
import { useGetHousingAreaById } from "@/queries/housing-area.queries";
import {
  useGetRoomDetailByRoomId,
  useGetRoomsByHousingAreaId,
  useAddSavedRoom, // import hook
} from "@/queries/room.queries";
import { useGetOneUser, useUpdateChatWithUser } from "@/queries/user.queries";
import { useUserStore } from "@/store/useUserStore";
import { FacilityCodeMap } from "@/utils/constants/facility-codes";
import { useLoadScript } from "@react-google-maps/api";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import {
  BedDouble,
  BedSingle,
  Bookmark,
  ClockIcon,
  Handshake,
  HousePlus,
  MapPin,
  MessagesSquare,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const ROOM_TYPE_LABELS: Record<string, string> = {
  SINGLE: "Phòng đơn",
  COUPLE: "Phòng đôi",
};

export default function page() {
  const { roomId } = useParams();
  const { data: room, isLoading: isGetRoomDetailLoading } =
    useGetRoomDetailByRoomId(String(roomId));
  const landlordId = room?.housing_area?.owner_id;
  const router = useRouter();
  const { data: landlordDetail, isLoading: isLoadingLandlordDetail } =
    useGetOneUser(landlordId);
  const currentUserId = useUserStore((state) => state.userId);
  const { data: currentUserDetail, isLoading: isLoadingCurrentUserDetail } =
    useGetOneUser(currentUserId);
  const updateChatWithUserMutation = useUpdateChatWithUser(landlordId);
  const supabase = createClient();
  const [landlordData, setLandlordData] = useState<any>(null);
  const [mainImgIdx, setMainImgIdx] = useState(0);
  const [fade, setFade] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: rooms } = useGetRoomsByHousingAreaId(
    room?.housing_area_id ? String(room.housing_area_id) : undefined
  );
  const {
    data: housingAreaDetails,
    isLoading: isHousingAreaLoading,
    error: housingAreaError,
  } = useGetHousingAreaById(
    room?.housing_area_id ? String(room.housing_area_id) : undefined
  );
  const descriptionLines = room?.housing_area?.description.split("\n");
  const toggleDescription = () => {
    setIsExpanded(!isExpanded);
  };

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ["places"],
  });

  const updatedAt = room?.updatedAt || room?.createdAt;
  const timeAgo = useMemo(() => {
    const updatedAt = room?.updatedAt || room?.createdAt;
    return updatedAt
      ? formatDistanceToNow(new Date(updatedAt), {
          addSuffix: true,
          locale: vi,
        })
      : "Không rõ thời gian";
  }, [room?.updatedAt, room?.createdAt]);

  const breadcrumbItems = [
    { name: "Trang chủ", href: "/" },
    { name: "Chi tiết phòng" },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      if (!landlordId) return;
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("auth_user_id", landlordId)
        .single();
      setLandlordData(data);
    };
    fetchUser();
  }, [supabase, landlordId]);

  const onChatClick = async () => {
    // Save landlordId to chat_with_users of current user
    // Save landlordId to chat_with_users of current user
    await updateChatWithUserMutation
      .mutateAsync()
      .then(() => {
        console.log("Chat with user updated successfully");
        router.push(`/chat/${landlordId}`);
      })
      .catch((error) => {
        console.error("Error updating chat with user:", error);
      });
  };

  const addSavedRoom = useAddSavedRoom();
  const handleSave = () => {
    if (!roomId) return;
    addSavedRoom
      .mutateAsync(String(roomId))
      .then(() => {
        toast.success("Đã lưu phòng thành công!");
      })
      .catch((error: any) => {
        toast.error(error?.message || "Lưu phòng thất bại!");
      });
  };

  if (isGetRoomDetailLoading || !room) {
    return <RoomDetailSkeleton />;
  }

  if (isHousingAreaLoading || !housingAreaDetails) {
    return <RoomDetailSkeleton />;
  }

  const onRoomClick = (roomId: string) => {
    router.push(`/user/room/${roomId}`);
  };

  const handleChangeMainImg = (idx: number) => {
    if (idx === mainImgIdx) return;
    setFade(false);
    setTimeout(() => {
      setMainImgIdx(idx);
      setFade(true);
    }, 200);
  };

  if (housingAreaError) return <NotFound />;

  if (
    isHousingAreaLoading ||
    isLoadingLandlordDetail ||
    isLoadingCurrentUserDetail
  ) {
    return <RoomDetailSkeleton />;
  }
  console.log(room);
  return (
    <div className="bg-primary-foreground pb-4">
      <div className="max-w-5xl mx-auto pt-6 pl-4">
        <SimpleBreadcrumb items={breadcrumbItems} />
      </div>
      <div className="grid grid-cols-3 gap-6 justify-center items-start max-w-5xl mx-auto ">
        {/* Room Detail */}
        <div className="col-span-2">
          <div className=" rounded-lg bg-background shadow-lg p-5">
            <div className="flex-1 flex flex-col gap-4">
              {/* Main image with fade transition */}
              {room && room.images && room.images.length > 0 && (
                <div className="w-full h-72 md:h-96 rounded-t-lg flex items-center justify-center overflow-hidden mb-2">
                  <img
                    src={room.images[mainImgIdx]?.url}
                    alt={
                      room.images[mainImgIdx]?.caption ||
                      `Ảnh phòng ${mainImgIdx + 1}`
                    }
                    className={`object-cover w-full h-full transition-all duration-300 ${fade ? "opacity-100" : "opacity-0"}`}
                    style={{ willChange: "opacity, transform" }}
                  />
                </div>
              )}
              {/* Carousel thumbnails */}
              {room && room.images && room.images.length > 0 && (
                <Carousel className="w-full">
                  <CarouselContent>
                    {room.images.map((img: RoomImage, idx: number) => (
                      <CarouselItem
                        key={idx}
                        className="basis-1/4"
                        onClick={() => handleChangeMainImg(idx)}
                      >
                        <div className="p-1">
                          <Card
                            className={`cursor-pointer border-2 transition-all duration-200 ${
                              mainImgIdx === idx
                                ? "border-green-500 scale-105"
                                : "border-transparent opacity-70 hover:opacity-100"
                            }`}
                          >
                            <CardContent className="flex aspect-video items-center justify-center p-0">
                              <img
                                src={img?.url}
                                alt={img.caption || `Ảnh thu nhỏ ${idx + 1}`}
                                className="object-cover w-full h-24 rounded-lg"
                              />
                            </CardContent>
                          </Card>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              )}
            </div>

            {/* Room Information */}
            <div className="p-4">
              <h2 className="text-2xl font-bold text-foreground">{`Phòng: ${room?.room_number} - ${room?.title}`}</h2>
              <div className="flex flex-row items-center my-2">
                <span className="font-semibold text-lg text-red-600 relative after:content-['•'] after:mx-2 after:text-gray-500">
                  {room?.price.toLocaleString("vi-VN")} đ
                </span>

                <span className="font-semibold text-lg text-secondary-foreground">
                  {room?.area} m²
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex flex-row gap-3 items-start text-secondary-foreground">
                  {room?.type === "SINGLE" ? (
                    <>
                      <BedSingle className="w-4 h-4" />
                      <Badge className="bg-blue-600 hover:bg-blue-700 text-white">
                        {ROOM_TYPE_LABELS[room.type] || room.type}
                      </Badge>
                    </>
                  ) : (
                    <>
                      <BedDouble className="w-5 h-5" />
                      <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
                        {ROOM_TYPE_LABELS[room.type] || room.type}
                      </Badge>
                    </>
                  )}
                </div>
                <div className="flex flex-row gap-3 items-start text-secondary-foreground mt-1">
                  <HousePlus className="w-4 h-4 mt-1" />
                  <span className="text-secondary-foreground max-w-lg">
                    {room?.facilities && room?.facilities.length > 0 ? (
                      room?.facilities.map((f: any) => (
                        <Badge
                          key={f.code}
                          className="bg-background hover:bg-primary-foreground text-foreground border border-foreground/50 px-3 py-1 mb-1 mr-1"
                        >
                          {FacilityCodeMap[f.code] || f.name}
                          {f.quantity > 1 ? ` x${f.quantity}` : ""}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-gray-400">Chưa có tiện ích.</span>
                    )}
                  </span>
                </div>
                <div className="flex flex-row gap-3 items-start text-secondary-foreground">
                  <MapPin className="w-4 h-4 mt-1" />
                  <span className="text-secondary-foreground">
                    {housingAreaDetails.location ? (
                      <span>{`${housingAreaDetails.location.address}, ${housingAreaDetails.location.district}, ${housingAreaDetails.location.city}`}</span>
                    ) : (
                      "123 Đường Chính, Thành phố"
                    )}
                  </span>
                </div>
                <div className="flex flex-row gap-3 items-center text-secondary-foreground">
                  <ClockIcon className="w-4 h-4" />
                  <span>Cập nhật {timeAgo}</span>
                </div>
              </div>

              <div className="mt-10">
                <h2 className="text-xl font-bold mb-4">Mô tả chi tiết</h2>
                {descriptionLines && (
                  <>
                    {descriptionLines
                      .slice(
                        0,
                        isExpanded
                          ? descriptionLines.length
                          : Math.ceil(descriptionLines.length / 2)
                      )
                      ?.map((line: any, index: number) => (
                        <p key={index} className="mb-2">
                          {line}
                        </p>
                      ))}
                    <Button
                      onClick={toggleDescription}
                      className="bg-red-600 hover:bg-red-700 text-white w-1/6"
                    >
                      {isExpanded ? "Thu gọn" : "Xem thêm"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Chat & Comment */}
        <div className="flex flex-col gap-6 sticky top-20 z-30">
          {/* Chat */}
          <div className="bg-background pb-4 rounded-lg shadow-lg">
            <div className="flex gap-2 items-center pl-4 my-4">
              {/* Avatar */}
              <Avatar className="w-[50px] h-[50px]">
                <AvatarImage
                  src={
                    landlordDetail?.avatar_url ||
                    "https://github.com/shadcn.png"
                  }
                  className="object-cover"
                />
                <AvatarFallback>CT</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xl font-semibold text-foreground">
                  {landlordData?.name || "Chưa cập nhật"}
                </p>
                <p className="text-sm text-secondary-foreground/60 font-semibold">
                  Chủ trọ
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-2 px-4">
              <Button
                variant={"outline"}
                className="w-full mt-2 bg-red-500 hover:bg-red-600 text-white hover:text-white"
                onClick={handleSave}
              >
                <Bookmark className="mr-2" /> Lưu phòng
              </Button>
              <Button
                variant={"outline"}
                className="w-full"
                onClick={onChatClick}
              >
                <MessagesSquare className="mr-2" />
                Trò chuyện
              </Button>
              {currentUserDetail?.verified ? (
                <Button
                  className="w-full bg-green-500 hover:bg-green-600 text-white hover:text-white"
                  onClick={() => router.push(`${roomId}/rent`)}
                >
                  <Handshake className="mr-2" />
                  Đặt thuê ngay
                </Button>
              ) : (
                <Button
                  variant={"outline"}
                  className="w-full bg-green-500 hover:bg-green-600 text-white hover:text-white"
                  onClick={() => router.push(`/user/${currentUserId}`)}
                >
                  <Handshake className="mr-2" />
                  Xác minh tài khoản để thuê
                </Button>
              )}
              <Button
                variant={"outline"}
                className="w-full"
                onClick={() =>
                  router.push(`/user/housing-area/${room?.housing_area_id}`)
                }
              >
                Xem khu trọ
              </Button>
            </div>
          </div>
          {/* Comment */}
          {/* <div className="bg-background rounded-lg  p-4 shadow-lg flex flex-col items-center justify-center"></div> */}
        </div>
      </div>
      <div className="max-w-5xl mx-auto mt-4">
        {/* Map */}
        <div className="rounded-lg bg-background shadow-lg">
          <SimpleMap
            lat={housingAreaDetails.location?.lat}
            lng={housingAreaDetails.location?.lng}
            isLoaded={isLoaded}
          />
        </div>

        {/* Similar postings */}
        <div className="rounded-lg bg-background shadow-lg mt-4 p-4">
          <h2 className="text-xl font-bold mb-4">Phòng tương tự</h2>
          <Carousel className="w-full">
            <CarouselContent>
              {rooms?.map((room: any) => (
                <CarouselItem
                  key={room.id}
                  className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/4 cursor-pointer"
                  onClick={() => onRoomClick(String(room.id))}
                >
                  <div>
                    <Card className="my-2 h-[300px] flex flex-col p-2 bg-background border-none shadow-md rounded-none">
                      <img
                        src={
                          room?.images[0]?.url ||
                          "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"
                        }
                        // src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"
                        alt={room.title}
                        className="flex-none w-full object-cover mb-2  h-[146px]"
                      />
                      <CardContent className="flex-1 flex flex-col p-1">
                        <span className="text-base font-semibold ">
                          {`Phòng: ${room?.room_number} - ${room?.title}`}
                        </span>
                        <div className="flex flex-row items-center mt-1">
                          <span className="text-red-600 relative after:content-['•'] after:mx-1 after:text-gray-500 text-sm font-bold">
                            {room.price.toLocaleString("vi-VN")} đ/tháng
                          </span>
                          <span className="text-xs font-bold text-secondary-foreground">
                            {room.area} m²
                          </span>
                        </div>
                        <div className="flex flex-row items-center gap-2 mt-1">
                          <span className="text-sm font-bold text-secondary-foreground">
                            Loại: {" "}
                          </span>
                          <Badge
                            className={
                              room.type === "SINGLE"
                                ? "bg-blue-600 hover:bg-blue-700 text-white"
                                : "bg-yellow-500 hover:bg-yellow-600 text-white"
                            }
                          >
                            {ROOM_TYPE_LABELS[room.type] || room.type}
                          </Badge>
                        </div>

                        <div className="flex flex-row items-center mt-1">
                          <span className="text-sm font-bold text-secondary-foreground">
                            Số người tối đa: {room.max_occupancy ? room.max_occupancy : ""} người
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        {/* Other ads */}
        <div className="rounded-lg bg-background shadow-lg mt-4 p-4">
          <h2 className="text-xl font-bold mb-4">
            Tin khác từ {landlordData?.name || "Chưa cập nhật"}
          </h2>
          <Carousel className="w-full">
            <CarouselContent>
              {rooms?.map((room: any) => (
                <CarouselItem
                  key={room.id}
                  className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/4 cursor-pointer"
                  onClick={() => onRoomClick(String(room.id))}
                >
                  <div>
                    <Card className="my-2 h-[300px] flex flex-col p-2 bg-background border-none shadow-md rounded-none">
                      <img
                        src={
                          room?.images[0]?.url ||
                          "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"
                        }
                        //src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"
                        alt={room.title}
                        className="flex-none w-full object-cover mb-2  h-[146px]"
                      />
                      <CardContent className="flex-1 flex flex-col p-1">
                        <span className="text-base font-semibold ">
                          {`Phòng: ${room?.room_number} - ${room?.title}`}
                        </span>
                        <div className="flex flex-row items-center mt-1">
                          <span className="text-red-600 relative after:content-['•'] after:mx-1 after:text-gray-500 text-sm font-bold">
                            {room.price.toLocaleString("vi-VN")} đ/tháng
                          </span>
                          <span className="text-xs font-bold text-secondary-foreground">
                            {room.area} m²
                          </span>
                        </div>
                        <div className="flex flex-row items-center gap-2 mt-1">
                          <span className="text-sm font-bold text-secondary-foreground">
                            Loại: {" "}
                          </span>
                          <Badge
                            className={
                              room.type === "SINGLE"
                                ? "bg-blue-600 hover:bg-blue-700 text-white"
                                : "bg-yellow-500 hover:bg-yellow-600 text-white"
                            }
                          >
                            {ROOM_TYPE_LABELS[room.type] || room.type}
                          </Badge>
                        </div>

                        <div className="flex flex-row items-center mt-1 ">
                          <span className="text-sm font-bold text-secondary-foreground ">
                            Số người tối đa: {room.max_occupancy ? room.max_occupancy : ""} người
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </div>
  );
}
