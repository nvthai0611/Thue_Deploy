"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useGetTransaction } from "@/queries/transaction.queries";
import {
  Pagination,
  PaginationContent,
  //PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useState } from "react";

export default function TransactionCardList() {
  const [page, setPage] = useState(1);
  const limit = 2;
  const {
    data: transactions,
    isLoading,
    isError,
  } = useGetTransaction(page, limit);

  const totalPages = transactions?.pagination?.totalPages ?? 1;

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error loading transactions.</p>;

  return (
    <div className="grid gap-4">
      {transactions?.data.map((transaction: any) => {
        const status = transaction.zalo_payment.status;
        const statusText = status === 1 ? "Success" : "Failed";
        const statusColor =
          status === 1
            ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-200 dark:text-green-900 dark:hover:bg-green-300"
            : "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-200 dark:text-red-900 dark:hover:bg-red-300";

        return (
          <Card
            key={transaction._id}
            className="p-6 border rounded-2xl shadow-md hover:shadow-lg transition-shadow bg-background"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-secondary-foreground">
                  Transaction ID
                </p>
                <p className="text-base font-semibold text-secondary-foreground">
                  {transaction.zalo_payment.app_trans_id}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-secondary-foreground">Date</p>
                <p className="text-sm font-medium text-secondary-foreground">
                  {format(
                    new Date(transaction.zalo_payment.createdAt),
                    "HH:mm dd/MM/yyyy"
                  )}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Type</p>
                <p className="capitalize font-medium text-sm text-gray-800 dark:text-gray-200">
                  {transaction.type}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Amount
                </p>
                <p className="text-sm font-bold text-green-600 dark:text-green-400">
                  {transaction.zalo_payment.amount.toLocaleString("en-US")}₫
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Status
                </p>
                <Badge className={`text-xs ${statusColor} `}>
                  {statusText}
                </Badge>
              </div>

              {transaction.notes && (
                <div className="md:col-span-1 col-span-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Note
                  </p>
                  <p className="italic text-sm text-gray-700 dark:text-gray-300">
                    {transaction.notes}
                  </p>
                </div>
              )}
            </div>
          </Card>
        );
      })}

      <Pagination>
        <PaginationContent className="text-neutral-400 ">
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (page > 1) setPage(page - 1);
              }}
            />
          </PaginationItem>

          {[...Array(totalPages)].map((_, i) => (
            <PaginationItem key={i}>
              <PaginationLink
                href="#"
                isActive={page === i + 1}
                onClick={(e) => {
                  e.preventDefault();
                  setPage(i + 1);
                }}
                className={`px-3 py-1 rounded-md border text-sm text-black ${
                  page === i + 1 ? "bg-red-500 hover:bg-red-500 text-white" : ""
                }`}
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (page < totalPages) setPage(page + 1);
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
