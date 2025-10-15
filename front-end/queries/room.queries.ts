import { fetchWithoutAuth } from "@/utils/api/fetch";
import fetchWithAuth from "@/utils/api/fetchWithAuth";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useSearchRooms = (
  searchTerm: string,
  page?: number,
  limit?: number,
  minPrice?: number,
  maxPrice?: number,
  minArea?: number,
  maxArea?: number,
  type?: string,
  sortBy?: string,
  sortOder?: string,
  facility?: string[]
) => {
  const param = new URLSearchParams();

  if (searchTerm) param.set("title", searchTerm);
  if (page) param.set("page", page.toString());
  if (limit) param.set("limit", limit.toString());
  if (minPrice) param.set("minPrice", minPrice.toString());
  if (maxPrice) param.set("maxPrice", maxPrice.toString());
  if (minArea) param.set("minArea", minArea.toString());
  if (maxArea) param.set("maxArea", maxArea.toString());
  if (type) param.set("type", type);
  if (sortBy) param.set("sortBy", sortBy);
  if (sortOder) param.set("sortOrder", sortOder);
  // if (maxOccupancy) param.set("maxOccupancy", maxOccupancy.toString());
  if (facility)
    facility.map((facility) => {
      param.set("facilities", facility);
    });

  return useQuery({
    queryKey: [
      "rooms",
      searchTerm,
      page,
      limit,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      type,
      sortBy,
      sortOder,
      facility,
    ],
    queryFn: () =>
      fetchWithoutAuth(`/api/rooms/search?${param.toString()}`).then((res) =>
        res.json()
      ),
    // enabled: !!searchTerm,
    staleTime: 5 * 60 * 1000,
  });
};

export const useGetRoomsByHousingAreaId = (housingAreaId: string | undefined) =>
  useQuery({
    queryKey: ["rooms", housingAreaId],
    enabled: !!housingAreaId,
    queryFn: () =>
      fetchWithAuth(`/api/rooms/by-housing-area/${housingAreaId}`)
        .then((res) => res.json())
        .then((data) => {
          return data.data;
        }),
  });

export const useGetRoomDetailByRoomId = (roomId: string | undefined) =>
  useQuery({
    queryKey: ["room", roomId],
    enabled: !!roomId,
    queryFn: () =>
      fetchWithAuth(`/api/rooms/detail/${roomId}`)
        .then((res) => res.json())
        .then((data) => {
          return data.data;
        }),
  });

export const useUpdateRoom = () => {
  return useMutation({
    mutationFn: async (updateData: any) => {
      const res = await fetchWithAuth(`/api/rooms/update/${updateData.id}`, {
        method: "PATCH",
        body: JSON.stringify(updateData),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Update failed");
      }
      return data.data;
    },
  });
};

export const useAddRoom = () => {
  return useMutation({
    mutationFn: async (roomData: any) => {
      const res = await fetchWithAuth("/api/rooms/add-many", {
        method: "POST",
        body: JSON.stringify(roomData),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Add room failed");
      }
      return data.data;
    },
  });
};

export const useDeleteRoom = () => {
  return useMutation({
    mutationFn: async (roomId: string) => {
      const res = await fetchWithAuth(`/api/rooms/delete/${roomId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Delete room failed");
      }
      return data.data;
    },
  });
};

export const useGetTopHousingAreasWithRooms = (topN?: number) =>
  useQuery({
    queryKey: ["topN", topN],
    queryFn: () =>
      fetchWithAuth(
        `/api/housing-areas/top-rated-with-rooms?topN=${topN}`
      ).then((res) => res.json()),
  });

export const useGetBoostingRooms = () => {
  return useQuery({
    queryKey: ["boosting-rooms"],
    queryFn: () =>
      fetchWithAuth(`/api/rooms/get-boosting-rooms`)
        .then((res) => res.json())
        .then((data) => {
          return data.data;
        }),
  });
};

export const useAddSavedRoom = () => {
  return useMutation({
    mutationFn: async (roomId: string) => {
      const res = await fetchWithAuth(`/api/rooms/add-saved-room/${roomId}`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Add saved room failed");
      }
      return data.data;
    },
  });
};

export const useDeleteSavedRoom = () => {
  return useMutation({
    mutationFn: async (roomId: string) => {
      const res = await fetchWithAuth(
        `/api/rooms/delete-room-saved/${roomId}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Delete saved room failed");
      }
      return data.data;
    },
  });
};

export const useGetSavedRooms = () => {
  return useQuery({
    queryKey: ["saved-rooms"],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/rooms/get-list-saved-rooms");
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Get saved rooms failed");
      }
      return data.data;
    },
  });
};
