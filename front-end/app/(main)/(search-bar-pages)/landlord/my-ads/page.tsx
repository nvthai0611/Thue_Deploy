"use client";

import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import Listing from "./publish/page";

export default function MyAds() {
  return (
    <Suspense fallback={<Loader2 className="animate-spin h-6 w-6 mx-auto" />}>
      <Listing />
    </Suspense>
  );
}

export const dynamic = "force-dynamic";
