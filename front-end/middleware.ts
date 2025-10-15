import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import { getUserRoleFromJWT, isLandlordOrAdmin, isAdmin } from "@/utils/auth";
import { createClient } from "@/utils/supabase/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if user is active for all protected routes
  const { user, role, error } = await getUserRoleFromJWT();
  
  if (user && !error) {
    // Check if user is active in database
    const supabase = await createClient();
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("is_active")
      .eq("auth_user_id", user.id)
      .single();

    if (!userError && userData && !userData.is_active) {
      // User is inactive, sign them out and redirect to home
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Handle /landlord routes - require landlord or admin role
  if (pathname.startsWith("/landlord")) {
    // Danh sách các route cho phép user truy cập để resubmit
    const allowedUserRoutes = [
      "/landlord/register/property-document",
      "/landlord/register/identification-information",
      "/landlord/register/complete",
    ];

    // Cho phép user truy cập các route resubmit
    if (allowedUserRoutes.includes(pathname)) {
      // Chỉ cần kiểm tra user đã đăng nhập
      if (error || !user) {
        return NextResponse.redirect(new URL("/", request.url));
      }

      // Cho phép tất cả user đã đăng nhập truy cập các route này
      return await updateSession(request);
    }

    if (error) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (!user) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Check if user has landlord or admin role
    if (!isLandlordOrAdmin(role)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Handle /admin routes - require admin role only
  if (pathname.includes("/admin/")) {
    if (error) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (!user) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Check if user has admin role
    if (!isAdmin(role)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
