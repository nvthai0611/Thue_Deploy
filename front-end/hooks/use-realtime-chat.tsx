import { createClient } from "@/lib/client";
import { useEffect, useState, useCallback, useRef } from "react";

// Message interface
export interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

/**
 * Custom hook for real-time chat between two users, including typing indicator.
 * Requires a 'messages' table and a 'typing_status' table in your Supabase database.
 */
export function useRealtimeChat(currentUserId: string, otherUserId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const supabase = createClient();
  const typingChannelRef = useRef<any>(null);

  // Fetch all messages between the two users
  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`
        )
        .order("created_at", { ascending: true });

      if (!error && data) setMessages(data);
    };
    fetchMessages();
  }, [currentUserId, otherUserId, supabase]);

  // Subscribe to new messages in real-time
  useEffect(() => {
    if (!currentUserId || !otherUserId) return;

    const channelName = `messages-${[currentUserId, otherUserId].sort().join("-")}`;
    const newChannel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new as ChatMessage;
          // Only add messages between the two users
          if (
            (msg.sender_id === currentUserId &&
              msg.receiver_id === otherUserId) ||
            (msg.sender_id === otherUserId && msg.receiver_id === currentUserId)
          ) {
            setMessages((prev) => [...prev, msg]);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages" },
        (payload) => {
          const updatedMsg = payload.new as ChatMessage;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === updatedMsg.id ? { ...msg, ...updatedMsg } : msg
            )
          );
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    return () => {
      newChannel.unsubscribe().catch(() => {});
      setIsConnected(false);
    };
  }, [currentUserId, otherUserId, supabase]);

  // Subscribe to typing status changes in real-time
  useEffect(() => {
    if (!currentUserId || !otherUserId) return;

    const typingChannel = supabase
      .channel(`typing-${[currentUserId, otherUserId].sort().join("-")}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "typing_status" },
        (payload) => {
          const { user_id, is_typing, chat_with } = payload.new;
          // Listen for typing status from the other user
          if (user_id === otherUserId && chat_with === currentUserId) {
            setOtherUserTyping(is_typing);
          }
        }
      )
      .subscribe();

    typingChannelRef.current = typingChannel;

    return () => {
      typingChannel.unsubscribe().catch(() => {});
    };
  }, [currentUserId, otherUserId, supabase]);

  /**
   * Send typing status to the database.
   * @param is_typing - true if the user is typing, false otherwise
   */
  const sendTyping = useCallback(
    async (is_typing: boolean) => {
      await supabase.from("typing_status").upsert({
        user_id: currentUserId,
        chat_with: otherUserId,
        is_typing,
        updated_at: new Date().toISOString(),
      });
    },
    [currentUserId, otherUserId, supabase]
  );

  /**
   * Stop typing (set typing status to false)
   */
  const stopTyping = useCallback(() => {
    sendTyping(false);
  }, [sendTyping]);

  /**
   * Listen to typing status changes from the other user.
   * @param cb - callback function to receive typing status (true/false)
   * @returns unsubscribe function (currently a no-op)
   */
  const listenTyping = useCallback((cb: (isTyping: boolean) => void) => {
    // You can use useEffect in your component to watch 'otherUserTyping'
    // and call cb(otherUserTyping) if needed.
    // This is a placeholder for future extensibility.
    const unsubscribe = () => {};
    return unsubscribe;
  }, []);

  /**
   * Send a new chat message.
   * @param content - message content
   */
  const sendMessage = useCallback(
    async (content: string) => {
      await supabase.from("messages").insert({
        sender_id: currentUserId,
        receiver_id: otherUserId,
        content,
        created_at: new Date().toISOString(),
      });
    },
    [currentUserId, otherUserId, supabase]
  );

  return {
    messages,
    sendMessage,
    isConnected,
    sendTyping,
    stopTyping,
    listenTyping,
    otherUserTyping,
  };
}
