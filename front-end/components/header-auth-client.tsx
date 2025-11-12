"use client";

import { useEffect, useState } from "react";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/client";
import { useUserStore } from "@/store/useUserStore";
import SignInButton from "./auth/signin-button";
import SignUpButton from "./auth/signup-button";

export default function AuthButton() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [userDetail, setUserDetail] = useState<any>(null);

  const onSignOut = async () => {
    await supabase.auth.signOut();
    useUserStore.persist.clearStorage();
    window.location.reload();
  };

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      if (data.user) {
        const { data: userDetails } = await supabase
          .from("users")
          .select("*")
          .eq("auth_user_id", data.user.id)
          .single();
        setUserDetail(userDetails);
      }
    };
    getUser();
  }, []);

  if (!hasEnvVars) {
    return (
      <div className="flex gap-4 items-center">
        <Badge variant={"default"} className="font-normal pointer-events-none">
          Please update .env.local file with anon key and url
        </Badge>
        <div className="flex gap-2">
          <SignInButton />
          <SignUpButton />
        </div>
      </div>
    );
  }

  return user ? (
    <div className="flex items-center gap-4">
      Hey, {userDetail?.name} !
      <Button variant={"outline"} onClick={onSignOut}>
        Đăng xuất
      </Button>
    </div>
  ) : (
    <div className="flex gap-2">
      <SignInButton />
      <SignUpButton />
    </div>
  );
}
