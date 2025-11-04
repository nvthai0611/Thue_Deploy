import fetchWithAuth from "@/utils/api/fetchWithAuth";
import { useQuery } from "@tanstack/react-query";

export type TransactionRecord = {
  _id: string;
  user_id?: string | null;
  user?: {
    full_name?: string | null;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    role?: string | null;
    is_active?: boolean;
    last_active?: string | null;
    [key: string]: unknown;
  } | null;
  contract_id?: string | null | Record<string, unknown>;
  housing_area_id?: string | null | Record<string, unknown>;
  room_id?: string | null | Record<string, unknown>;
  type: string;
  zalo_payment?: {
    app_id?: number;
    app_trans_id?: string;
    app_time?: number;
    app_user?: string;
    amount?: number;
    channel?: number;
    status?: number;
    callback_received?: boolean;
    refunds?: unknown;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: unknown;
  } | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
};

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

export const useGetAllTransactions = () =>
  useQuery<TransactionRecord[]>({
    queryKey: ["transactions", "all"],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/transactions/all");
      if (!res.ok) {
        throw new Error("Failed to fetch all transactions");
      }
      const payload = await res.json();
      return Array.isArray(payload?.data) ? payload.data : [];
    },
  });
