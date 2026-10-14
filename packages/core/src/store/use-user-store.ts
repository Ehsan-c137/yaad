import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface UserState {
  userName: string | null;
  userId: string | null;
  email: string | null;
  token: string | null;
  userColor: string;
  hasOnboarded: boolean;
  _hasHydrated: boolean;

  setUserName: (name: string | null) => void;
  setAuth: (data: { token: string; userId: string; email: string; name?: string }) => void;
  clearAuth: () => void;
  completeOnboarding: () => void;
  setHasHydrated: (state: boolean) => void;
}

const DEFAULT_COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444'];
const getRandomColor = () => DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)];

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userName: null,
      userId: null,
      email: null,
      token: null,
      userColor: getRandomColor(),
      hasOnboarded: false,
      _hasHydrated: false,

      setUserName: (name) => {
        set({ userName: name });
      },

      setAuth: ({ token, userId, email, name }) => {
        set({
          token,
          userId,
          email,
          userName: name ?? email.split('@')[0],
        });
      },

      clearAuth: () => {
        set({
          token: null,
          userId: null,
          email: null,
          userName: null,
        });
      },

      completeOnboarding: () => {
        set({ hasOnboarded: true });
      },

      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },
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
