"use client";

import RoomAds from "@/components/room/room-item";
import { useGetHousingAreasByUserId } from "@/queries/housing-area.queries";
import { HOUSING_AREA_STATUS } from "@/utils/constants/housing-area-status";

export default function RejectedAds() {
  const { data: rejectedAds } = useGetHousingAreasByUserId(
    HOUSING_AREA_STATUS.REJECTED
  );

  return <RoomAds ads={rejectedAds} />;
}
