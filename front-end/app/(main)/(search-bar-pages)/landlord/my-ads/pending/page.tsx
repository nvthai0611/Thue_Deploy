"use client";

import RoomAds from "@/components/room/room-item";
import { useGetHousingAreasByUserId } from "@/queries/housing-area.queries";
import { HOUSING_AREA_STATUS } from "@/utils/constants/housing-area-status";

export default function PendingAds() {
  const { data: pendingAds } = useGetHousingAreasByUserId(
    HOUSING_AREA_STATUS.PENDING
  );

  return <RoomAds ads={pendingAds} />;
}
