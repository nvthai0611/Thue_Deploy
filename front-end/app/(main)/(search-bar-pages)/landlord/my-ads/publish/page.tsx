"use client";

import RoomAds from "@/components/room/room-item";
import { useGetHousingAreasByUserId } from "@/queries/housing-area.queries";
import { HOUSING_AREA_STATUS } from "@/utils/constants/housing-area-status";

export default function PublishAds() {
  const { data: publishedAds } = useGetHousingAreasByUserId(
    HOUSING_AREA_STATUS.PUBLISHED
  );

  return <RoomAds ads={publishedAds} />;
}
