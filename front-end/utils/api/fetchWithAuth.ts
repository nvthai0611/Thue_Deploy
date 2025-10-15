import { createClient } from "../supabase/client";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default async function fetchWithAuth(
  input: RequestInfo,
  init?: RequestInit
) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error("Error fetching session:", error);
    throw new Error("Unauthorized");
  }

  const accessToken = data?.session?.access_token;

  const url =
    typeof input === "string" && input.startsWith("/")
      ? API_BASE_URL + input
      : input;

  return fetch(url, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      Authorization: accessToken ? `Bearer ${accessToken}` : "",
      "Content-Type": "application/json",
    },
  });
}
