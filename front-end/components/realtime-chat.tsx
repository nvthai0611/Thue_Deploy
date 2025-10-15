import { useState, useEffect, useRef } from "react";
import { useRealtimeChat } from "@/hooks/use-realtime-chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { debounce } from "lodash";
import { TypingDots } from "./icon/typing-dots";
import { format } from "date-fns";
import { createClient } from "@/lib/client";

interface RealtimeChatProps {
  currentUserId: string;
  otherUserId: string;
}

export const RealtimeChat = ({
  currentUserId,
  otherUserId,
}: RealtimeChatProps) => {
  const {
    messages,
    sendMessage,
    isConnected,
    sendTyping,
    stopTyping,
    otherUserTyping,
  } = useRealtimeChat(currentUserId, otherUserId);

  const supabase = createClient();
  const [newMessage, setNewMessage] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Mark all unread messages sent to the current user as read when messages change
  useEffect(() => {
    const unreadIds = messages
      .filter(
        (msg) =>
          msg.sender_id === otherUserId &&
          msg.receiver_id === currentUserId &&
          !msg.is_read
      )
      .map((msg) => msg.id);

    if (unreadIds.length > 0) {
      supabase
        .from("messages")
        .update({ is_read: true })
        .in("id", unreadIds)
        .then(({ error }) => {
          if (error) {
            console.error("Error updating is_read:", error.message);
          }
        });
    }
  }, [messages, currentUserId, otherUserId, supabase]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    containerRef.current?.scrollTo(0, containerRef.current.scrollHeight);
  }, [messages]);

  // Debounced stop typing to avoid spamming
  const debouncedStopTyping = useRef(
    debounce(() => {
      stopTyping();
    }, 1000)
  ).current;

  // Handle input change: send typing status
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (isConnected) {
      sendTyping(true);
      debouncedStopTyping();
    }
  };

  // Handle send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !isConnected) return;
    sendMessage(newMessage);
    setNewMessage("");
    stopTyping();
  };

  // Find the last message sent by the current user
  const lastMyMessage = [...messages]
    .reverse()
    .find((msg) => msg.sender_id === currentUserId);

  return (
    <div className="flex flex-col h-full w-full bg-background text-foreground antialiased">
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 pb-12"
      >
        {messages.length === 0 && (
          <div className="text-center text-sm text-muted-foreground">
            No messages yet. Start the conversation!
          </div>
        )}
        <div className="space-y-1">
          {messages.map((message) => (
            <div
              key={message.id}
              className={
                message.sender_id === currentUserId
                  ? "flex flex-col items-end"
                  : "flex flex-col items-start"
              }
            >
              <span
                className={cn(
                  "inline-block px-4 py-2 my-1 max-w-xs break-words shadow text-left",
                  message.sender_id === currentUserId
                    ? "bg-blue-500 text-white rounded-l-3xl rounded-tr-[38px] rounded-br-sm"
                    : "bg-gray-200 text-gray-900 rounded-r-3xl rounded-bl-[38px] rounded-tl-sm"
                )}
              >
                {message.content}
              </span>
              <span className="text-xs text-muted-foreground mt-1 px-2 flex items-center gap-2">
                {/* Only show Sent/Seen for the last message sent by the current user */}
                {message.id === lastMyMessage?.id &&
                message.sender_id === currentUserId ? (
                  message.is_read ? (
                    <span>Seen</span>
                  ) : (
                    <>
                      {format(new Date(message.created_at), "HH:mm")}
                      <span>Sent</span>
                    </>
                  )
                ) : (
                  // Show time for all other messages
                  format(new Date(message.created_at), "HH:mm")
                )}
              </span>
            </div>
          ))}
          {/* Typing indicator */}
          {otherUserTyping && (
            <div className="flex justify-start pl-2 pb-2 pt-4">
              <TypingDots />
            </div>
          )}
        </div>
      </div>
      <form
        onSubmit={handleSendMessage}
        className="flex w-full gap-2 border-t border-border p-4"
      >
        <Input
          className="rounded-full bg-background text-sm"
          type="text"
          value={newMessage}
          onChange={handleInputChange}
          placeholder="Type a message..."
          disabled={!isConnected}
        />
        <Button
          className="aspect-square rounded-full"
          type="submit"
          disabled={!isConnected || !newMessage.trim()}
        >
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
};
