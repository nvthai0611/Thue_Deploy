"use client";

import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/client";
import { SupabaseUser } from "@/lib/type";
import { useGetOneUser, useGetMultipleUsers } from "@/queries/user.queries";
import { useUserStore } from "@/store/useUserStore";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUserId = useUserStore((state) => state.userId);
  const { id: otherUserId } = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [otherUserInfo, setOtherUserInfo] = useState<SupabaseUser | null>(null);

  // Fetch other user info from Supabase
  useEffect(() => {
    if (!otherUserId) return;
    supabase
      .from("users")
      .select("last_active")
      .eq("auth_user_id", otherUserId)
      .single()
      .then(({ data }) => setOtherUserInfo(data as SupabaseUser));
  }, [otherUserId, supabase]);

  const isOtherUserActive =
    otherUserInfo?.last_active &&
    Date.now() - new Date(otherUserInfo.last_active).getTime() < 60 * 1000; // online if active within 1 minute

  // Get current user's information
  const { data: userDetail } = useGetOneUser(currentUserId);
  const chatWithUsers: string[] = userDetail?.chat_with || [];

  const chatWithUsersString = useMemo(
    () => chatWithUsers.join(","),
    [chatWithUsers]
  );

  const [chatUsers, setChatUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  // get avatar_url for all users in chatWithUsers
  const userQueries = useGetMultipleUsers(chatWithUsers);

  const userQueriesDataString = useMemo(() => {
    return userQueries.map((query) => JSON.stringify(query.data)).join(",");
  }, [userQueries]);

  useEffect(() => {
    if (!chatWithUsers.length) {
      setChatUsers([]);
      return;
    }

    const fetchUsers = async () => {
      // Get user detail from Supabase (include last_active)
      const { data: usersData, error } = await supabase
        .from("users")
        .select("auth_user_id, name, last_active")
        .in("auth_user_id", chatWithUsers);

      if (error) {
        console.error("Error fetching users:", error);
        return;
      }

      // Create a map from auth_user_id to avatar_url
      const avatarMap: Record<string, string> = {};
      chatWithUsers.forEach((id, idx) => {
        avatarMap[id] =
          userQueries[idx]?.data?.avatar_url || "/avatars/default.png";
      });

      // Combine name, avatar_url, and last_active
      const combinedUsers = usersData?.map((user) => ({
        auth_user_id: user.auth_user_id,
        name: user.name,
        avatar_url: avatarMap[user.auth_user_id] || "/avatars/default.png",
        last_active: user.last_active,
      }));

      setChatUsers((prev) => {
        const newDataString = JSON.stringify(combinedUsers);
        const prevDataString = JSON.stringify(prev);
        return newDataString !== prevDataString ? combinedUsers || [] : prev;
      });
    };

    fetchUsers();
  }, [chatWithUsersString, userQueriesDataString]);

  // Filter chat users by name
  const filteredChatUsers = chatUsers.filter((user) =>
    user.name?.toLowerCase().includes(search.toLowerCase())
  );

  // Get the user that is currently being chatted with
  const chattingUser = chatUsers.find((u) => u.auth_user_id === otherUserId);

  return (
    <div className="bg-primary-foreground py-10">
      <div className="flex h-[70vh] w-full max-w-5xl mx-auto rounded-xl shadow-lg overflow-hidden border">
        {/* Left column: User list */}
        <div className="w-1/3 bg-primary-foreground border-r flex flex-col">
          <div className="p-2 border-b">
            <h2 className="text-xl font-bold text-foreground">Contacts</h2>
            <Input
              type="text"
              className="mt-2 w-full px-3 py-2 border rounded"
              placeholder="Search account..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <ul className="flex-1 overflow-y-auto">
            {filteredChatUsers.length === 0 && (
              <li className="px-4 py-3 text-foreground">No contacts found.</li>
            )}
            {filteredChatUsers
              .filter((u) => u.auth_user_id !== currentUserId)
              .map((user) => {
                // Determine if user is active
                const isActive =
                  user.last_active &&
                  Date.now() - new Date(user.last_active).getTime() < 60 * 1000;
                return (
                  <li
                    key={user.auth_user_id}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-100 transition ${
                      otherUserId === user.auth_user_id
                        ? "bg-secondary-foreground/10"
                        : ""
                    }`}
                    onClick={() => router.push(`/chat/${user.auth_user_id}`)}
                  >
                    <div className="relative">
                      <img
                        src={user.avatar_url || "/avatars/default.png"}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover border"
                      />
                      {/* Active status dot */}
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                          isActive ? "bg-green-500" : "bg-gray-400"
                        }`}
                        title={isActive ? "Online" : "Offline"}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-foreground">
                        {user.name}
                      </div>
                    </div>
                  </li>
                );
              })}
          </ul>
        </div>
        {/* Right column: Chat box */}
        <div className="flex-1 flex flex-col">
          {/* Chatting user's information */}
          {chattingUser && (
            <div className="flex items-center gap-3 px-6 py-4 border-b bg-background flex-shrink-0">
              <div className="relative">
                <img
                  src={chattingUser.avatar_url || "/avatars/default.png"}
                  alt={chattingUser.name}
                  className="w-12 h-12 rounded-full object-cover border"
                />
                {/* Active status dot */}
                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                    isOtherUserActive ? "bg-green-500" : "bg-gray-400"
                  }`}
                  title={isOtherUserActive ? "Online" : "Offline"}
                />
              </div>
              <div>
                <div className="font-semibold text-lg">{chattingUser.name}</div>
              </div>
            </div>
          )}
          {/* Chat box */}
          <div className="flex-1 flex flex-col overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}
