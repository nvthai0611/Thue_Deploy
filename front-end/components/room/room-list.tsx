"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import type { Room } from "@/lib/type";
import { useDeleteRoom, useUpdateRoom } from "@/queries/room.queries";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Ellipsis, Eye, SquarePen, Trash2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { EditRoomSheet } from "./room-edit";
import { CustomAlertDialog } from "../alert-dialog";

interface RoomListProps {
  rooms?: Room[];
  housingAreaId?: string;
}

export function RoomList({ rooms = [], housingAreaId }: RoomListProps) {
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null); // State để kiểm soát DropdownMenu
  const router = useRouter();
  const pathname = usePathname();
  const { mutate: updateRoom } = useUpdateRoom();
  const { mutate: deleteRoom } = useDeleteRoom();
  const queryClient = useQueryClient();

  // Handle inline edit save:
  const handleInlineEditSave = async (idx: number, field: string) => {
    const room = rooms[idx];
    let value: any = editingValue;
    if (field === "area" || field === "price") value = Number(editingValue);
    console.log("Updating room:", room);
    updateRoom(
      { id: room.id, room: { [field]: value } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["rooms", housingAreaId],
          });
          toast.success("Room updated successfully", {
            description: `Field "${field}" has been updated`,
          });
        },
        onError: (error) => {
          toast.error(error?.message || "Failed to update room", {
            description: "Please try again.",
          });
        },
      }
    );
    setEditingIdx(null);
    setEditingField(null);
    setEditingValue("");
  };

  // Handle select change
  const handleSelectChange = (idx: number, field: string, value: string) => {
    const room = rooms[idx];
    updateRoom(
      { id: room.id, room: { [field]: value } },
      {
        onSuccess: () => {
          toast.success("Room updated successfully", {
            description: `Field "${field}" has been updated`,
          });
          queryClient.invalidateQueries({
            queryKey: ["rooms", housingAreaId],
          });
        },
        onError: (error) => {
          toast.error(error?.message || "Failed to update room", {
            description: "Please try again.",
          });
        },
      }
    );
  };

  // Handle delete room
  const handleDelete = async (roomId: string) => {
    deleteRoom(roomId, {
      onSuccess: () => {
        toast.success("Room deleted successfully", {
          description: `Room has been removed from the system`,
        });
        queryClient.invalidateQueries({
          queryKey: ["rooms", housingAreaId],
        });
      },
      onError: (error) => {
        toast.error(error?.message || "Failed to delete room", {
          description: "Please try again.",
        });
      },
    });
  };

  // Open edit sheet
  const handleEditClick = (idx: number) => {
    setEditRoom({ ...rooms[idx] });
    setEditSheetOpen(true);
  };

  // Handle successful update from edit sheet
  const handleRoomUpdated = (updatedRoom: Room) => {
    setEditSheetOpen(false);
    setEditRoom(null);
    toast.success("Room updated!", {
      description: "Room info has been updated.",
    });
  };

  if (!rooms.length) {
    return (
      <div className="text-muted-foreground text-center py-8">
        No rooms found.
      </div>
    );
  }

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary text-muted-foreground hover:bg-secondary">
            <TableHead className="text-center text-foreground">
              Room Number
            </TableHead>
            <TableHead className="text-center text-foreground">
              Area (m²)
            </TableHead>
            <TableHead className="text-center text-foreground">
              Price (VND)
            </TableHead>
            <TableHead className="text-center text-foreground">Type</TableHead>
            <TableHead className="text-center text-foreground">
              Status
            </TableHead>
            <TableHead className="text-center text-foreground">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rooms.map((room, idx) => (
            <TableRow
              key={room.id}
              className="hover:bg-secondary transition-colors"
            >
              {/* Room Number */}
              <TableCell className="text-center">
                {editingIdx === idx && editingField === "room_number" ? (
                  <Input
                    className="w-32 mx-auto bg-transparent border-2 border-blue-400 rounded px-1 text-center"
                    value={editingValue}
                    autoFocus
                    onChange={(e) => setEditingValue(e.target.value)}
                    onBlur={() => handleInlineEditSave(idx, "room_number")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter")
                        handleInlineEditSave(idx, "room_number");
                      if (e.key === "Escape") {
                        setEditingIdx(null);
                        setEditingField(null);
                        setEditingValue("");
                      }
                    }}
                  />
                ) : (
                  <div
                    className="cursor-pointer flex items-center justify-end gap-2 pr-8"
                    onClick={() => {
                      setEditingIdx(idx);
                      setEditingField("room_number");
                      setEditingValue(room.room_number);
                    }}
                  >
                    {room.room_number} <SquarePen className="size-4" />
                  </div>
                )}
              </TableCell>
              {/* Area */}
              <TableCell className="text-center">
                {editingIdx === idx && editingField === "area" ? (
                  <Input
                    className="w-20 mx-auto bg-transparent border-2 border-blue-400 rounded px-1 text-center"
                    type="number"
                    min={1}
                    value={editingValue}
                    autoFocus
                    onChange={(e) => setEditingValue(e.target.value)}
                    onBlur={() => handleInlineEditSave(idx, "area")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleInlineEditSave(idx, "area");
                      if (e.key === "Escape") {
                        setEditingIdx(null);
                        setEditingField(null);
                        setEditingValue("");
                      }
                    }}
                  />
                ) : (
                  <div
                    className="cursor-pointer flex items-center justify-end gap-2 pr-8"
                    onClick={() => {
                      setEditingIdx(idx);
                      setEditingField("area");
                      setEditingValue(room.area.toString());
                    }}
                  >
                    {room.area} <SquarePen className="size-4" />
                  </div>
                )}
              </TableCell>
              {/* Price */}
              <TableCell className="text-center">
                {editingIdx === idx && editingField === "price" ? (
                  <Input
                    className="w-24 mx-auto bg-transparent border-2 border-blue-400 rounded px-1 text-center"
                    type="number"
                    min={50000}
                    step={50000}
                    value={editingValue}
                    autoFocus
                    onChange={(e) => setEditingValue(e.target.value)}
                    onBlur={() => handleInlineEditSave(idx, "price")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleInlineEditSave(idx, "price");
                      if (e.key === "Escape") {
                        setEditingIdx(null);
                        setEditingField(null);
                        setEditingValue("");
                      }
                    }}
                  />
                ) : (
                  <div
                    className="cursor-pointer flex items-center justify-end gap-2 pr-8"
                    onClick={() => {
                      setEditingIdx(idx);
                      setEditingField("price");
                      setEditingValue(room.price.toString());
                    }}
                  >
                    {room.price.toLocaleString()}{" "}
                    <SquarePen className="size-4" />
                  </div>
                )}
              </TableCell>
              {/* Type */}
              <TableCell className="text-center">
                <Select
                  value={room.type}
                  onValueChange={(value) =>
                    handleSelectChange(idx, "type", value)
                  }
                >
                  <SelectTrigger className="w-32 mx-auto bg-transparent border-none outline-none focus:ring-0 focus:ring-offset-0 text-center">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="SINGLE">
                        <Badge className="bg-blue-500 rounded-sm py-0 hover:bg-blue-600 flex items-center gap-1 min-w-[90px] justify-center">
                          <span className="font-semibold">SINGLE</span>
                          <ChevronDown className="size-5" />
                        </Badge>
                      </SelectItem>
                      <SelectItem value="COUPLE">
                        <Badge className="bg-yellow-500 rounded-sm py-0 hover:bg-yellow-600 flex items-center gap-1 min-w-[90px] justify-center">
                          <span className="font-semibold">COUPLE</span>
                          <ChevronDown className="size-5" />
                        </Badge>
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </TableCell>
              {/* Status */}
              <TableCell className="text-center">
                <Select
                  value={room.status}
                  onValueChange={(value) =>
                    handleSelectChange(idx, "status", value)
                  }
                >
                  <SelectTrigger className="w-32 mx-auto bg-transparent border-none outline-none focus:ring-0 focus:ring-offset-0 text-center">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="AVAILABLE">
                        <Badge className="bg-green-500 rounded-sm py-0 hover:bg-green-600 flex items-center gap-1 min-w-[90px] justify-center">
                          <span className="font-semibold">AVAILABLE</span>
                          <ChevronDown className="size-5" />
                        </Badge>
                      </SelectItem>
                      {room.status === "OCCUPIED" && (
                        <SelectItem value="OCCUPIED">
                          <Badge className="bg-red-500 rounded-sm py-0 hover:bg-red-600 flex items-center gap-1 min-w-[90px] justify-center">
                            <span className="font-semibold">OCCUPIED</span>
                            <ChevronDown className="size-5" />
                          </Badge>
                        </SelectItem>
                      )}
                      <SelectItem value="HIDDEN">
                        <Badge className="bg-gray-500 rounded-sm py-0 hover:bg-gray-600 flex items-center gap-1 min-w-[90px] justify-center">
                          <span className="font-semibold">HIDDEN</span>
                          <ChevronDown className="size-5" />
                        </Badge>
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </TableCell>
              {/* Actions */}
              <TableCell className="text-center">
                <DropdownMenu
                  open={dropdownOpen === room.id}
                  onOpenChange={(open) =>
                    setDropdownOpen(open ? room.id : null)
                  }
                >
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="mx-auto focus-visible:ring-0 focus-visible:border-none focus:border-none"
                    >
                      <Ellipsis className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => router.push(`${pathname}/room/${room.id}`)}
                    >
                      <Eye className="mr-2 w-4" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEditClick(idx)}>
                      <SquarePen className="mr-2 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <CustomAlertDialog
                        triggerText={
                          <span className="flex items-center">
                            <Trash2 className="mr-2 w-4" />
                            Delete
                          </span>
                        }
                        title="Do you want to delete this room?"
                        description="This action cannot be undone."
                        onContinue={() => {
                          handleDelete(room.id);
                          setDropdownOpen(null); // Close DropdownMenu after deletion
                        }}
                        cancelText="Cancel"
                        continueText="Delete"
                        triggerClassName="bg-transparent text-foreground pl-2 hover:bg-transparent hover:text-red-500 flex items-center"
                      />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <EditRoomSheet
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
        room={editRoom}
        onRoomUpdated={handleRoomUpdated}
      />
    </div>
  );
}
