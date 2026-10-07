import type { StateCreator } from "zustand";

import { generatePageId } from "@yaad/core/lib/id";
import { documentService } from "@yaad/core/services/document-service";
import { workspaceService } from "@yaad/core/services/workspace-service";

import type { SidebarPagesSlice, SidebarState } from "./types";

import { useTabStore } from "../use-tab-store";
import {
  cloneDocumentForDuplicate,
  collectPageSubtree,
  emptyTrashDocuments,
  insertCreatedPageInTree,
  insertDuplicatedPageInTree,
  parseWorkspaceTreeNodes,
  persistWorkspaceTree,
  registerSubPageInTreeState,
  removePageFromTreeState,
  restorePageInTreeState,
  setCurrentWorkspaceId,
  toggleBookmarkedInTree,
  toggleExpandInTree,
  trashPageInTreeState,
  updatePageTitleInTreeState,
} from "./helpers";

export { collectPageSubtree, persistWorkspaceTree, setCurrentWorkspaceId };

export const createPagesSlice: StateCreator<
  SidebarState,
  [],
  [],
  SidebarPagesSlice
> = (rawSet, get) => {
  const set: typeof rawSet = (updater: any, replace?: any) => {
    (rawSet as any)((state: SidebarState) => {
      const next = typeof updater === "function" ? updater(state) : updater;

      if (next?.pages && next.pages !== state.pages) {
        persistWorkspaceTree(next.pages);
      }

      return next;
    }, replace);
  };

  return {
    pages: {},
    rootPageIds: [],

    loadWorkspacePages: async (workspaceId: string) => {
      setCurrentWorkspaceId(workspaceId);
      rawSet({ isLoading: true });

      try {
        const treeNodes = await workspaceService.getWorkspaceTree(workspaceId);
        const { pagesMap, rootIds } = parseWorkspaceTreeNodes(
          treeNodes,
          get().pages,
        );

        rawSet({
          pages: pagesMap,
          rootPageIds: rootIds,
          isLoading: false,
          _hasHydrated: true,
        });
      } catch (error) {
        console.error("Error loading workspace pages:", error);
        rawSet({ isLoading: false, _hasHydrated: true });
      }
    },

    toggleExpand: (pageId: string) =>
      set((state) => toggleExpandInTree(state, pageId)),

    toggleBookmarked: (pageId: string) =>
      set((state) => toggleBookmarkedInTree(state, pageId)),

    duplicatePage: async (pageId: string) => {
      const page = get().pages[pageId];
      if (!page) return null;

      const newId = generatePageId();
      const newTitle = page.title ? `${page.title} (Copy)` : "Untitled (Copy)";

      try {
        const sourceDoc = await documentService.loadDocument(pageId);
        const newDoc = cloneDocumentForDuplicate(sourceDoc, newId, newTitle);
        await documentService.saveDocument(newDoc);
      } catch (error) {
        console.error("Error duplicating document in storage:", error);
      }

      set((state) =>
        insertDuplicatedPageInTree(state, pageId, {
          icon: page.icon,
          id: newId,
          parentId: page.parentId,
          title: newTitle,
        }),
      );

      return newId;
    },

    createPage: (parentId: string | null) => {
      const newId = generatePageId();
      set((state) => insertCreatedPageInTree(state, newId, parentId));
      return newId;
    },

    deletePage: (pageId: string) => {
      useTabStore.getState().removeTabByPageId(pageId);
      set((state) => removePageFromTreeState(state, pageId));
    },

    moveToTrash: (pageId: string) => {
      set((state) => trashPageInTreeState(state, pageId));
    },

    restorePage: (pageId: string) => {
      set((state) => restorePageInTreeState(state, pageId));
    },

    permanentlyDeletePage: async (pageId: string) => {
      await documentService.deletePageAndSubTree(pageId);
      get().deletePage(pageId);
    },

    emptyTrash: async () => {
      const trashedIds = await emptyTrashDocuments(get().pages);
      trashedIds.forEach((id) => {
        get().deletePage(id);
      });
    },

    /* eslint-disable-next-line max-params */
    registerSubPageInTree: (
      newPageId: string,
      parentDocId: string,
      title: string,
      icon = "📄",
    ) =>
      set((state) =>
        registerSubPageInTreeState(state, {
          icon,
          newPageId,
          parentDocId,
          title,
        }),
      ),

    updatePageTitleInTree: (pageId: string, title?: string, icon?: string) => {
      const page = get().pages[pageId];
      if (!page || (title === undefined && icon === undefined)) return;

      set((state) =>
        updatePageTitleInTreeState(state, pageId, { icon, title }),
      );

      if (title !== undefined || icon !== undefined) {
        useTabStore.getState().updateTabInfo(pageId, { icon, title });
      }
    },

    removePageFromTree: (pageId: string) => {
      get().deletePage(pageId);
    },
  };
};
