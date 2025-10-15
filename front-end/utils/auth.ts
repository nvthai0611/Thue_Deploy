import { createClient } from "@/lib/server";

export interface UserWithData {
  user: any | null;
  userData: { role: string } | null;
  error: string | null;
}

/**
 * Get user role from JWT token (fast, no DB query needed)
 */
export async function getUserRoleFromJWT(): Promise<{
  user: any | null;
  role: string | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();

    // Get user from session (this reads JWT)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { user: null, role: null, error: "No user found" };
    }

    // Get role from JWT app_metadata
    const role = user.app_metadata?.role || user.user_metadata?.role || null;

    return { user, role, error: null };
  } catch (error) {
    return {
      user: null,
      role: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Check if user has landlord or admin role (works with both string and object)
 */
export function isLandlordOrAdmin(
  roleOrUserData: string | { role: string } | null
): boolean {
  if (!roleOrUserData) return false;

  const role =
    typeof roleOrUserData === "string" ? roleOrUserData : roleOrUserData.role;
  return role === "landlord" || role === "admin";
}

/**
 * Check if user has admin role (works with both string and object)
 */
export function isAdmin(
  roleOrUserData: string | { role: string } | null
): boolean {
  if (!roleOrUserData) return false;

  const role =
    typeof roleOrUserData === "string" ? roleOrUserData : roleOrUserData.role;
  return role === "admin";
}
