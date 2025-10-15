"use client";

import bg2 from "@/assets/bg-2.png";
import RoomsOfLandlord from "@/components/rooms-review";
import SimpleMap from "@/components/simple-map";
import { Avatar } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  // CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SimpleBreadcrumb } from "@/components/ui/simple-breadcrumb";
import { useGetHousingAreaById } from "@/queries/housing-area.queries";
import { useGetRoomsByHousingAreaId } from "@/queries/room.queries";
import { useGetOneUser } from "@/queries/user.queries";
import { createClient } from "@/utils/supabase/client";
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { useLoadScript } from "@react-google-maps/api";
import { differenceInDays } from "date-fns";
import {
  // Calendar,
  CalendarDays,
  MapPin,
  MessageSquareText,
  ShieldCheck,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import HousingAreaDetailSkeleton from "@/components/skeleton/housing-area-detail-skeleton";
import NotFound from "@/components/not-found";
import { Button } from "@/components/ui/button";
import HousingRatings from "@/components/rating/page";

export default function ReviewHousingArea() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { id: housingAreaId } = useParams();

  const {
    data: housingAreaDetails,
    isLoading: isHousingAreaLoading,
    error: housingAreaError,
  } = useGetHousingAreaById(String(housingAreaId));

  const paramUserId = housingAreaDetails?.owner_id;
  const { data: rooms } = useGetRoomsByHousingAreaId(String(housingAreaId));

  const [user, setUser] = useState<any>(null);
  const { data: userDetail } = useGetOneUser(paramUserId);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ["places"],
  });

  // Calculate joined time
  let joinedText = "No information";
  if (user?.created_at) {
    const createdDate = new Date(user.created_at);
    const days = differenceInDays(new Date(), createdDate);
    joinedText = days > 0 ? `${days} days ago` : "Today";
  }

  const descriptionLines = housingAreaDetails?.description.split("\n");
  const toggleDescription = () => {
    setIsExpanded(!isExpanded);
  };

  useEffect(() => {
    if (!paramUserId) return;
    async function fetchUser() {
      const supabase = createClient();
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("auth_user_id", paramUserId)
        .single();
      if (!error) setUser(user);
    }
    fetchUser();
  }, [paramUserId]);

  const breadcrumbItems = [
    { name: "Home", href: "/" },
    { name: "Housing Area Details" },
  ];

  if (housingAreaError) return <NotFound />;

  if (isHousingAreaLoading || !housingAreaDetails) {
    return <HousingAreaDetailSkeleton />;
  }

  return (
    <div className="bg-primary-foreground min-h-[600px]">
      <div className="max-w-5xl mx-auto px-2 sm:px-4">
        {/* Breadcrumb */}
        <div className="pt-4 sm:pt-6">
          <SimpleBreadcrumb items={breadcrumbItems} />
        </div>
        {/* Cover Image */}
        <div className="h-[200px] sm:h-[300px] lg:h-[400px] w-full mt-2">
          <img
            src={
              housingAreaDetails?.legal_documents[0].url ||
              "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/2024_5_20_638518205896977020_hinh-nen-may-tinh-chill-cover.jpeg"
            }
            className="w-full h-full object-cover rounded-lg"
            alt="cover"
          />
        </div>
        {/* Main Grid */}
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_2fr] gap-4 py-4">
          <div className="flex flex-col gap-4">
            <Card className="h-auto">
              <CardHeader className="relative flex flex-col items-center p-0 pb-4">
                <div className="w-full h-24 sm:h-32 rounded-t-lg overflow-hidden">
                  <img
                    src={bg2.src}
                    alt="Background"
                    className="w-full h-full object-cover opacity-80"
                  />
                </div>
                <div className="absolute top-12 sm:top-16 left-4 w-16 h-16 sm:w-24 sm:h-24">
                  <Avatar className="w-16 h-16 sm:w-24 sm:h-24">
                    <AvatarImage
                      src={
                        userDetail?.avatar_url ||
                        "https://github.com/shadcn.png"
                      }
                      className="rounded-full object-cover"
                    />
                    <AvatarFallback>
                      {user?.full_name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>
                {/* {userDetail?.verified && (
                  <Image
                    src={verified}
                    alt="Verified"
                    className="absolute -top-24 sm:-top-32 -right-24 sm:-right-32 w-20 h-20 sm:w-30 sm:h-30"
                  />
                )} */}
              </CardHeader>
              <CardContent className="mt-8 sm:mt-10 text-xs space-y-2">
                <p className="text-base sm:text-lg font-semibold">
                  {user?.name || "No name"}
                </p>
                {/* <span className="flex items-center gap-2">
                  <MessageCircleMore className="w-4 h-4 sm:w-5 sm:h-5" />
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                  <p className="text-xs sm:text-sm font-bold">4.8</p>
                </span> */}
                <p className="flex items-center gap-2 text-xs sm:text-sm">
                  <MessageSquareText className="w-4 h-4 sm:w-5 sm:h-5" />
                  Feedback chat:{" "}
                  <span className="font-semibold">No information</span>
                </p>
                <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                    <p className="text-xs sm:text-sm">Address: </p>
                  </div>
                  <span className="font-semibold text-xs sm:text-sm sm:mt-1">
                    {housingAreaDetails.location ? (
                      <span>{`${housingAreaDetails.location.address}`}</span>
                    ) : (
                      "123 Main St, City, Country"
                    )}
                  </span>
                </div>
                <p className="flex items-center gap-2 text-xs sm:text-sm">
                  <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5" />
                  Joined: <span className="font-semibold">{joinedText}</span>
                </p>
                <p className="flex items-center gap-2 text-xs sm:text-sm">
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                  Verified:{" "}
                  <span className="font-semibold">
                    {userDetail?.verified ? "Yes" : "No"}
                  </span>
                </p>
              </CardContent>
            </Card>
            <Card className="h-auto">
              <div className="rounded-lg bg-background shadow-lg">
                <SimpleMap
                  lat={housingAreaDetails.location?.lat}
                  lng={housingAreaDetails.location?.lng}
                  isLoaded={isLoaded}
                />
              </div>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">
                Housing Area of {user?.name || "No name"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RoomsOfLandlord rooms={rooms || []} />
            </CardContent>
          </Card>
        </div>
        {/* Description */}
        <div className="gap-4 pb-4">
          <div className="rounded-md bg-background shadow-md p-4 sm:p-6 lg:p-8">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4">
              Detailed description
            </h2>
            <h2 className="text-lg sm:text-xl font-bold mb-4">
              Name: {housingAreaDetails?.name || "No name"}
            </h2>
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
                    <p key={index} className="mb-2 text-sm sm:text-base">
                      {line}
                    </p>
                  )) || "No description"}
                <Button
                  onClick={toggleDescription}
                  className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-1/3 lg:w-1/6 mt-2"
                >
                  {isExpanded ? "See less" : "See more"}
                </Button>
              </>
            )}
          </div>
        </div>
        {/* Community Reviews */}
        <HousingRatings housingId={housingAreaId} />
      </div>
    </div>
  );
}
