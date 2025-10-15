import fetchWithAuth from "@/utils/api/fetchWithAuth";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useCreateContract = (roomId: string) =>
  useMutation({
    mutationFn: async (contractData: { end_date: string }) => {
      const res = await fetchWithAuth(`/api/contracts/add/${roomId}`, {
        method: "POST",
        body: JSON.stringify(contractData),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Failed to create contract");
      }

      return data.data;
    },
  });

export const useGetTenantContracts = () => {
  return useQuery({
    queryKey: ["tenantContracts"],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/contracts/get-by-tenant");
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Failed to fetch tenant contracts");
      }
      return data.data;
    },
  });
};

export const useGetLandlordContracts = () => {
  return useQuery({
    queryKey: ["landlordContracts"],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/contracts/get-by-owner");
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Failed to fetch landlord contracts");
      }
      return data.data;
    },
  });
};

export const useGetContractById = (contractId: string) => {
  return useQuery({
    queryKey: ["contract", contractId],
    queryFn: async () => {
      const res = await fetchWithAuth(`/api/contracts/get-by-id/${contractId}`);
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Failed to fetch contract");
      }
      return data.data;
    },
  });
};

export const useSignByLandlord = (contractId: string) =>
  useMutation({
    mutationFn: async () => {
      const res = await fetchWithAuth(
        `/api/contracts/sign-by-landlord/${contractId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Failed to sign contract by landlord");
      }
      return data.data;
    },
  });

export const useRequestExtension = (contractId: string) => {
  return useMutation({
    mutationFn: async (new_end_date: Date) => {
      const res = await fetchWithAuth(
        `/api/contracts/request-extension/${contractId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            new_end_date: new_end_date.toISOString(),
          }),
        }
      );
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Failed to request extension");
      }
      return data.data;
    },
  });
};

export const useConfirmExtension = (contractId: string) => {
  return useMutation({
    mutationFn: async () => {
      const res = await fetchWithAuth(
        `/api/contracts/confirm-extension/${contractId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Failed to confirm extension");
      }
      return data.data;
    },
  });
};

export const useGetLandlordContractStatistics = () => {
  return useQuery({
    queryKey: ["landlordContractStatistics"],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/contracts/statistics-by-owner");
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Failed to fetch contract statistics");
      }
      return data.data;
    },
  });
};

