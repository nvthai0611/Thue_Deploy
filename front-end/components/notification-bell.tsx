"use client";

import { Notification } from "@/lib/type";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Bell } from "lucide-react";
import empty from "@/assets/empty.png";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/client";
import { useRouter } from "next/navigation";

interface NotificattionProps {
  notifications?: Notification[];
}

export default function NotificationBell({
  notifications,
}: NotificattionProps) {
  const supabase = createClient();
  const router = useRouter();
  const unreadCount =
    notifications?.filter((n) => n.is_read === false).length || 0;

  const handleRead = async (noti: Notification) => {
    if (noti.is_read) return;

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", noti.id);

    if (noti.data && noti.data.url) {
      router.push(noti.data.url);
    }
  };

  console.log("Notifications:", notifications);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="p-0 bg-transparent border-none outline-none relative"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span
              className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold shadow"
              style={{ minWidth: 16, minHeight: 16 }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-[250px] max-h-80 overflow-y-auto">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications && notifications.length > 0 ? (
          notifications.map((noti: Notification) => (
            <DropdownMenuItem
              key={noti.id}
              className={cn(
                "mb-1",
                noti.is_read === false ? "bg-red-50 hover:bg-red-100" : ""
              )}
              onClick={() => handleRead(noti)}
            >
              <div>
                <div
                  className={
                    "font-medium" +
                    (noti.is_read === false ? " text-red-600" : "")
                  }
                >
                  {noti.title || "Notification"}
                </div>
                <div className="text-xs text-gray-500">{noti.message}</div>
                <div className="text-[10px] text-gray-400">
                  {noti.created_at
                    ? new Date(noti.created_at).toLocaleString()
                    : ""}
                </div>
              </div>
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>
            <Image
              src={empty}
              alt="No notifications"
              className="w-32 h-32 mx-auto object-cover"
            />
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
