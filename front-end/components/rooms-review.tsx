"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PagingPage from "./pagingation/pagingPage";
import { useRouter } from "next/navigation";

export default function RoomsOfLandlord({ rooms }: { rooms: Array<any> }) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(rooms.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const currentItems = rooms.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="w-full flex flex-col px-2 sm:px-0">
      <div className="flex flex-col">
        <div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {currentItems.map((room: any) => (
            <Card
              key={room.id}
              className="w-full flex flex-col p-3 sm:p-2 bg-background border-none shadow-md rounded-md transition-transform transform hover:scale-105 cursor-pointer"
              onClick={() => router.push(`/user/room/${room.id}`)}
            >
              <img
                src={
                  room?.images?.[0]?.url ||
                  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"
                }
                //src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"
                alt={room.title}
                className="flex-none w-full h-48 sm:h-40 lg:h-48 object-cover mb-2 rounded"
              />
              <CardContent className="flex-1 flex flex-col p-1">
                <span className="text-sm sm:text-base font-semibold mb-2 line-clamp-2">
                  {`Room: ${room?.room_number} - ${room?.title}`}
                </span>
                <div className="flex flex-col gap-1 mt-1">
                  <span className="text-red-600 text-sm font-bold">
                    {room.price.toLocaleString()} đ/ month
                  </span>
                  <span className="text-sm font-bold text-secondary-foreground">
                    {room.area} m²
                  </span>
                </div>
                <div className="flex flex-row items-center gap-2 mt-2">
                  <span className="text-sm font-bold text-secondary-foreground">
                    Type:{" "}
                  </span>
                  <Badge
                    className={
                      room.type === "SINGLE"
                        ? "bg-blue-600 hover:bg-blue-700 text-white text-xs"
                        : "bg-yellow-500 hover:bg-yellow-600 text-white text-xs"
                    }
                  >
                    {room.type}
                  </Badge>
                </div>
                <div className="flex flex-row items-center mt-2">
                  <span className="text-sm sm:text-xs font-bold text-secondary-foreground">
                    Max occupancy: {room.max_occupancy || "N/A"} persons
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <div className="flex w-full justify-center mt-6 px-4">
        <PagingPage page={page} setPage={setPage} totalpage={totalPages || 1} />
      </div>
    </div>
  );
}
