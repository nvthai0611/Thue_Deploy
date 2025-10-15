"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import SearchHeader from "@/components/header-search";

export default function LayoutContent({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const pathname = usePathname();
  const router = useRouter();

  const handleSearch = (value?: string) => {
    const query = value ?? searchQuery;
    if (pathname !== "/search") {
      router.push(`/search?query=${encodeURIComponent(query)}`);
    } else {
      router.push(`/search?query=${encodeURIComponent(query)}&page=1`);
    }
  };

  return (
    <>
      <SearchHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearch}
      />
      {children}
    </>
  );
}
