import { create } from "zustand";
import { persist } from "zustand/middleware";

type State = {
  userId: string | undefined;
  userRole: string;
  setUserId: (id: string) => void;
  setUserRole: (role: string) => void;
};

export const useUserStore = create<State>()(
  persist(
    (set) => ({
      userId: "",
      setUserId: (id: string) => set({ userId: id }),
      userRole: "user",
      setUserRole: (role: string) => set({ userRole: role }),
    }),
    {
      name: "user-store", // key for the storage
      partialize: (state) => ({
        userId: state.userId,
        userRole: state.userRole,
      }),
    }
  )
);
