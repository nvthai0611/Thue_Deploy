"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useGetHousingAreasByUserId } from "@/queries/housing-area.queries";
import { useGetOneUser } from "@/queries/user.queries";
import { useUserStore } from "@/store/useUserStore";
import { HOUSING_AREA_STATUS } from "@/utils/constants/housing-area-status";
import { createClient } from "@/utils/supabase/client";
import { Coins, Loader2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
export default function MyAdsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const { data: publishedAds, isLoading: isLoadingPublished } =
    useGetHousingAreasByUserId(HOUSING_AREA_STATUS.PUBLISHED);
  const { data: approvedAds, isLoading: isLoadingApproved } =
    useGetHousingAreasByUserId(HOUSING_AREA_STATUS.APPROVED);
  const { data: rejectedAds, isLoading: isLoadingRejected } =
    useGetHousingAreasByUserId(HOUSING_AREA_STATUS.REJECTED);
  const { data: pendingAds, isLoading: isLoadingPending } =
    useGetHousingAreasByUserId(HOUSING_AREA_STATUS.PENDING);
  const { data: unpublishedAds, isLoading: isLoadingUnpublished } =
    useGetHousingAreasByUserId(HOUSING_AREA_STATUS.UNPUBLISHED);
  const userId = useUserStore((state) => state.userId);
  const { data: userDetail } = useGetOneUser(userId);
  const supabase = createClient();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("auth_user_id", userId)
        .single();
      setUserData(data);
    };
    fetchUser();
  }, [supabase, userId]);
  const adCounts = {
    publish: publishedAds?.length,
    approved: approvedAds?.length,
    rejected: rejectedAds?.length,
    pending: pendingAds?.length,
    hidden: unpublishedAds?.length,
  };

  const tabs = [
    {
      name: `Publish${adCounts.publish !== undefined ? ` (${adCounts.publish})` : ""}`,
      href: "/landlord/my-ads/publish",
    },
    {
      name: `Approved${adCounts.approved !== undefined ? ` (${adCounts.approved})` : ""}`,
      href: "/landlord/my-ads/approved",
    },
    {
      name: `Rejected${adCounts.rejected !== undefined ? ` (${adCounts.rejected})` : ""}`,
      href: "/landlord/my-ads/rejected",
    },
    {
      name: `Pending${adCounts.pending !== undefined ? ` (${adCounts.pending})` : ""}`,
      href: "/landlord/my-ads/pending",
    },
    {
      name: `Hidden${adCounts.hidden !== undefined ? ` (${adCounts.hidden})` : ""}`,
      href: "/landlord/my-ads/hidden",
    },
  ];

  console.log("User Detail:", userDetail);

  return (
    <div className="bg-primary-foreground min-h-screen">
      <div className="bg-background w-full max-w-4xl mx-auto">
        {/* Upper top part */}
        <div className="h-auto md:h-[150px] grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-0">
          <div className="flex gap-2 items-center pl-4 py-4 md:py-0">
            {/* Avatar */}
            <Avatar className="w-[50px] h-[50px]">
              <AvatarImage
                src={userDetail?.avatar_url || "https://github.com/shadcn.png"}
                className="object-cover"
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xl font-bold text-foreground">
                {userData?.name || "Unknown User"}
              </p>
              <Link href={""} className="text-foreground">
                + Create Store
              </Link>
            </div>
          </div>
          <div className="flex flex-col items-center md:items-end justify-evenly gap-2 md:pr-3 pb-4 md:pb-0">
            <div className="flex items-center rounded bg-primary-foreground px-2 py-1 gap-1 mt-2 md:mt-0">
              <Coins className="w-4 h-4 text-foreground" />
              <p className="text-sm font-semibold text-foreground">
                Remaining: 0
              </p>
              <Button className="w-5 h-5 square bg-red-600 hover:bg-red-700 text-white flex items-center justify-center p-0">
                +
              </Button>
            </div>
          </div>
        </div>
        {/* Lower top part */}
        <div className="border-t h-auto">
          <div className="flex flex-nowrap overflow-x-auto items-center justify-start scrollbar-thin scrollbar-thumb-gray-300">
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={`h-12 flex-1 min-w-[120px] flex items-center justify-center hover:bg-gray-100 text-sm font-semibold whitespace-nowrap ${
                  pathname === tab.href
                    ? "text-red-700 border-b-4 border-red-700"
                    : "text-foreground/50 hover:text-black"
                }`}
              >
                <span className="truncate">{tab.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
      {isLoadingPublished ||
      isLoadingApproved ||
      isLoadingRejected ||
      isLoadingPending ||
      isLoadingUnpublished ? (
        <div className="flex items-center justify-center h-20">
          <Loader2 className="animate-spin h-6 w-6 text-red-600" />
        </div>
      ) : (
        <div className="px-2">{children}</div>
      )}
    </div>
  );
}
