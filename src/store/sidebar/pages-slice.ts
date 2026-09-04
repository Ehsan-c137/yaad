/* eslint-disable max-lines-per-function */
import type { StateCreator } from "zustand";

import type { DocumentBlock, DocumentJSON } from "@/types/document";

import { documentService } from "@/services/document-service";
import { workspaceService } from "@/services/workspace-service";

import type { SidebarPageItem, SidebarPagesSlice, SidebarState } from "./types";

import { useTabStore } from "../use-tab-store";

export const createPagesSlice: StateCreator<
  SidebarState,
  [],
  [],
  SidebarPagesSlice
> = (set, get) => ({
  pages: {},
  rootPageIds: [],

  loadWorkspacePages: async (workspaceId: string) => {
    set({ isLoading: true });

    try {
      const treeNodes = await workspaceService.getWorkspaceTree(workspaceId);

      const pagesMap: Record<string, SidebarPageItem> = {};
      const rootIds: string[] = [];

      treeNodes.forEach((node) => {
        pagesMap[node.id] = {
          ...node,
          isExpanded: get().pages[node.id]?.isExpanded ?? false, // Preserve UI expand state if already loaded
          isBookmarked: get().pages[node.id]?.isBookmarked ?? node.isBookmarked, // Preserve bookmarked state from persisted store
        };

        if (!node.parentId && !node.isDeleted) {
          rootIds.push(node.id);
        }
      });

      set({
        pages: pagesMap,
        rootPageIds: rootIds,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error loading workspace pages:", error);
      set({ isLoading: false });
    }
  },

  toggleExpand: (pageId: string) =>
    set((state) => {
      const page = state.pages[pageId];
      if (!page) return state;

      return {
        pages: {
          ...state.pages,
          [pageId]: {
            ...page,
            isExpanded: !page.isExpanded,
          },
        },
      };
    }),

  toggleBookmarked: (pageId: string) =>
    set((state) => {
      const page = state.pages[pageId];
      if (!page)
        throw new Error(`Page with ID ${pageId} not found in the store.`);

      return {
        pages: {
          ...state.pages,
          [pageId]: {
            ...page,
            isBookmarked: !page.isBookmarked,
            updatedAt: Date.now(),
          },
        },
      };
    }),

  duplicatePage: async (pageId: string) => {
    const page = get().pages[pageId];
    if (!page) return null;

    const newId = `page-${crypto.randomUUID()}`;
    const newTitle = page.title ? `${page.title} (Copy)` : "Untitled (Copy)";

    try {
      const sourceDoc = await documentService.loadDocument(pageId);

      if (sourceDoc) {
        const clonedBlocks: Record<string, DocumentBlock> = {};
        const idMap: Record<string, string> = { root: "root" };

        // Generate unique IDs for all blocks except root
        for (const oldId of Object.keys(sourceDoc.blocks)) {
          if (oldId !== "root") {
            idMap[oldId] = `block_${crypto.randomUUID()}`;
          }
        }

        for (const [oldId, block] of Object.entries(sourceDoc.blocks)) {
          const newBlockId = idMap[oldId] || oldId;
          const newParentId = block.parentId
            ? idMap[block.parentId] || block.parentId
            : null;
          const newChildrenIds = (block.childrenIds || []).map(
            (childId) => idMap[childId] || childId,
          );

          clonedBlocks[newBlockId] = {
            ...structuredClone(block),
            id: newBlockId,
            parentId: newParentId,
            childrenIds: newChildrenIds,
            properties: {
              ...block.properties,
              ...(oldId === "root" ? { title: [{ text: newTitle }] } : {}),
            },
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
        }

        const newDoc: DocumentJSON = {
          ...structuredClone(sourceDoc),
          id: newId,
          title: newTitle,
          blocks: clonedBlocks,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        await documentService.saveDocument(newDoc);
      } else {
        const newBlankDoc: DocumentJSON = {
          version: 1,
          id: newId,
          title: newTitle,
          rootBlockId: "root",
          blocks: {
            root: {
              id: "root",
              type: "page",
              parentId: null,
              childrenIds: [],
              properties: { title: [{ text: newTitle }] },
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
          },
          createdAt: Date.now(),
          updatedAt: Date.now(),
          icon: page.icon ?? "📄",
        };
        await documentService.saveDocument(newBlankDoc);
      }
    } catch (error) {
      console.error("Error duplicating document in storage:", error);
    }

    set((state) => {
      const newPage: SidebarPageItem = {
        id: newId,
        title: newTitle,
        icon: page.icon ?? "📄",
        parentId: page.parentId,
        childrenIds: [],
        isExpanded: false,
        isBookmarked: false,
        updatedAt: Date.now(),
      };

      const updatedPages = { ...state.pages, [newId]: newPage };
      const updatedRootIds = [...state.rootPageIds];

      if (page.parentId && updatedPages[page.parentId]) {
        const parent = updatedPages[page.parentId];
        const index = parent.childrenIds.indexOf(pageId);
        const nextChildren = [...parent.childrenIds];

        if (index >= 0) {
          nextChildren.splice(index + 1, 0, newId);
        } else {
          nextChildren.push(newId);
        }

        updatedPages[page.parentId] = {
          ...parent,
          childrenIds: nextChildren,
        };
      } else {
        const index = updatedRootIds.indexOf(pageId);

        if (index >= 0) {
          updatedRootIds.splice(index + 1, 0, newId);
        } else {
          updatedRootIds.push(newId);
        }
      }

      return {
        pages: updatedPages,
        rootPageIds: updatedRootIds,
        activePageId: newId,
      };
    });

    return newId;
  },

  createPage: (parentId: string | null) => {
    const newId = `page-${crypto.randomUUID()}`;
    set((state) => {
      const newPage: SidebarPageItem = {
        id: newId,
        title: "Untitled",
        icon: "📄",
        parentId,
        childrenIds: [],
        isExpanded: false,
        isBookmarked: false,
      };

      const updatedPages = { ...state.pages, [newId]: newPage };
      const updatedRootIds = [...state.rootPageIds];

      if (parentId && updatedPages[parentId]) {
        updatedPages[parentId] = {
          ...updatedPages[parentId],
          childrenIds: [...updatedPages[parentId].childrenIds, newId],
          isExpanded: true,
        };
      } else {
        updatedRootIds.push(newId);
      }

      return {
        pages: updatedPages,
        rootPageIds: updatedRootIds,
        activePageId: newId,
      };
    });
    return newId;
  },

  deletePage: (pageId: string) => {
    useTabStore.getState().removeTabByPageId(pageId);
    set((state) => {
      const page = state.pages[pageId];
      if (!page) return state;

      const pagesToDelete = new Set<string>();

      const collectRecursive = (id: string) => {
        const currentPage = state.pages[id];
        if (!currentPage || pagesToDelete.has(id)) return;
        pagesToDelete.add(id);
        currentPage.childrenIds.forEach(collectRecursive);
      };

      collectRecursive(pageId);

      const updatedPages = Object.fromEntries(
        Object.entries(state.pages).filter(([id]) => !pagesToDelete.has(id)),
      );

      if (page.parentId && updatedPages[page.parentId]) {
        updatedPages[page.parentId] = {
          ...updatedPages[page.parentId],
          childrenIds: updatedPages[page.parentId].childrenIds.filter(
            (id) => id !== pageId,
          ),
        };
      }

      return {
        pages: updatedPages,
        rootPageIds: state.rootPageIds.filter((id) => id !== pageId),
      };
    });
  },

  moveToTrash: (pageId: string) => {
    set((state) => {
      const page = state.pages[pageId];
      if (!page) return state;

      const toTrash = new Set<string>();

      const collectRecursive = (id: string) => {
        const current = state.pages[id];
        if (!current || toTrash.has(id)) return;
        toTrash.add(id);
        (current.childrenIds || []).forEach(collectRecursive);
      };

      collectRecursive(pageId);

      toTrash.forEach((id) => {
        useTabStore.getState().removeTabByPageId(id);
      });

      const updatedPages = { ...state.pages };
      const now = Date.now();

      toTrash.forEach((id) => {
        if (updatedPages[id]) {
          updatedPages[id] = {
            ...updatedPages[id],
            isDeleted: true,
            deletedAt: now,
            isBookmarked: false,
          };
        }
      });

      if (page.parentId && updatedPages[page.parentId]) {
        updatedPages[page.parentId] = {
          ...updatedPages[page.parentId],
          childrenIds: updatedPages[page.parentId].childrenIds.filter(
            (id) => id !== pageId,
          ),
        };
      }

      return {
        pages: updatedPages,
        rootPageIds: state.rootPageIds.filter((id) => id !== pageId),
      };
    });
  },

  restorePage: (pageId: string) => {
    set((state) => {
      const page = state.pages[pageId];

      if (!page || !page.isDeleted) return state;

      const toRestore = new Set<string>();

      const collectRecursive = (id: string) => {
        const current = state.pages[id];
        if (!current || toRestore.has(id)) return;
        toRestore.add(id);
        (current.childrenIds || []).forEach(collectRecursive);
      };

      collectRecursive(pageId);

      const updatedPages = { ...state.pages };
      toRestore.forEach((id) => {
        if (updatedPages[id]) {
          updatedPages[id] = {
            ...updatedPages[id],
            isDeleted: false,
            deletedAt: undefined,
          };
        }
      });

      const updatedRootIds = [...state.rootPageIds];
      const parent = page.parentId ? updatedPages[page.parentId] : null;

      if (parent && !parent.isDeleted) {
        if (!parent.childrenIds.includes(pageId)) {
          updatedPages[parent.id] = {
            ...parent,
            childrenIds: [...parent.childrenIds, pageId],
            isExpanded: true,
          };
        }
      } else {
        updatedPages[pageId] = {
          ...updatedPages[pageId],
          parentId: null,
        };

        if (!updatedRootIds.includes(pageId)) {
          updatedRootIds.push(pageId);
        }
      }

      return {
        pages: updatedPages,
        rootPageIds: updatedRootIds,
      };
    });
  },

  permanentlyDeletePage: async (pageId: string) => {
    await documentService.deletePageAndSubTree(pageId);
  },

  emptyTrash: async () => {
    const pages = get().pages;

    const trashedIds = Object.keys(pages).filter((id) => pages[id]?.isDeleted);

    for (const id of trashedIds) {
      const page = get().pages[id];
      if (page) {
        await documentService.deletePageAndSubTree(id);
      }
    }
  },

  /* eslint-disable-next-line max-params */
  registerSubPageInTree: (
    newPageId: string,
    parentDocId: string,
    title: string,
    icon = "📄",
  ) =>
    set((state) => {
      const parentExists = Boolean(state.pages[parentDocId]);

      const newPage: SidebarPageItem = {
        id: newPageId,
        title,
        icon,
        // If parent doesn't exist, treat as root page
        parentId: parentExists ? parentDocId : null,
        childrenIds: [],
        isBookmarked: false,
        isExpanded: false,
        updatedAt: Date.now(),
      };

      const updatedPages: Record<string, SidebarPageItem> = {
        ...state.pages,
        [newPageId]: newPage,
      };

      // Case 1: Parent exists -> Attach to parent and auto-expand
      if (parentExists) {
        const parentPage = updatedPages[parentDocId];
        const existingChildren = parentPage.childrenIds ?? [];

        updatedPages[parentDocId] = {
          ...parentPage,
          // Prevent duplicate IDs using Set
          childrenIds: Array.from(new Set([...existingChildren, newPageId])),
          isExpanded: true,
          updatedAt: Date.now(),
        };

        return { pages: updatedPages };
      }

      // Case 2: Parent doesn't exist -> Safely place at root level
      const nextRootIds = state.rootPageIds.includes(newPageId)
        ? state.rootPageIds
        : [...state.rootPageIds, newPageId];

      return {
        pages: updatedPages,
        rootPageIds: nextRootIds,
      };
    }),

  updatePageTitleInTree: (pageId: string, title?: string, icon?: string) => {
    const { pages } = get();

    if (!pages[pageId]) return;

    if (title) {
      set({
        pages: {
          ...pages,
          [pageId]: {
            ...pages[pageId],
            title,
          },
        },
      });
    }

    if (icon) {
      set({
        pages: {
          ...pages,
          [pageId]: {
            ...pages[pageId],
            icon,
          },
        },
      });
    }

    if (title || icon) {
      useTabStore.getState().updateTabInfo(pageId, { title, icon });
    }
  },

  removePageFromTree: (pageId: string) => {
    useTabStore.getState().removeTabByPageId(pageId);
    set((state) => {
      const page = state.pages[pageId];
      if (!page) return state;

      const pagesToDelete = new Set<string>();

      const collectRecursive = (id: string) => {
        const currentPage = state.pages[id];
        if (!currentPage || pagesToDelete.has(id)) return;
        pagesToDelete.add(id);
        currentPage.childrenIds.forEach(collectRecursive);
      };

      collectRecursive(pageId);

      const updatedPages = Object.fromEntries(
        Object.entries(state.pages).filter(([id]) => !pagesToDelete.has(id)),
      );

      if (page.parentId && updatedPages[page.parentId]) {
        updatedPages[page.parentId] = {
          ...updatedPages[page.parentId],
          childrenIds: updatedPages[page.parentId].childrenIds.filter(
            (id) => id !== pageId,
          ),
        };
      }

      return {
        pages: updatedPages,
        rootPageIds: state.rootPageIds.filter((id) => id !== pageId),
      };
    });
  },
});
