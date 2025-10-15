"use client";

import { Button } from "@/components/ui/button";
import { HousingArea } from "@/lib/type";
import { HOUSING_AREA_STATUS } from "@/utils/constants/housing-area-status";
import Link from "next/link";
import { CustomAlertDialog } from "../alert-dialog";
import { useDeleteHousingArea } from "@/queries/housing-area.queries";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { TypingDots } from "../icon/typing-dots";
import empty from "@/assets/empty.png";
import Image from "next/image";

interface RoomProps {
  ads: HousingArea[];
  btnVisible?: boolean;
}

export default function RoomItem({ ads, btnVisible = true }: RoomProps) {
  const deleteHousingArea = useDeleteHousingArea();
  const queryClient = useQueryClient();
  const router = useRouter();

  console.log("RoomItem ads:", ads);

  const sortedAds = ads
    ?.slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt ?? 0).getTime() -
        new Date(a.createdAt ?? 0).getTime()
    );

  const handleContinue = (id: string, ad: HousingArea) => {
    deleteHousingArea.mutate(id, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["housing-areas-by-user", ad.status],
        });
        toast.success("Housing area deleted successfully");
      },
      onError: (error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to delete housing area"
        );
      },
    });
  };

  if (!ads) {
    return null;
  }

  return (
    <div className="bg-transparent w-full max-w-4xl mx-auto">
      {sortedAds.length > 0 ? (
        sortedAds.map((ad) => (
          <div
            key={ad.id}
            className={cn(
              "flex flex-col sm:flex-row border rounded-lg shadow-sm p-4 mt-4 mb-4 bg-background relative"
            )}
          >
            {ad.pending_update && (
              <div className="absolute inset-0 bg-primary-foreground/60 flex items-center justify-center rounded-lg z-20 pointer-events-none">
                <span className="flex text-xl text-red-600">
                  <span className="mr-2 pb-2"> Updating</span>
                  <TypingDots className="bg-red-600" />
                </span>
              </div>
            )}
            {/* Image */}
            <Link href={`/landlord/housing-area/${ad.id}`}>
              <div className="w-full h-48 sm:w-32 sm:h-32 flex-shrink-0 mx-auto sm:mx-0">
                <img
                  src={
                    ad.legal_documents?.[0]?.url ||
                    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
                  }
                  alt={`${ad.name} housing image`}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            </Link>
            {/* Content */}
            <div className="flex-1 sm:ml-4 mt-4 sm:mt-0 flex flex-col justify-between">
              <Link href={`/landlord/housing-area/${ad.id}`}>
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    {ad.name}
                  </h3>
                  {ad.location ? (
                    <p className="text-gray-500 text-sm mt-1">{`${ad.location?.address}, ${ad.location?.district}, ${ad.location?.city}`}</p>
                  ) : (
                    <span>N/A</span>
                  )}
                </div>
              </Link>
              {btnVisible && (
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    {ad.status !== HOUSING_AREA_STATUS.PENDING && (
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white h-10 w-16"
                        onClick={() => {
                          router.push(`/landlord/housing-area/${ad.id}/edit`);
                        }}
                      >
                        Edit
                      </Button>
                    )}
                    <CustomAlertDialog
                      triggerText="Delete"
                      title="Delete Housing Area"
                      description="Are you sure you want to delete this housing area?"
                      onContinue={() => {
                        handleContinue(ad.id, ad);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-10">
          <p className="text-foreground text-2xl font-bold">No posts found</p>
          {/* <PackageOpen
            className="mx-auto mt-4 w-32 h-32 text-red-600"
            strokeWidth={1}
          /> */}
          <Image
            src={empty}
            alt="No posts found"
            className="mx-auto mt-4 w-1/2 h-1/2 object-cover"
          />
        </div>
      )}
    </div>
  );
}
