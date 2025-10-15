import { useQuery, useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import fetchWithAuth from "../utils/api/fetchWithAuth";
import { createClient } from "@/utils/supabase/client";
const supabase = createClient();
export const useGetAllUsers = () =>
  useQuery({
    queryKey: ["users"],
    queryFn: () =>
      fetchWithAuth("/api/users")
        .then((res) => res.json())
        .then((data) => {
          return data.data;
        }),
  });

export const useGetOneUser = (userId: string | undefined): any =>
  useQuery({
    queryKey: ["user", userId],
    enabled: !!userId,
    queryFn: () =>
      fetchWithAuth(`/api/users/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          return data.data;
        }),
  });

export const useUpdateUser = () =>
  useMutation({
    mutationFn: (userData: { userDetail: any }) =>
      fetchWithAuth("/api/users/update", {
        method: "PUT",
        body: JSON.stringify(userData),
      }).then((res) => res.json()),
  });

export const useUpdateChatWithUser = (chatId: string) =>
  useMutation({
    mutationFn: () =>
      fetchWithAuth(`/api/users/update-chat/${chatId}`, {
        method: "PATCH",
      }).then((res) => res.json()),
  });

export const useGetMultipleUsers = (userIds: string[]) =>
  useQueries({
    queries: userIds.map((userId) => ({
      queryKey: ["user", userId],
      queryFn: () =>
        fetchWithAuth(`/api/users/${userId}`)
          .then((res) => res.json())
          .then((data) => data.data),
      enabled: !!userId,
    })),
  });
export const useSearchUser = (
  search: string,
  page: number,
  limit: string,
  role: string,
  sortBy: string = 'created_at', 
  sortOrder: 'asc' | 'desc' = 'desc' ,
  status: string
) => {
  return useQuery({
    queryKey: ["users", search, page, limit, role, sortBy, status],
    queryFn: async () => {
      let query = supabase
        .from('users')
        .select('*', { count: 'exact' });

      if (search) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const ors = [`name.ilike.*${search}*`, `email.ilike.*${search}*`];
        if (uuidRegex.test(search)) {
          ors.push(`auth_user_id.eq.${search}`);
        }
        query = query.or(ors.join(','));
      }
      if (role) {
        query = query.eq('role', role);
      }
      if (sortBy) {
        query = query.order(sortBy, { ascending: sortOrder === 'asc' });
      }
      if(status){
        if(status == "active")
          query = query.eq("is_active", true)
        if(status == "deactive")
          query = query.eq("is_active", false)
      }
      const pageNum = page;
      const limitNum = parseInt(limit);
      const from = (pageNum - 1) * limitNum;
      const to = from + limitNum - 1;
      query = query.range(from, to);
      const { data, error, count } = await query;
      if (error) throw error;
      return {
        data,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: count || 0,
          totalPages: count ? Math.ceil(count / limitNum) : 0
        }
      };
    },
    // staleTime: 5 * 60 * 1000 
  });
}; 
export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      // get current user
      const { data: currentUser, error: fetchError } = await supabase
        .from('users')
        .select('is_active')
        .eq('auth_user_id', userId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Toggle is_active
      const newStatus = !currentUser.is_active;
      
      const { data, error } = await supabase
        .from('users')
        .update({ is_active: newStatus })
        .eq('auth_user_id', userId)
        .select()
        .single();
      
      if (error) throw error;
      
      // update status in MongoDB
      try {
        await fetchWithAuth("/api/users/changeStatus/" + userId, {
          method: "POST",
        });
      } catch (mongoError) {
        console.warn("Failed to update MongoDB status:", mongoError);
      }
      
      return data;
    }
  });
};
export async function useGetCount(type?: string): Promise<number> {
  let query = supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    if(type){
      if(type == "active")
        query = query.eq("is_active", true)
      if(type == "deactive")
        query = query.eq("is_active", false)


    }
    const {count, error} = await query
  return count ?? 0; 
}
export const getUserNameById = async (userId: string): Promise<string | null> => {
  if (!userId) return null;
  const { data, error } = await supabase
    .from('users')
    .select('name')
    .eq('auth_user_id', userId)
    .single();
  if (error || !data) return null;
  return data.name || null;
};

export const useGetPendingLandlords = (page: number, limit: string, search: string = "") => {
  return useQuery({
    queryKey: ["pending-landlords", page, limit, search],
    queryFn: async () => {
      // call API to get user that have property_document
      const response = await fetchWithAuth(`/api/users/pending-landlords?page=${page}&limit=${limit}&search=${search}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch pending landlords');
      return data;
    },
  });
};

export const useApproveLandlord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const { data, error } = await supabase
        .from('users')
        .update({ role: 'landlord' })
        .eq('id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Refresh pending landlords after approve
      queryClient.invalidateQueries({ queryKey: ["pending-landlords"] });
    },
  });
};

export const useRejectLandlord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason?: string }) => {
      const { data, error } = await supabase
        .from('users')
        .update({ 
          property_document: null,
          reject_reason: reason || null 
        })
        .eq('id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-landlords"] });
    },
  });
};
