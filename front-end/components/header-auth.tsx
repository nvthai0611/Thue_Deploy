import { signOutAction } from "@/app/actions";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { createClient } from "@/utils/supabase/server";
import SignInButton from "./auth/signin-button";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import SignUpButton from "./auth/signup-button";
import ClearUserStorage from "./auth/clear-user-storage";

export default async function AuthButton() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: userDetail } = await supabase
    .from("users")
    .select("*")
    .eq("auth_user_id", user?.id)
    .single();

  if (!hasEnvVars) {
    return (
      <>
        <div className="flex gap-4 items-center">
          <div>
            <Badge
              variant={"default"}
              className="font-normal pointer-events-none"
            >
              Please update .env.local file with anon key and url
            </Badge>
          </div>
          <div className="flex gap-2">
            <SignInButton />
            <SignUpButton />
          </div>
        </div>
      </>
    );
  }
  return user ? (
    <div className="flex items-center gap-4">
      Hey, {userDetail.name} !
      <form action={signOutAction}>
        <Button type="submit" variant={"outline"}>
          Sign out
        </Button>
      </form>
    </div>
  ) : (
    <div className="flex gap-2">
      <ClearUserStorage />
      <SignInButton />
      <SignUpButton />
    </div>
  );
}
