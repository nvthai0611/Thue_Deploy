import fetchWithAuth from "@/utils/api/fetchWithAuth";
import { useQuery } from "@tanstack/react-query";

export const useGetTransaction = (
  page: number = 1,
  limit: number = 10
) =>
  useQuery({
    queryKey: ["transactions", page, limit],
    queryFn: () =>
      fetchWithAuth(`/api/transactions/history?page=${page}&limit=${limit}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch transactions");
          return res.json();
        })
        .then((data) => data),
  });
