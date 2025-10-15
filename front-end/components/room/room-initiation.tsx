"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAddRoom } from "@/queries/room.queries";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "../ui/badge";
import { Slider } from "../ui/range-slide";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import RoomInteriors from "./room-interiors";

export function RoomInitiation() {
  const [sliderValue, setSliderValue] = useState([1]);
  const roomTitleRef = useRef<HTMLInputElement>(null);
  const roomMaxOccupancyRef = useRef<HTMLInputElement>(null);
  const roomAreaRef = useRef<HTMLInputElement>(null);
  const roomPriceRef = useRef<HTMLInputElement>(null);
  const [roomType, setRoomType] = useState<string>("SINGLE");
  const [open, setOpen] = useState(false);
  const [priceValue, setPriceValue] = useState<number>(0);
  const [interiorCodes, setInteriorCodes] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { id: housingAreaId } = useParams();
  const addRoomMutation = useAddRoom();
  const queryClient = useQueryClient();

  // Format number to VND with English locale
  const formatToVND = (value: number) => {
    return new Intl.NumberFormat("en-US").format(value);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setPriceValue(value);
  };

  const handleCreateRooms = () => {
    setIsLoading(true);
    const roomTitle = roomTitleRef.current?.value || "Untitled Room";
    const maxOccupancy = roomMaxOccupancyRef.current?.value || "1";
    const roomArea = roomAreaRef.current?.value || "10";
    const roomTypeValue = roomType;
    const roomPrice = roomPriceRef.current?.value || "50000";
    const facilities = interiorCodes;
    const room_want_create = sliderValue[0];

    const roomData = {
      housing_area_id: housingAreaId,
      title: roomTitle,
      max_occupancy: parseInt(maxOccupancy, 10),
      area: parseFloat(roomArea),
      type: roomTypeValue,
      price: parseFloat(roomPrice),
      facilities,
      room_want_create,
    };

    addRoomMutation.mutate(
      { room: roomData },
      {
        onSuccess: (data) => {
          toast.success(
            `Successfully created ${data.number_of_rooms} room(s)!`
          );
          queryClient.invalidateQueries({
            queryKey: ["rooms", housingAreaId],
          });
          // Reset the form and close the sheet
          setOpen(false);
          setIsLoading(false);
          setSliderValue([1]);
          if (roomTitleRef.current) roomTitleRef.current.value = "";
          if (roomMaxOccupancyRef.current)
            roomMaxOccupancyRef.current.value = "";
          if (roomAreaRef.current) roomAreaRef.current.value = "";
          if (roomPriceRef.current) roomPriceRef.current.value = "";
          setRoomType("SINGLE");
          setPriceValue(0);
          setInteriorCodes([]);
        },
        onError: (error) => {
          toast.error(
            error instanceof Error ? error.message : "Failed to create room(s)"
          );
          setIsLoading(false);
        },
      }
    );
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="bg-red-500 hover:bg-red-700 text-white hover:text-white"
        >
          <Plus className="size-4 mr-2" />
          Quick Create Room
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col sm:max-w-lg">
        <SheetHeader className="border-b">
          <SheetTitle className="text-2xl">Create Rooms</SheetTitle>
          <SheetDescription className="text-xs pb-2">
            Create one or more rooms here. Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>

        <div className="grid overflow-auto flex-1 auto-rows-min gap-6 px-4">
          {/* Title */}
          <div className="grid gap-3">
            <Label htmlFor="room-title">Title</Label>
            <Input
              id="room-title"
              type="text"
              placeholder="Enter room title"
              ref={roomTitleRef}
            />
          </div>
          {/* Max Occupancy */}
          <div className="grid gap-3">
            <Label htmlFor="max-occupancy">Max Occupancy</Label>
            <Input
              id="max-occupancy"
              type="number"
              min={1}
              placeholder="Enter max occupancy"
              ref={roomMaxOccupancyRef}
            />
          </div>
          {/* Room Area */}
          <div className="grid gap-3">
            <Label htmlFor="room-area">Room Area (m²)</Label>
            <Input
              id="room-area"
              type="number"
              placeholder="Enter room area"
              min={1}
              ref={roomAreaRef}
            />
          </div>
          {/* Room Type */}
          <div className="grid gap-3">
            <Label htmlFor="room-type">Room Type</Label>
            <Select value={roomType} onValueChange={setRoomType}>
              <SelectTrigger className="w-full focus:ring-0 focus:ring-offset-0">
                <SelectValue placeholder="Select a room type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="SINGLE">
                    <Badge className="bg-blue-500 rounded-sm">SINGLE</Badge>
                  </SelectItem>
                  <SelectItem value="COUPLE">
                    <Badge className="bg-green-500 rounded-sm">COUPLE</Badge>
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          {/* Room Price */}
          <div className="grid gap-3">
            <Label htmlFor="room-price">Rental Price (VND)</Label>
            <div className="space-y-2">
              <div className="relative">
                <Input
                  id="room-price"
                  type="number"
                  placeholder="Enter rental price"
                  min={50000}
                  step={50000}
                  ref={roomPriceRef}
                  onChange={handlePriceChange}
                  className="pr-12"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                  VND
                </span>
              </div>
              {/* Display formatted value */}
              {priceValue > 0 && (
                <Badge className="bg-green-600 hover:bg-green-700 text-white">
                  {formatToVND(priceValue)} VND
                </Badge>
              )}
            </div>
          </div>
          {/* Room Interiors */}
          <RoomInteriors
            checkedCodes={interiorCodes}
            onChange={setInteriorCodes}
          />
          <div className="mb-2">Create: {sliderValue[0]} room(s)</div>
          <Slider
            defaultValue={[1]}
            value={sliderValue}
            onValueChange={setSliderValue}
            min={1}
            max={100}
            step={1}
            className="w-full"
          />
        </div>
        <SheetFooter className="flex-shrink-0 border-t pt-4 gap-2">
          <Button
            type="button"
            onClick={handleCreateRooms}
            className="bg-red-500 hover:bg-red-700 text-white hover:text-white flex-1"
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create"}
          </Button>
          <SheetClose asChild>
            <Button variant="outline" className="flex-1">
              Close
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
