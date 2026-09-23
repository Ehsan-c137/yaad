import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface UserState {
  userName: string | null;
  hasOnboarded: boolean;
  _hasHydrated: boolean;

  setUserName: (name: string | null) => void;
  completeOnboarding: () => void;
  setHasHydrated: (state: boolean) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userName: null,
      hasOnboarded: false,
      _hasHydrated: false,

      setUserName: (name) => set({ userName: name }),

      completeOnboarding: () => set({ hasOnboarded: true }),

      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: "yaad-user-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
