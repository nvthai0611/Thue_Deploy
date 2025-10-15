"use client";

import { RealtimeChat } from "@/components/realtime-chat";
import { useUserStore } from "@/store/useUserStore";
import { useParams } from "next/navigation";

export default function ChatPage() {
  const currentUserId = useUserStore((state) => state.userId);
  const { id: otherUserId } = useParams();

  return (
    <RealtimeChat
      key={`${currentUserId}-${otherUserId}`}
      currentUserId={currentUserId!}
      otherUserId={otherUserId as string}
    />
  );
}
