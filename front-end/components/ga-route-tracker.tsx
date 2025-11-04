// components/ga-route-tracker.tsx
"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function GARouteTracker({
  gaId = process.env.NEXT_PUBLIC_GA_ID ?? "G-LMBP6Q6JBW",
}: { gaId?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined") return;
    // @ts-ignore
    const gtag = window.gtag as undefined | ((...args: any[]) => void);
    if (!gtag || !gaId) return;

    const query = searchParams?.toString();
    const page_path = pathname || "/";
    const page_location = `${window.location.origin}${page_path}${query ? `?${query}` : ""}`;

    gtag("event", "page_view", {
      page_title: document.title,
      page_path,
      page_location,
      send_to: gaId,
    });
  }, [gaId, pathname, searchParams]);

  return null;
}
