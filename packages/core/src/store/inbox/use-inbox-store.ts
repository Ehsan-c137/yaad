import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type NotificationType =
  "comment" | "mention" | "page_update" | "reminder" | "system";

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  type: NotificationType;
  read: boolean;
  createdAt: number;
  author?: {
    name: string;
    avatar?: string;
    initials?: string;
  };
  pageId?: string;
  workspaceId?: string;
  targetTitle?: string;
}

export type InboxFilter = "all" | "mentions" | "unread";

export interface InboxState {
  notifications: NotificationItem[];
  filter: InboxFilter;
  _hasHydrated: boolean;

  setFilter: (filter: InboxFilter) => void;
  markAsRead: (id: string) => void;
  toggleRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  addNotification: (
    notification: Omit<NotificationItem, "createdAt" | "id" | "read">,
  ) => void;
  setHasHydrated: (state: boolean) => void;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif_1",
    title: "Alex Chen mentioned you",
    description:
      "Hey @you, could you review the architecture section in System Specs?",
    type: "mention",
    read: false,
    createdAt: Date.now() - 1000 * 60 * 12,
    author: {
      name: "Alex Chen",
      initials: "AC",
    },
    targetTitle: "System Specs",
  },
  {
    id: "notif_2",
    title: "Page updated",
    description: "Sarah added 3 new blocks to 'Project Roadmap Q3'.",
    type: "page_update",
    read: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
    author: {
      name: "Sarah Jenkins",
      initials: "SJ",
    },
    targetTitle: "Project Roadmap Q3",
  },
  {
    id: "notif_4",
    title: "Comment on Design Tokens",
    description: "Marcus: 'Love the new dark mode backdrop filter options!'",
    type: "comment",
    read: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
    author: {
      name: "Marcus Vance",
      initials: "MV",
    },
    targetTitle: "Design Tokens",
  },
  {
    id: "notif_3",
    title: "Welcome to Yaad Workspace",
    description: "Explore pages, organize docs, and collaborate seamlessly.",
    type: "system",
    read: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    targetTitle: "Getting Started",
  },
];

export const useInboxStore = create<InboxState>()(
  persist(
    (set) => ({
      notifications: INITIAL_NOTIFICATIONS,
      filter: "all",
      _hasHydrated: false,

      setFilter: (filter) => set({ filter }),

      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n,
          ),
        })),

      toggleRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: !n.read } : n,
          ),
        })),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({
            ...n,
            read: true,
          })),
        })),

      deleteNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      clearAll: () => set({ notifications: [] }),

      addNotification: (notificationData) =>
        set((state) => ({
          notifications: [
            {
              ...notificationData,
              id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
              createdAt: Date.now(),
              read: false,
            },
            ...state.notifications,
          ],
        })),

      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: "yaad-inbox-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
