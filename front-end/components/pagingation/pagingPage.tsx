"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface IPaging {
  page: number;
  setPage: (newPage: number | ((prev: number) => number)) => void;
  totalpage: number;
}

const PagingPage = ({ page, setPage, totalpage }: IPaging) => {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(pathname?.startsWith("/admin") ?? false);
  }, [pathname]);
  const getPageNumbers = () => {
    const maxPagesToShow = 5; 
    const pages: (number | "ellipsis")[] = [];

    if (totalpage <= maxPagesToShow) {
      return Array.from({ length: totalpage }, (_, i) => i + 1);
    }
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(totalpage, startPage + maxPagesToShow - 1);
    const adjustedStartPage = Math.max(1, endPage - maxPagesToShow + 1);
    for (let i = adjustedStartPage; i <= endPage; i++) {
      pages.push(i);
    }
    if (adjustedStartPage > 1) {
      pages.unshift("ellipsis");
      pages.unshift(1); 
    }
    if (endPage < totalpage) {
      pages.push("ellipsis");
      pages.push(totalpage); 
    }

    return pages;
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            className={`${
              page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
            } ${isAdmin ? "text-white" : "text-black"} ${
              page !== 1 ? "hover:bg-red-600 hover:text-white" : ""
            } transition-colors`}
            aria-disabled={page === 1}
          />
        </PaginationItem>
        {getPageNumbers().map((pageNumber, index) =>
          pageNumber === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={pageNumber}>
              <PaginationLink
                onClick={() => setPage(pageNumber)}
                isActive={page === pageNumber}
                className={`${
                  page === pageNumber
                    ? "bg-red-500 text-white hover:bg-red-500 hover:text-white"
                    : isAdmin
                      ? "text-white hover:text-red-500"
                      : "text-black hover:text-red-500"
                } transition-colors cursor-pointer`}
                aria-current={page === pageNumber ? "page" : undefined}
              >
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          )
        )}
        <PaginationItem>
          <PaginationNext
            onClick={() => setPage((prev) => Math.min(prev + 1, totalpage))}
            className={`${
              page === totalpage ? "pointer-events-none opacity-50" : "cursor-pointer"
            } ${isAdmin ? "text-white" : "text-black"} ${
              page !== totalpage ? "hover:bg-red-600 hover:text-white" : ""
            } transition-colors`}
            aria-disabled={page === totalpage}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default PagingPage;