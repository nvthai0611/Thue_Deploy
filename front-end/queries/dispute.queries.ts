import { DisputeResolution } from "@/lib/type";
import fetchWithAuth from "@/utils/api/fetchWithAuth";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useCreateDispute = () => {
  return useMutation({
    mutationFn: (data: {
      contract_id: string;
      reason: string;
      evidence: string[];
    }) =>
      fetchWithAuth("/api/disputes/add", {
        method: "POST",
        body: JSON.stringify({ dispute: data }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.success) {
            throw new Error(data.message || "Create dispute failed");
          }
          return data.data;
        }),
  });
};

export const useGetDisputeByContractId = (contractId: string) => {
  return useQuery({
    queryKey: ["dispute", contractId],
    queryFn: () =>
      fetchWithAuth(`/api/disputes/get-by-contract/${contractId}`)
        .then((res) => res.json())
        .then((data) => {
          if (!data.success) {
            throw new Error(data.message || "Get dispute failed");
          }
          return data.data;
        }),
    enabled: !!contractId,
  });
};

// export const useGetListDisputes = (page: number = 1, limit: number = 10) => {
//   return useQuery({
//     queryKey: ["dispute", page, limit],
//     queryFn: () =>
//       fetchWithAuth(`/api/disputes/get-list-search?page=${page}&limit=${limit}`)
//         .then((res) => {
//           if (!res.ok) throw new Error("Failed to fetch list disputes");
//           return res.json();
//         })
//         .then((data) => data.data),
//   });
// };

export const useGetDisputeById = (disputeId: string | undefined) => {
  return useQuery({
    queryKey: ["dispute", disputeId],
    enabled: !!disputeId,
    queryFn: () =>
      fetchWithAuth(`/api/disputes/detail/${disputeId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch dispute");
          return res.json();
        })
        .then((data) => data.data),
  });
};

export const useGetListDisputes = (
  page: number = 1,
  limit: number = 10,
  status: string = ""
) => {
  let url = `/api/disputes/get-list-search?page=${page}&limit=${limit}`;
  if (status !== "") {
    url += `&status=${status}`;
  }
  return useQuery({
    queryKey: ["dispute", page, limit, status],
    queryFn: () =>
      fetchWithAuth(url)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch list disputes");
          return res.json();
        })
        .then((data) => data.data),
  });
};

export const useAdminHandleDisputeDecision = () => {
  return useMutation({
    mutationFn: (data: {
      disputeId: string;
      reason: string;
      decision: DisputeResolution;
    }) =>
      fetchWithAuth(`/api/disputes/admin-handle-decision/${data.disputeId}`, {
        method: "PATCH",
        body: JSON.stringify({
          reason: data.reason,
          decision: data.decision,
        }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to handle dispute decision");
          return res.json();
        })
        .then((data) => {
          if (!data.success) {
            throw new Error(data.message || "Handle dispute decision failed");
          }
          return data.data;
        }),
  });
};
