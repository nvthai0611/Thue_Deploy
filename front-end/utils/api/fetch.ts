export async function fetchWithoutAuth(input: RequestInfo, init?: RequestInit) {
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

  // If input is a string and starts with "/", prepend the base URL
  const url =
    typeof input === "string" && input.startsWith("/")
      ? API_BASE_URL + input
      : input;

  // Make the fetch request with provided input and options
  const response = await fetch(url, {
    ...init,
    headers: {
      ...(init?.headers || {}), // Merge any custom headers from init
      "Content-Type": "application/json", // Default content type
    },
  });

  // Check if response is not OK (status not 2xx)
  if (!response.ok) {
    throw new Error(`Fetch error: ${response.status} - ${response.statusText}`);
  }

  // Return the response
  return response;
}
