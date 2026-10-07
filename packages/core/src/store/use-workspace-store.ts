import type { Workspace } from "@yaad/core/types/workspace";

import { generateWorkspaceId } from "@yaad/core/lib/id";
import { workspaceService } from "@yaad/core/services/workspace-service";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { useSidebarStore } from "./use-sidebar-store";

export interface WorkspaceOperationResult {
  success: boolean;
  error?: string;
}

interface WorkspaceState {
  workspaces: Record<string, Workspace>;
  activeWorkspaceId: string | null;
  hasHydrated: boolean;

  // Actions
  setHasHydrated: (state: boolean) => void;
  setActiveWorkspace: (id: string) => Promise<void>;
  createWorkspace: (name: string, icon?: string) => Promise<string>;
  updateWorkspace: (
    id: string,
    updates: WorkspaceUpdates,
  ) => Promise<WorkspaceOperationResult>;
  deleteWorkspace: (id: string) => Promise<WorkspaceOperationResult>;
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

      setHasHydrated: (state) => {
        set({ hasHydrated: state });
      },

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
          currentActive && currentActive in map ? currentActive : list[0].id;

        set({ workspaces: map, activeWorkspaceId: validActive });

        // Load page tree for the active workspace into sidebar
        await useSidebarStore.getState().loadWorkspacePages(validActive);
      },

      setActiveWorkspace: async (id: string) => {
        const state = get();

        if (!(id in state.workspaces)) return;

        set({ activeWorkspaceId: id });

        // Reload sidebar page tree for new workspace
        await useSidebarStore.getState().loadWorkspacePages(id);
      },

      createWorkspace: async (name: string, icon = "💼") => {
        const id = generateWorkspaceId();
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
        if (!(id in get().workspaces))
          return { success: false, error: "Workspace not found" };

        const name = updates.name?.trim();

        if (updates.name !== undefined && !name) {
          return { success: false, error: "Workspace name cannot be empty." };
        }

        const current = get().workspaces[id];

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

        return { success: true };
      },

      deleteWorkspace: async (id: string) => {
        const state = get();

        if (Object.keys(state.workspaces).length <= 1) {
          return {
            success: false,
            error: "You must have at least one active workspace.",
          };
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
        return { success: true };
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
