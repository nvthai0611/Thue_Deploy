"use client";

import NotFound from "@/components/not-found";
import HousingRatings from "@/components/rating/page";
import HousingStatus from "@/components/room/housing-status";
import { RoomInitiation } from "@/components/room/room-initiation";
import { RoomList } from "@/components/room/room-list";
import SimpleMap from "@/components/simple-map";
import HousingAreaDetailSkeleton from "@/components/skeleton/housing-area-detail-skeleton";
import { AlertDialogHeader } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { CarouselSpacing } from "@/components/ui/carousel-spacing";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { SimpleBreadcrumb } from "@/components/ui/simple-breadcrumb";
import { CreateOrderPayload, LegalDocument, TransactionType } from "@/lib/type";
import {
  useGetHousingAreaById,
  useUserPublishHousingArea,
  useUserUnpublishHousingArea,
} from "@/queries/housing-area.queries";
import { useGetRoomsByHousingAreaId } from "@/queries/room.queries";
import { useCreateOrder } from "@/queries/zalo-pay.queries";
import { useUserStore } from "@/store/useUserStore";
import { HOUSING_AREA_STATUS } from "@/utils/constants/housing-area-status";
import { random5DigitNumber } from "@/utils/utils";
import { useLoadScript } from "@react-google-maps/api";
import { useQueryClient } from "@tanstack/react-query";
import { House } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const mockImages = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1508921912186-1d1a45ebb3c1?auto=format&fit=crop&w=600&q=80",
];

const breadcrumbItems = [
  { name: "Home", href: "/" },
  { name: "Landlord", href: "/landlord" },
  { name: "My Ads", href: "/landlord/my-ads" },
  { name: "Housing Area Details" },
];

export default function HousingAreaDetailsPage() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ["places"],
  });
  const { id: housingAreaId } = useParams();
  const publishHousingAreaMutation = useUserPublishHousingArea(
    String(housingAreaId)
  );
  const unpublishHousingAreaMutation = useUserUnpublishHousingArea(
    String(housingAreaId)
  );
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const createOrder = useCreateOrder();
  const currentuserId = useUserStore((state) => state.userId);

  // Handle payment for posting a new housing area listing
  const handlePayForPosting = async () => {
    setOpenPaymentDialog(false);

    // Prepare order data for payment (default price: 50,000 VND)
    const app_trans_id = random5DigitNumber();
    const app_user = currentuserId!;
    const amount = 50000;
    const embed_data = JSON.stringify({
      type: TransactionType.SERVICE,
      user_id: currentuserId,
      housing_area_id: housingAreaId,
      redirecturl: `${process.env.NEXT_PUBLIC_SITE_URL}/landlord/housing-area/${housingAreaId}`,
    });
    const item = JSON.stringify([{}]);
    const description = `Payment for publishing housing area ${housingAreaId}`;
    const orderData: CreateOrderPayload = {
      app_trans_id,
      app_user,
      amount,
      embed_data,
      item,
      description,
    };

    // Call the create order mutation
    createOrder
      .mutateAsync(orderData)
      .then((response) => {
        const data = response.data;
        if (data.return_code === 1) {
          // Redirect to ZaloPay payment page
          window.location.href = data.order_url;
        } else {
          toast.error("Failed to create order. Please try again.");
        }
      })
      .catch((error) => {
        console.error("Error creating order:", error);
        toast.error("Failed to create order. Please try again.");
      });
  };

  // Fetch housing area details from the server
  const {
    data: housingAreaDetails,
    isLoading: isHousingAreaLoading,
    error: housingAreaError,
  } = useGetHousingAreaById(String(housingAreaId));
  const isPendingUpdate = housingAreaDetails?.pending_update;
  const queryClient = useQueryClient();
  console.log("housingAreaDetails:", housingAreaDetails);
  const rejectedReason = housingAreaDetails?.reject_reason;

  const housingAreaImages =
    housingAreaDetails?.legal_documents.map((doc: LegalDocument) => doc.url) ||
    mockImages;

  const { data: roomsData } = useGetRoomsByHousingAreaId(String(housingAreaId));

  const handlePublish = async () => {
    await publishHousingAreaMutation
      .mutateAsync()
      .then(() => {
        toast.success("Housing area published successfully!");
        queryClient.invalidateQueries({
          queryKey: ["housingArea", String(housingAreaId)],
        });
      })
      .catch((error) => {
        if (error?.code === 402) {
          setOpenPaymentDialog(true);
        } else {
          console.error("Error publishing housing area:", error);
          toast.error("Failed to publish housing area. Please try again.");
        }
      });
  };

  const handleUnpublish = async () => {
    await unpublishHousingAreaMutation
      .mutateAsync()
      .then(() => {
        toast.success("Housing area unpublished successfully!");
        queryClient.invalidateQueries({
          queryKey: ["housingArea", String(housingAreaId)],
        });
      })
      .catch((error) => {
        console.error("Error unpublishing housing area:", error);
        toast.error(error.message || "Failed to unpublish housing area");
      });
  };

  if (isHousingAreaLoading) return <HousingAreaDetailSkeleton />;

  if (housingAreaError || !housingAreaDetails) return <NotFound />;

  return (
    <div className=" mx-auto px-4 bg-primary-foreground">
      <div className="max-w-4xl mx-auto bg-background p-6">
        {/* Breadcrumbs */}
        <SimpleBreadcrumb items={breadcrumbItems} />
        <HousingStatus status={housingAreaDetails.status} />
        {rejectedReason && (
          <div className="bg-red-100 text-red-800 p-4 rounded-md my-4">
            <p className="text-sm">
              <span className="font-semibold">Rejected reason:</span>{" "}
              {rejectedReason}
            </p>
          </div>
        )}
        {isPendingUpdate && (
          <div className="bg-yellow-100 text-yellow-800 p-4 rounded-md my-4">
            <p className="text-sm">
              This housing area is pending updates. Click{" "}
              <Link
                href={`/landlord/housing-area/${housingAreaId}/pending-update`}
                className="font-semibold underline text-blue-600"
              >
                here
              </Link>{" "}
              to see details
            </p>
          </div>
        )}
        {/* Images */}
        <div className="w-full mb-6">
          <CarouselSpacing
            className="w-full max-w-full"
            images={housingAreaImages}
          />
        </div>

        {/* Change Status Btn */}
        <div className="flex gap-2 mt-4 justify-center items-center mb-4">
          {housingAreaDetails.status === HOUSING_AREA_STATUS.PUBLISHED && (
            <Button
              className="bg-red-500 text-white hover:bg-red-600"
              onClick={handleUnpublish}
            >
              Unpublish
            </Button>
          )}
          {![
            HOUSING_AREA_STATUS.PENDING,
            HOUSING_AREA_STATUS.PUBLISHED,
            HOUSING_AREA_STATUS.REJECTED,
          ].includes(housingAreaDetails.status) && (
            <Button
              className="bg-green-500 text-white hover:bg-green-600"
              onClick={handlePublish}
            >
              Publish
            </Button>
          )}
        </div>

        {/* Info Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Name</h2>
          <p className="text-secondary-foreground mb-4">
            {housingAreaDetails.name || "Housing Area Title"}
          </p>
          <h2 className="text-xl font-semibold mb-2">Description</h2>
          <p className="text-secondary-foreground mb-4">
            {housingAreaDetails.description || "Housing Area Description"}
          </p>
          <h2 className="text-xl font-semibold mb-2">Number of Rooms</h2>
          <p className="text-secondary-foreground mb-4 flex items-center gap-2">
            {housingAreaDetails.expected_rooms || "0"}
            <House className="w-4" />
          </p>
          <h2 className="text-xl font-semibold mb-2">Location</h2>
          <p className="text-secondary-foreground mb-4">
            {housingAreaDetails.location ? (
              <span>{`${housingAreaDetails.location.address}, ${housingAreaDetails.location.district}, ${housingAreaDetails.location.city}`}</span>
            ) : (
              "123 Main St, City, Country"
            )}
          </p>
        </div>
        {/* Map Section */}
        <div className="mb-6">
          <SimpleMap
            lat={housingAreaDetails.location?.lat}
            lng={housingAreaDetails.location?.lng}
            isLoaded={isLoaded}
          />
        </div>

        {/* Room Creation Section */}
        {housingAreaDetails.status !== HOUSING_AREA_STATUS.PENDING && (
          <RoomInitiation />
        )}

        {/* Room Management Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Room Management</h2>
          <RoomList
            rooms={roomsData || []}
            housingAreaId={String(housingAreaId)}
          />
        </div>
      </div>
      <Dialog open={openPaymentDialog} onOpenChange={setOpenPaymentDialog}>
        <DialogContent>
          <AlertDialogHeader>
            <DialogTitle className="text-red-600">
              You need to pay to post more
            </DialogTitle>
          </AlertDialogHeader>
          <div>
            You can only post one listing for free. Please make a payment to
            continue posting more housing areas.
          </div>
          <DialogFooter>
            <Button
              onClick={handlePayForPosting}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              Payment
            </Button>
            <Button
              variant="outline"
              onClick={() => setOpenPaymentDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <HousingRatings housingId={housingAreaId} />
    </div>
  );
}
