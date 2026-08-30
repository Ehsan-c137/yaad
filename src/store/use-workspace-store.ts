import { toast } from "sonner";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Workspace } from "@/types/workspace";

import { workspaceService } from "@/services/workspace-service";

import { useSidebarStore } from "./use-sidebar-store";

interface WorkspaceState {
  workspaces: Record<string, Workspace>;
  activeWorkspaceId: string | null;
  hasHydrated: boolean;

  // Actions
  setHasHydrated: (state: boolean) => void;
  setActiveWorkspace: (id: string) => Promise<void>;
  createWorkspace: (name: string, icon?: string) => Promise<string>;
  updateWorkspace: (id: string, updates: WorkspaceUpdates) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
  loadInitialWorkspaces: () => Promise<void>;
}

export interface WorkspaceUpdates {
  name?: string;
  icon?: string;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      workspaces: {},
      activeWorkspaceId: null,
      hasHydrated: false,

      setHasHydrated: (state) => set({ hasHydrated: state }),

      loadInitialWorkspaces: async () => {
        const list = await workspaceService.getWorkspaces();

        // If no workspace exists locally, seed a default one
        if (list.length === 0) {
          const defaultWs: Workspace = {
            id: "ws_personal",
            name: "Personal Workspace",
            icon: "🏠",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          await workspaceService.saveWorkspace(defaultWs);
          list.push(defaultWs);
        }

        const map: Record<string, Workspace> = {};
        list.forEach((ws) => {
          map[ws.id] = ws;
        });

        const currentActive = get().activeWorkspaceId;
        const validActive =
          currentActive && map[currentActive] ? currentActive : list[0].id;

        set({ workspaces: map, activeWorkspaceId: validActive });

        // Load page tree for the active workspace into sidebar
        await useSidebarStore.getState().loadWorkspacePages(validActive);
      },

      setActiveWorkspace: async (id: string) => {
        if (!get().workspaces[id]) return;
        set({ activeWorkspaceId: id });

        // Reload sidebar page tree for new workspace
        await useSidebarStore.getState().loadWorkspacePages(id);
      },

      createWorkspace: async (name: string, icon = "💼") => {
        const id = `ws_${crypto.randomUUID()}`;
        const newWs: Workspace = {
          id,
          name,
          icon,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        await workspaceService.saveWorkspace(newWs);

        set((state) => ({
          workspaces: { ...state.workspaces, [id]: newWs },
          activeWorkspaceId: id,
        }));

        // Load empty tree for new workspace
        await useSidebarStore.getState().loadWorkspacePages(id);
        return id;
      },

      updateWorkspace: async (id: string, updates: WorkspaceUpdates) => {
        const current = get().workspaces[id];
        if (!current) return;

        const name = updates.name?.trim();

        if (updates.name !== undefined && !name) {
          toast.error("Workspace name cannot be empty.");
          return;
        }

        const updatedWs: Workspace = {
          ...current,
          ...(name ? { name } : {}),
          ...(updates.icon !== undefined ? { icon: updates.icon } : {}),
          updatedAt: Date.now(),
        };

        await workspaceService.saveWorkspace(updatedWs);

        set((state) => ({
          workspaces: { ...state.workspaces, [id]: updatedWs },
        }));
      },

      deleteWorkspace: async (id: string) => {
        const state = get();

        if (Object.keys(state.workspaces).length <= 1) {
          toast.error("You must have at least one active workspace.");
          return;
        }

        await workspaceService.deleteWorkspace(id);

        const remainingIds = Object.keys(state.workspaces).filter(
          (wId) => wId !== id,
        );
        const nextActiveId = remainingIds[0];

        const updatedWorkspaces = Object.fromEntries(
          Object.entries(state.workspaces).filter(([wId]) => wId !== id),
        );

        set({
          workspaces: updatedWorkspaces,
          activeWorkspaceId: nextActiveId,
        });

        await useSidebarStore.getState().loadWorkspacePages(nextActiveId);
      },
    }),
    {
      name: "active-workspace-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
