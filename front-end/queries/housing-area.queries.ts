import { HOUSING_AREA_STATUS } from "@/utils/constants/housing-area-status";
import { createClient } from "@/utils/supabase/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import fetchWithAuth from "../utils/api/fetchWithAuth";

export const useAddHousingArea = () =>
  useMutation({
    mutationFn: (housingAreaData: any) =>
      fetchWithAuth("/api/housing-areas/add", {
        method: "POST",
        body: JSON.stringify(housingAreaData),
      })
        .then((res) => res.json())
        .then((data) => {
          return data.data;
        }),
  });

export const useGetHousingAreaById = (housingAreaId: string | undefined) =>
  useQuery({
    queryKey: ["housingArea", housingAreaId],
    enabled: !!housingAreaId,
    queryFn: () =>
      fetchWithAuth(`/api/housing-areas/detail/${housingAreaId}`)
        .then((res) => res.json())
        .then((data) => data.data),
  });

export const useGetHousingAreasByUserId = (status?: string) => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  return useQuery({
    queryKey: ["housing-areas-by-user", status, user?.id],
    queryFn: async () => {
      const params = status ? `?status=${encodeURIComponent(status)}` : "";
      const res = await fetchWithAuth(`/api/housing-areas/by-user${params}`);
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Failed to fetch housing areas");
      }
      return data.data;
    },
    enabled: !!user,
  });
};

export const useDeleteHousingArea = () =>
  useMutation({
    mutationFn: (housingAreaId: string) =>
      fetchWithAuth(`/api/housing-areas/delete/${housingAreaId}`, {
        method: "DELETE",
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.success) {
            throw new Error(data.message || "Delete failed");
          }
          return data.data;
        }),
  });

export const useUpdateHousingArea = () =>
  useMutation({
    mutationFn: (updateData: any) =>
      fetchWithAuth(`/api/housing-areas/update-pending/${updateData.id}`, {
        method: "PATCH",
        body: JSON.stringify(updateData),
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.success) {
            throw new Error(data.message || "Update failed");
          }
          return data.data;
        }),
  });

export const useResubmitHousingArea = () =>
  useMutation({
    mutationFn: (updateData: any) =>
      fetchWithAuth(`/api/housing-areas/resubmit/${updateData.id}`, {
        method: "PATCH",
        body: JSON.stringify(updateData),
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.success) {
            throw new Error(data.message || "Update failed");
          }
          return data.data;
        }),
  });

export const useUserPublishHousingArea = (housingAreaId: string) =>
  useMutation({
    mutationFn: () =>
      fetchWithAuth(`/api/housing-areas/user-publish/${housingAreaId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: HOUSING_AREA_STATUS.PUBLISHED }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.success) {
            const err: any = new Error(data.message || "Publish failed");
            err.code = data.code;
            throw err;
          }
          return data.data;
        }),
  });

export const useUserUnpublishHousingArea = (housingAreaId: string) =>
  useMutation({
    mutationFn: () =>
      fetchWithAuth(`/api/housing-areas/user-unpublish/${housingAreaId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: HOUSING_AREA_STATUS.PENDING }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.success) {
            throw new Error(data.message || "Unpublish failed");
          }
          return data.data;
        }),
  });

export const useAddHousingAreaRating = (housingId: string) =>
  useMutation({
    mutationFn: (ratingData: any) =>
      fetchWithAuth("/api/housing-areas/add-rate/" + housingId, {
        method: "PATCH",
        body: JSON.stringify(ratingData),
      })
        .then((res) => res.json())
        .then((data) => {
          return data.data;
        }),
  });
export const useGetAllHouseAreaRating = (
  housingAreaId: string,
  limit?: number,
  page?: number
) => {
  return useQuery({
    queryKey: ["housingArea", housingAreaId, limit, page],
    enabled: !!housingAreaId,
    queryFn: () =>
      fetchWithAuth(
        `/api/housing-areas/rate-list/${housingAreaId}?page=${page}&limit=${limit}`
      )
        .then((res) => res.json())
        .then((data) => data.data),
  });
};

export const useAddRatingReply = (
  housingAreaId: string,
  ratingId: string | undefined
) =>
  useMutation({
    mutationFn: async (replyData: { role: string; content: string }) => {
      const res = await fetchWithAuth(
        `/api/housing-areas/rate-reply/${housingAreaId}/${ratingId}`,
        {
          method: "PATCH",
          body: JSON.stringify(replyData),
        }
      );
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Failed to add reply");
      }
      return data.data;
    },
  });

// export const useSearchRooms = (
//   searchTerm: string,
//   page: number,
//   limit: number,
//   minPrice: number,
//   maxPrice: number,
//   minArea: number,
//   maxArea: number,
//   type: string,
//   sortBy: string,
//   sortOder: string,
//   facility: string[]
// ) => {
//   const param = new URLSearchParams();

//   if (searchTerm) param.set("title", searchTerm);
//   if (page) param.set("page", page.toString());
//   if (limit) param.set("limit", limit.toString());
//   if (minPrice) param.set("minPrice", minPrice.toString());
//   if (maxPrice) param.set("maxPrice", maxPrice.toString());
//   if (minArea) param.set("minArea", minArea.toString());
//   if (maxArea) param.set("maxArea", maxArea.toString());
//   if (type) param.set("type", type);
//   if (sortBy) param.set("sortBy", sortBy);
//   if (sortOder) param.set("sortOrder", sortOder);
//   // if (maxOccupancy) param.set("maxOccupancy", maxOccupancy.toString());
//   if (facility)
//     facility.map((facility) => {
//       param.set("facilities", facility);
//     });

//   return useQuery({
//     queryKey: [
//       "rooms",
//       searchTerm,
//       page,
//       limit,
//       minPrice,
//       maxPrice,
//       minArea,
//       maxArea,
//       type,
//       sortBy,
//       sortOder,
//       facility,
//     ],
//     queryFn: () =>
//       fetchWithoutAuth(`/api/rooms/search?${param.toString()}`).then((res) =>
//         res.json()
//       ),
//     // enabled: !!searchTerm,
//     staleTime: 5 * 60 * 1000,
//   });
// };

export const adminSearchHousingArea = (
  status?: string | null,
  search?: string,
  isPendingUpdate?: boolean,
  page?: number,
  pageSize?: number
) => {
  const param = new URLSearchParams();
  if (status) param.set("status", status);
  if (search) param.set("search", search);
  if (isPendingUpdate) param.set("isPendingUpdate", `${isPendingUpdate}`);
  if (page) param.set("page", page.toString());
  if (pageSize) param.set("pageSize", pageSize.toString());
  return useQuery({
    queryKey: [
      "admin-housing-areas",
      status,
      search,
      isPendingUpdate,
      page,
      pageSize,
    ],
    queryFn: () =>
      fetchWithAuth(`/api/housing-areas/search?${param.toString()}`).then(
        (res) => res.json()
      ),
  });
};

// Admin Actions
export const useAdminPublishHousingArea = () =>
  useMutation({
    mutationFn: (housingAreaId: string) =>
      fetchWithAuth(`/api/housing-areas/admin-publish/${housingAreaId}`, {
        method: "PATCH",
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.success) {
            throw new Error(data.message || "Publish failed");
          }
          return data.data;
        }),
  });

export const useAdminUnpublishHousingArea = () =>
  useMutation({
    mutationFn: (housingAreaId: string) =>
      fetchWithAuth(`/api/housing-areas/admin-unpublish/${housingAreaId}`, {
        method: "PATCH",
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.success) {
            throw new Error(data.message || "Unpublish failed");
          }
          return data.data;
        }),
  });

export const useAdminApproveUpdate = () =>
  useMutation({
    mutationFn: (housingAreaId: string) =>
      fetchWithAuth(`/api/housing-areas/approve-update/${housingAreaId}`, {
        method: "PATCH",
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.success) {
            throw new Error(data.message || "Approve update failed");
          }
          return data.data;
        }),
  });

export const useAdminRejectUpdate = () =>
  useMutation({
    mutationFn: ({
      housingAreaId,
      reason,
    }: {
      housingAreaId: string | undefined;
      reason: string;
    }) =>
      fetchWithAuth(`/api/housing-areas/reject-update/${housingAreaId}`, {
        method: "PATCH",
        body: JSON.stringify({ reason }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.success) {
            throw new Error(data.message || "Reject update failed");
          }
          return data.data;
        }),
  });

export const useAdminUpdateHousingArea = () =>
  useMutation({
    mutationFn: ({
      housingAreaId,
      pendingUpdate,
    }: {
      housingAreaId: string;
      pendingUpdate: any;
    }) =>
      fetchWithAuth(`/api/housing-areas/update-admin/${housingAreaId}`, {
        method: "PATCH",
        body: JSON.stringify({ pendingUpdate }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.success) {
            throw new Error(data.message || "Admin update failed");
          }
          return data.data;
        }),
  });

export const useAdminDeleteHousingArea = () =>
  useMutation({
    mutationFn: (housingAreaId: string) =>
      fetchWithAuth(`/api/housing-areas/delete-admin/${housingAreaId}`, {
        method: "DELETE",
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.success) {
            throw new Error(data.message || "Delete failed");
          }
          return data.data;
        }),
  });
export const useAdminApproveHousingArea = () =>
  useMutation({
    mutationFn: (housingAreaId: string) =>
      fetchWithAuth("/api/housing-areas/approve/" + housingAreaId, {
        method: "PATCH",
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.success) {
            throw new Error(data.message || "Delete failed");
          }
          return data.data;
        }),
  });
export const useAdminRejectHousingArea = () =>
  useMutation({
    mutationFn: ({
      housingAreaId,
      reason,
    }: {
      housingAreaId: string;
      reason: string;
    }) =>
      fetchWithAuth("/api/housing-areas/reject/" + housingAreaId, {
        method: "PATCH",
        body: JSON.stringify({ reason }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.success) {
            throw new Error(data.message || "reject failed");
          }
          return data.data;
        }),
  });
