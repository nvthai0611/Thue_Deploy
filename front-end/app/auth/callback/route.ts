import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the SSR package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirectTo = requestUrl.searchParams.get("redirect_to")?.toString();

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error("OAuth callback error:", error);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/sign-in?error=Authentication failed`);
    }

    // Check if user is active after successful authentication
    if (data.user) {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("is_active")
        .eq("auth_user_id", data.user.id)
        .single();

      if (userError) {
        console.error("Error checking user status:", userError);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/sign-in?error=Failed to verify user status`);
      }

      if (!userData?.is_active) {
        // Sign out inactive user and redirect to sign-in with error
        await supabase.auth.signOut();
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/sign-in?error=Account has been disabled`);
      }
    }
  }

  // Use NEXT_PUBLIC_SITE_URL instead of origin to avoid internal port issues on Render
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  if (redirectTo) {
    return NextResponse.redirect(`${baseUrl}${redirectTo}`);
  }

  // Redirect to redirect page after successful OAuth authentication
  return NextResponse.redirect(`${baseUrl}/redirect`);
}
