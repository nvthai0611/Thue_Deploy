"use client";

import { createClient } from "@/lib/client";
import { useUserStore } from "@/store/useUserStore";
import { useEffect } from "react";

export default function UpdateUserLastActive() {
  const currentUserId = useUserStore((state) => state.userId);
  const supabase = createClient();

  useEffect(() => {
    if (!currentUserId) return;
    const interval = setInterval(() => {
      supabase
        .from("users")
        .update({ last_active: new Date().toISOString() })
        .eq("auth_user_id", currentUserId)
        .then(({ error, data }) => {
          if (error) {
            console.error("Update last_active error:", error);
          } else {
            console.log("Update last_active success:", data);
          }
        });
    }, 30000);

    return () => clearInterval(interval);
  }, [currentUserId]);
  return null;
}
