"use client";

import RoomAds from "@/components/room/room-item";
import { useGetHousingAreasByUserId } from "@/queries/housing-area.queries";
import { HOUSING_AREA_STATUS } from "@/utils/constants/housing-area-status";

export default function ApprovedAds() {
  const { data: approvedAds } = useGetHousingAreasByUserId(
    HOUSING_AREA_STATUS.APPROVED
  );

  return <RoomAds ads={approvedAds} />;
}
