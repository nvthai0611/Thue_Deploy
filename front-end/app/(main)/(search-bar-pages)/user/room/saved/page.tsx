"use client";

import { useGetSavedRooms, useDeleteSavedRoom } from "@/queries/room.queries";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function SavedRoomsPage() {
  const { data: savedRooms, isLoading, error } = useGetSavedRooms();
  const deleteSavedRoom = useDeleteSavedRoom();
  const router = useRouter();
  const queryClient = useQueryClient();

  if (isLoading)
    return <div className="p-8 text-center">Loading saved rooms...</div>;
  if (error)
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load saved rooms.
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Saved Rooms</h1>
      {!savedRooms || savedRooms.length === 0 ? (
        <div className="text-gray-500 text-center">No saved rooms found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {savedRooms.map((room: any) => (
            <Card
              key={room._id}
              className="cursor-pointer hover:shadow-lg transition group relative"
            >
              <img
                src={
                  room.images?.[0]?.url ||
                  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"
                }
                alt={room.title}
                className="w-full h-40 object-cover rounded-t-lg"
                onClick={() => router.push(`/user/room/${room._id}`)}
              />
              <CardContent className="p-4">
                <div className="font-semibold text-lg mb-1">{room.title}</div>
                <div className="text-red-600 font-bold mb-1">
                  {room.price?.toLocaleString()} VND
                </div>
                <div className="text-sm text-gray-500 mb-1">
                  Area: {room.area} m²
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {room.facilities &&
                  Array.isArray(room.facilities) &&
                  room.facilities.length > 0 ? (
                    room.facilities.map((f: any, idx: number) => (
                      <Badge key={idx}>
                        {typeof f === "object" ? f.name : f}
                      </Badge>
                    ))
                  ) : (
                    <Badge>No facilities</Badge>
                  )}
                </div>
                <div className="text-xs text-gray-400 mb-2">
                  Max occupancy: {room.max_occupancy}
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSavedRoom.mutate(room._id, {
                      onSuccess: () => {
                        toast.success("Room removed from saved list!");
                        queryClient.invalidateQueries({
                          queryKey: ["saved-rooms"],
                        });
                      },
                      onError: (error: any) => {
                        toast.error(error?.message || "Failed to remove room!");
                      },
                    });
                  }}
                >
                  Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
