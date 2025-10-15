"use client";

import { EditRoomSheet } from "@/components/room/room-edit";
import RoomDetailSkeleton from "@/components/skeleton/room-detail-skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SimpleBreadcrumb } from "@/components/ui/simple-breadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CreateOrderPayload,
  Room,
  RoomImage,
  TransactionType,
} from "@/lib/type";
import { useGetRoomDetailByRoomId } from "@/queries/room.queries";
import { useCreateOrder } from "@/queries/zalo-pay.queries";
import { useUserStore } from "@/store/useUserStore";
import { FacilityCodeMap } from "@/utils/constants/facility-codes";
import { random5DigitNumber } from "@/utils/utils";
import { createClient } from "@/lib/client";
import fetchWithAuth from "@/utils/api/fetchWithAuth";
import {
  CheckCircle2,
  CircleDollarSign,
  LandPlot,
  Mail,
  MapPin,
  Phone,
  Crown,
  Calendar,
  Users,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface TenantData {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  status: string;
  isActive: boolean;
  joinedAt: string;
  endDate: string;
  contractId: string;
}

export default function RoomDetailPage() {
  const { id: housingAreaId, roomId } = useParams();
  const [mainImgIdx, setMainImgIdx] = useState(0);
  const [fade, setFade] = useState(true);
  const { data: room, isLoading } = useGetRoomDetailByRoomId(String(roomId));
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [openBoostDialog, setOpenBoostDialog] = useState(false);
  const createOrder = useCreateOrder();
  const currentuserId = useUserStore((state) => state.userId);
  const supabase = createClient();

  // State for tenant data
  const [tenants, setTenants] = useState<TenantData[]>([]);
  const [isLoadingTenants, setIsLoadingTenants] = useState(false);

  console.log("Room data:", room);
  console.log("Contract data:", room?.contract);

  // Fetch all tenant data when room contracts are available
  useEffect(() => {
    if (!room?.contract || room.contract.length === 0) {
      setTenants([]);
      return;
    }

    const fetchAllTenantData = async () => {
      setIsLoadingTenants(true);
      try {
        const tenantPromises = room.contract.map(async (contract: any) => {
          try {
            // Get user data from Supabase
            const { data: supabaseUser } = await supabase
              .from("users")
              .select("*")
              .eq("auth_user_id", contract.tenant_id)
              .single();

            console.log("Supabase user fetched:", supabaseUser);

            // Get user detail from database using fetch API
            let userDetail = null;
            if (supabaseUser?.auth_user_id) {
              try {
                const response = await fetchWithAuth(
                  `/api/users/${supabaseUser.auth_user_id}`
                );
                const userData = await response.json();
                userDetail = userData.data;
                console.log("User detail fetched:", userDetail);
              } catch (error) {
                console.log("Error fetching user detail:", error);
              }
            }

            return {
              id: contract.tenant_id,
              name:
                supabaseUser?.name || supabaseUser?.full_name || "Unknown User",
              email: supabaseUser?.email || "No email",
              phone: supabaseUser?.phone || "No phone",
              avatar: userDetail?.avatar_url || "",
              status: contract.status,
              isActive: contract.status === "active",
              joinedAt: new Date(contract.start_date).toLocaleDateString(
                "en-GB"
              ),
              endDate: new Date(contract.end_date).toLocaleDateString("en-GB"),
              contractId: contract._id,
            };
          } catch (error) {
            console.error(
              `Error fetching data for tenant ${contract.tenant_id}:`,
              error
            );
            return {
              id: contract.tenant_id,
              name: "Unknown User",
              email: "No email",
              phone: "No phone",
              avatar: "",
              status: contract.status,
              isActive: contract.status === "active",
              joinedAt: new Date(contract.start_date).toLocaleDateString(
                "en-GB"
              ),
              endDate: new Date(contract.end_date).toLocaleDateString("en-GB"),
              contractId: contract._id,
            };
          }
        });

        const tenantData = await Promise.all(tenantPromises);

        // Sort by active contracts first
        const sortedTenants = tenantData.sort((a, b) => {
          if (a.isActive && !b.isActive) return -1;
          if (!a.isActive && b.isActive) return 1;
          return 0;
        });

        console.log("Final tenants data:", sortedTenants);
        setTenants(sortedTenants);
      } catch (error) {
        console.error("Error fetching tenant data:", error);
        setTenants([]);
      } finally {
        setIsLoadingTenants(false);
      }
    };

    fetchAllTenantData();
  }, [room?.contract, supabase]);

  const handleRoomUpdated = (updatedRoom: Room) => {
    setEditSheetOpen(false);
    setEditRoom(null);
    toast("Room updated!", { description: "Room info has been updated." });
  };

  // Handle main image change with smooth transition
  const handleChangeMainImg = (idx: number) => {
    if (idx === mainImgIdx) return;
    setFade(false);
    setTimeout(() => {
      setMainImgIdx(idx);
      setFade(true);
    }, 200);
  };

  const handleBoostAds = () => {
    // Prepare order data for payment (default price: 50,000 VND)
    const app_trans_id = random5DigitNumber();
    const app_user = currentuserId!;
    const amount = 100000;
    const embed_data = JSON.stringify({
      type: TransactionType.BOOSTING_ADS,
      user_id: currentuserId,
      housing_area_id: housingAreaId,
      room_id: roomId,
      redirecturl: `${process.env.NEXT_PUBLIC_SITE_URL}/landlord/housing-area/${housingAreaId}/room/${roomId}`,
    });
    const item = JSON.stringify([{}]);
    const description = `Payment for boosting ads of room ${roomId}`;
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

  if (isLoading || !room) {
    return <RoomDetailSkeleton />;
  }

  const activeTenants = tenants.filter((t) => t.isActive);

  return (
    <div className="bg-primary-foreground">
      <div className="max-w-5xl mx-auto bg-background shadow-lg p-6">
        <SimpleBreadcrumb
          items={[
            { name: "Home", href: "/" },
            { name: "Landlord", href: "/landlord" },
            {
              name: "Housing Area",
              href: `/landlord/housing-area/${housingAreaId}`,
            },
            { name: "Room Details" },
          ]}
        />
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 flex flex-col gap-4">
            {/* Main image with fade transition */}
            {room && room.images && room.images.length > 0 && (
              <div className="w-full h-72 md:h-96 rounded-lg flex items-center justify-center overflow-hidden mb-2">
                <img
                  src={room.images[mainImgIdx]?.url}
                  alt={
                    room.images[mainImgIdx]?.caption ||
                    `Room image ${mainImgIdx + 1}`
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
                      className="basis-1/3"
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
                              src={img.url}
                              alt={img.caption || `Room thumbnail ${idx + 1}`}
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
          {/* Room details */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-foreground">
                {room.title}
              </h1>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge
                  className={
                    room.type === "SINGLE"
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-yellow-500 hover:bg-yellow-600 text-white"
                  }
                >
                  {room.type}
                </Badge>
                <Badge
                  className={
                    room.status === "AVAILABLE"
                      ? "bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                      : "bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-1"
                  }
                >
                  <CheckCircle2 className="w-4 h-4" /> {room.status}
                </Badge>
                {room.boost_status && (
                  <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
                    BOOSTED
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-secondary-foreground mb-2">
                <LandPlot className="w-5 h-5" />
                <span className="font-medium">{room.area} m²</span>
              </div>
              <div className="flex items-center gap-3 text-secondary-foreground mb-2">
                <CircleDollarSign className="w-5 h-5" />
                <span className="font-semibold text-lg text-red-600">
                  {room.price.toLocaleString()} VND
                </span>
              </div>
              <div className="flex items-center gap-3 text-secondary-foreground mb-2">
                <MapPin className="w-5 h-5" />
                <span>{room.housing_area?.name || "Unknown Location"}</span>
              </div>
              <div className="mt-4">
                <h2 className="font-semibold mb-2 text-foreground">
                  Facilities
                </h2>
                <div className="flex flex-wrap gap-2">
                  {room.facilities && room.facilities.length > 0 ? (
                    room.facilities.map((f: any) => (
                      <Badge
                        key={f.code}
                        className="bg-background hover:bg-primary-foreground text-foreground border border-foreground/50 px-3 py-1"
                      >
                        {FacilityCodeMap[f.code] || f.name}
                        {f.quantity > 1 ? ` x${f.quantity}` : ""}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-gray-400">No facilities.</span>
                  )}
                </div>
                <div className="mt-8 flex gap-4">
                  <Button
                    size="lg"
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => setEditSheetOpen(true)}
                  >
                    Edit
                  </Button>
                  {room.status === "AVAILABLE" && !room.boost_status && (
                    <Button
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => setOpenBoostDialog(true)}
                    >
                      Boost Ads
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Tenant Table */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Tenants History</h2>
            <div className="flex items-center gap-3">
              <Badge className="bg-blue-100 text-blue-700 flex items-center gap-1">
                <Users className="w-3 h-3" />
                {activeTenants.length} Active / {tenants.length} Total
              </Badge>
            </div>
          </div>
          <div className="rounded-xl border bg-background shadow">
            {isLoadingTenants ? (
              <div className="p-8 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p>Loading tenant information...</p>
              </div>
            ) : tenants.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="mb-4">
                  <Crown className="w-12 h-12 mx-auto text-gray-300" />
                </div>
                <p className="text-lg font-medium">No tenants yet</p>
                <p className="text-sm">
                  This room hasn't been rented to anyone.
                </p>
              </div>
            ) : (
              <Table className="w-full table-fixed">
                <TableHeader>
                  <TableRow className="bg-secondary text-muted-foreground hover:bg-secondary">
                    <TableHead className="w-1/4 pl-5 text-foreground rounded-tl-xl">
                      Tenant
                    </TableHead>
                    <TableHead className="text-foreground">Contact</TableHead>
                    <TableHead className="text-foreground">Period</TableHead>
                    <TableHead className="text-right text-foreground rounded-tr-xl">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenants.map((tenant) => (
                    <TableRow
                      key={tenant.contractId}
                      className={`hover:bg-secondary transition-colors ${
                        tenant.isActive
                          ? "bg-green-50 dark:bg-green-900/10"
                          : ""
                      }`}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3 pl-5">
                          <div className="relative">
                            <Avatar>
                              <AvatarImage
                                src={tenant.avatar}
                                alt={tenant.name}
                              />
                              <AvatarFallback>
                                {tenant.name
                                  .split(" ")
                                  .map((w) => w[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            {tenant.isActive && (
                              <div className="absolute -top-1 -right-1">
                                <Crown className="w-4 h-4 text-yellow-500" />
                              </div>
                            )}
                          </div>
                          <div>
                            <span
                              className={`font-medium ${tenant.isActive ? "text-green-700 dark:text-green-400" : ""}`}
                            >
                              {tenant.name}
                            </span>
                            {tenant.isActive && (
                              <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full inline-block ml-2">
                                Current
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-3 h-3 text-muted-foreground" />
                            <span className="truncate">{tenant.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-3 h-3 text-muted-foreground" />
                            <span>{tenant.phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            <span>Start: {tenant.joinedAt}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            <span>End: {tenant.endDate}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-4">
                        <Badge
                          className={
                            tenant.isActive
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : tenant.status === "pending"
                                ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }
                        >
                          {tenant.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
      <EditRoomSheet
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
        room={{ ...room, id: roomId }}
        onRoomUpdated={handleRoomUpdated}
      />
      <Dialog open={openBoostDialog} onOpenChange={setOpenBoostDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">
              Confirm Boost Ads
            </DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to boost this room's ads?</p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                handleBoostAds();
                setOpenBoostDialog(false);
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
