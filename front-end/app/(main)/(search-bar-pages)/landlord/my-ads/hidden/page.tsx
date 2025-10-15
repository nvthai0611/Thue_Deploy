"use client";

import RoomAds from "@/components/room/room-item";
import { useGetHousingAreasByUserId } from "@/queries/housing-area.queries";
import { HOUSING_AREA_STATUS } from "@/utils/constants/housing-area-status";

export default function HiddenAds() {
  const { data: hiddenAds } = useGetHousingAreasByUserId(
    HOUSING_AREA_STATUS.UNPUBLISHED
  );

  return <RoomAds ads={hiddenAds} />;
}
