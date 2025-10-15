"use client";
import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useUserStore } from "@/store/useUserStore";
import { jwtDecode } from "jwt-decode";

export default function UpdateUserStorage() {
  const setUserId = useUserStore((state) => state.setUserId);
  const setUserRole = useUserStore((state) => state.setUserRole);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const accessToken = data?.session?.access_token;
      console.log("Access Token (client):", accessToken);

      if (accessToken) {
        try {
          const decoded: any = jwtDecode(accessToken);

          if (decoded?.sub) {
            setUserId(decoded.sub);

            supabase
              .from("users")
              .select("*")
              .eq("auth_user_id", decoded.sub)
              .single()
              .then(({ data, error }) => {
                if (error) {
                  console.error("Error fetching user data:", error);
                  return;
                }

                // Check if user is active
                if (!data?.is_active) {
                  console.log("User is inactive, signing out...");
                  supabase.auth.signOut();
                  setUserId("");
                  setUserRole("user");
                  return;
                }

                const userRole = data?.role || "user";
                console.log("User Role:", userRole);

                setUserRole(userRole);
              });
          }
        } catch (err) {
          console.error("Error decoding token:", err);
        }
      }
    });
  }, [setUserId, setUserRole]);

  return null;
}
