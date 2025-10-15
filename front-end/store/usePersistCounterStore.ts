import { create } from "zustand";
import { persist } from "zustand/middleware";

type State = {
  count: number;
  increase: () => void;
  decrease: () => void;
};

export const usePersistCounterStore = create<State>()(
  persist(
    (set) => ({
      count: 0,
      increase: () => set((state) => ({ count: state.count + 1 })),
      decrease: () => set((state) => ({ count: state.count - 1 })),
    }),
    {
      name: "counter-storage",
    },
  ),
);
