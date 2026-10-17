import type { DocumentBlock, DocumentJSON } from "@yaad/core/types/document";
import type { WorkspacePageMeta } from "@yaad/core/types/workspace";

import { generateBlockId } from "@yaad/core/lib/id";
import { documentService } from "@yaad/core/services/document-service";
import { workspaceService } from "@yaad/core/services/workspace-service";

import type {
  DropPosition,
  SidebarPageItem,
  SidebarPageMap,
  SidebarState,
} from "./types";

import { useTabStore } from "../use-tab-store";

let currentWorkspaceId: string | null = null;
const saveTreeTimersMap = new Map<string, ReturnType<typeof setTimeout>>();

type TreeChangeCallback = (
  workspaceId: string,
  treeNodes: WorkspacePageMeta[],
) => void;

const treeChangeListeners = new Set<TreeChangeCallback>();

export function onWorkspaceTreePersisted(cb: TreeChangeCallback): () => void {
  treeChangeListeners.add(cb);
  return () => treeChangeListeners.delete(cb);
}

export function persistWorkspaceTree(
  pages: SidebarPageMap,
  workspaceId?: string | null,
  rootPageIds?: string[],
) {
  let wsId = workspaceId ?? currentWorkspaceId;

  if (!wsId) {
    try {
      const activeStorage =
        typeof localStorage !== "undefined"
          ? localStorage.getItem("active-workspace-storage")
          : null;

      if (activeStorage) {
        const parsed = JSON.parse(activeStorage);
        wsId = parsed?.state?.activeWorkspaceId;
      }
    } catch {}
  }
  if (!wsId) {
    wsId = "ws_personal";
  }

  const existingTimer = saveTreeTimersMap.get(wsId);

  if (existingTimer) {
    clearTimeout(existingTimer);
  }

  const timer = setTimeout(() => {
    void (async () => {
      try {
        const nodes = Object.values(pages).filter((p): p is SidebarPageItem =>
          Boolean(p),
        );

        if (rootPageIds && rootPageIds.length > 0) {
          const rootOrderMap = new Map(rootPageIds.map((id, idx) => [id, idx]));
          nodes.sort((a, b) => {
            if (!a.parentId && !b.parentId) {
              const orderA = rootOrderMap.get(a.id) ?? 9999;
              const orderB = rootOrderMap.get(b.id) ?? 9999;
              return orderA - orderB;
            }

            return 0;
          });
        }

        const treeNodes: WorkspacePageMeta[] = nodes.map((p) => ({
          id: p.id,
          workspaceId: wsId,
          title: p.title || "Untitled",
          icon: p.icon,
          parentId: p.parentId,
          childrenIds: [...p.childrenIds],
          isDeleted: p.isDeleted,
          deletedAt: p.deletedAt,
          updatedAt: p.updatedAt ?? Date.now(),
          isBookmarked: p.isBookmarked,
        }));

        await workspaceService.saveWorkspaceTree(wsId, treeNodes);
        treeChangeListeners.forEach((fn) => {
          try {
            fn(wsId, treeNodes);
          } catch (err) {
            console.error("Error in tree change listener:", err);
          }
        });

        if (
          typeof window !== "undefined" &&
          typeof BroadcastChannel !== "undefined"
        ) {
          try {
            const channel = new BroadcastChannel("yaad-sync-channel");
            channel.postMessage({ type: "tree-persisted", workspaceId: wsId });
            channel.close();
          } catch {}
        }
      } catch (e) {
        console.error("Error saving workspace tree to storage:", e);
      } finally {
        saveTreeTimersMap.delete(wsId);
      }
    })();
  }, 100);

  saveTreeTimersMap.set(wsId, timer);
}

export function setCurrentWorkspaceId(id: string | null) {
  currentWorkspaceId = id;
}

export function collectPageSubtree(
  pages: SidebarPageMap,
  rootId: string,
): Set<string> {
  const result = new Set<string>();

  const traverse = (id: string) => {
    const page = pages[id];
    if (!page || result.has(id)) return;
    result.add(id);
    [...page.childrenIds].forEach(traverse);
  };

  traverse(rootId);
  return result;
}

export function parseWorkspaceTreeNodes(
  treeNodes: WorkspacePageMeta[],
  currentPages: SidebarPageMap,
): { pagesMap: Record<string, SidebarPageItem>; rootIds: string[] } {
  const pagesMap: Record<string, SidebarPageItem> = {};
  const rootIds: string[] = [];

  treeNodes.forEach((node) => {
    const targetPage = currentPages[node.id];
    pagesMap[node.id] = {
      ...node,
      isExpanded: currentPages[node.id]?.isExpanded ?? false,
      isBookmarked: targetPage?.isBookmarked ?? node.isBookmarked,
    };

    if (!node.parentId && !node.isDeleted) {
      rootIds.push(node.id);
    }
  });

  return { pagesMap, rootIds };
}

export function cloneDocumentForDuplicate(
  sourceDoc: DocumentJSON,
  newId: string,
  newTitle: string,
): DocumentJSON {
  const clonedBlocks: Record<string, DocumentBlock> = {};
  const idMap: Record<string, string> = { root: "root" };

  for (const oldId of Object.keys(sourceDoc.blocks)) {
    if (oldId !== "root") {
      idMap[oldId] = generateBlockId();
    }
  }

  for (const [oldId, block] of Object.entries(sourceDoc.blocks)) {
    const newBlockId = idMap[oldId] ?? oldId;
    const newParentId = block.parentId
      ? (idMap[block.parentId] ?? block.parentId)
      : null;
    const newChildrenIds = block.childrenIds.map(
      (childId) => idMap[childId] ?? childId,
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

  return {
    ...structuredClone(sourceDoc),
    id: newId,
    title: newTitle,
    blocks: clonedBlocks,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function toggleExpandInTree(
  state: SidebarState,
  pageId: string,
): Partial<SidebarState> {
  const page = state.pages[pageId];
  if (!page) return state;

  return {
    pages: {
      ...state.pages,
      [pageId]: { ...page, isExpanded: !page.isExpanded },
    },
  };
}

export function toggleBookmarkedInTree(
  state: SidebarState,
  pageId: string,
): Partial<SidebarState> {
  const page = state.pages[pageId];

  if (!page) {
    throw new Error(`Page with ID ${pageId} not found in the store.`);
  }

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
}

export interface InsertDuplicatedPageOptions {
  icon?: string;
  id: string;
  parentId: string | null;
  title: string;
}

export function insertDuplicatedPageInTree(
  state: SidebarState,
  pageId: string,
  options: InsertDuplicatedPageOptions,
): Pick<SidebarState, "activePageId" | "pages" | "rootPageIds"> {
  const newPage: SidebarPageItem = {
    id: options.id,
    title: options.title,
    icon: options.icon ?? "📄",
    parentId: options.parentId,
    childrenIds: [],
    isExpanded: false,
    isBookmarked: false,
    updatedAt: Date.now(),
  };

  const updatedPages = { ...state.pages, [newPage.id]: newPage };
  const updatedRootIds = [...state.rootPageIds];

  if (newPage.parentId && updatedPages[newPage.parentId]) {
    const parent = updatedPages[newPage.parentId]!;
    const index = parent.childrenIds.indexOf(pageId);
    const nextChildren = [...parent.childrenIds];

    if (index >= 0) {
      nextChildren.splice(index + 1, 0, newPage.id);
    } else {
      nextChildren.push(newPage.id);
    }

    updatedPages[newPage.parentId] = {
      ...parent,
      childrenIds: nextChildren,
    };
  } else {
    const index = updatedRootIds.indexOf(pageId);

    if (index >= 0) {
      updatedRootIds.splice(index + 1, 0, newPage.id);
    } else {
      updatedRootIds.push(newPage.id);
    }
  }

  return {
    activePageId: newPage.id,
    pages: updatedPages,
    rootPageIds: updatedRootIds,
  };
}

export function insertCreatedPageInTree(
  state: SidebarState,
  newPageId: string,
  parentId: string | null,
): Pick<SidebarState, "activePageId" | "pages" | "rootPageIds"> {
  const newPage: SidebarPageItem = {
    id: newPageId,
    title: "Untitled",
    icon: "📄",
    parentId,
    childrenIds: [],
    isExpanded: false,
    isBookmarked: false,
  };

  const updatedPages = { ...state.pages, [newPageId]: newPage };
  const updatedRootIds = [...state.rootPageIds];

  if (parentId && updatedPages[parentId]) {
    updatedPages[parentId] = {
      ...updatedPages[parentId],
      childrenIds: [...updatedPages[parentId].childrenIds, newPageId],
      isExpanded: true,
    };
  } else {
    updatedRootIds.push(newPageId);
  }

  return {
    activePageId: newPageId,
    pages: updatedPages,
    rootPageIds: updatedRootIds,
  };
}

export function removePageFromTreeState(
  state: SidebarState,
  pageId: string,
): Partial<SidebarState> {
  const page = state.pages[pageId];
  if (!page) return state;

  const pagesToDelete = collectPageSubtree(state.pages, pageId);

  const updatedPages = Object.fromEntries(
    Object.entries(state.pages).filter(([id]) => !pagesToDelete.has(id)),
  );

  const parentPage = updatedPages[page.parentId ?? ""];

  if (page.parentId && parentPage) {
    updatedPages[page.parentId] = {
      ...parentPage,
      childrenIds: parentPage.childrenIds.filter((id) => id !== pageId),
    };
  }

  return {
    pages: updatedPages,
    rootPageIds: state.rootPageIds.filter((id) => id !== pageId),
  };
}

export function trashPageInTreeState(
  state: SidebarState,
  pageId: string,
): Partial<SidebarState> {
  const page = state.pages[pageId];
  if (!page) return state;

  const toTrash = collectPageSubtree(state.pages, pageId);

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
    const parent = updatedPages[page.parentId]!;
    updatedPages[page.parentId] = {
      ...parent,
      id: parent.id,
      childrenIds: parent.childrenIds.filter((id) => id !== pageId),
    };
  }

  return {
    pages: updatedPages,
    rootPageIds: state.rootPageIds.filter((id) => id !== pageId),
  };
}

export function restorePageInTreeState(
  state: SidebarState,
  pageId: string,
): Partial<SidebarState> {
  const page = state.pages[pageId];

  if (!page?.isDeleted) return state;

  const toRestore = collectPageSubtree(state.pages, pageId);

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
    const existingPage = updatedPages[pageId];

    if (existingPage) {
      updatedPages[pageId] = {
        ...existingPage,
        parentId: null,
      };
    }

    if (!updatedRootIds.includes(pageId)) {
      updatedRootIds.push(pageId);
    }
  }

  return {
    pages: updatedPages,
    rootPageIds: updatedRootIds,
  };
}

export interface RegisterSubPageOptions {
  icon?: string;
  newPageId: string;
  parentDocId: string;
  title: string;
}

export function registerSubPageInTreeState(
  state: SidebarState,
  options: RegisterSubPageOptions,
): Partial<SidebarState> {
  const { icon = "📄", newPageId, parentDocId, title } = options;
  const parentExists = Boolean(state.pages[parentDocId]);

  const newPage: SidebarPageItem = {
    id: newPageId,
    title,
    icon,
    parentId: parentExists ? parentDocId : null,
    childrenIds: [],
    isBookmarked: false,
    isExpanded: false,
    updatedAt: Date.now(),
  };

  const updatedPages: Record<string, SidebarPageItem> = {
    ...(state.pages as Record<string, SidebarPageItem>),
    [newPageId]: newPage,
  };

  if (parentExists) {
    const parentPage = updatedPages[parentDocId];
    const existingChildren = parentPage.childrenIds;

    updatedPages[parentDocId] = {
      ...parentPage,
      childrenIds: Array.from(new Set([...existingChildren, newPageId])),
      isExpanded: true,
      updatedAt: Date.now(),
    };

    return { pages: updatedPages };
  }

  const nextRootIds = state.rootPageIds.includes(newPageId)
    ? state.rootPageIds
    : [...state.rootPageIds, newPageId];

  return {
    pages: updatedPages,
    rootPageIds: nextRootIds,
  };
}

export function updatePageTitleInTreeState(
  state: SidebarState,
  pageId: string,
  meta: { icon?: string; title?: string },
): Partial<SidebarState> {
  const page = state.pages[pageId];
  if (!page || (meta.title === undefined && meta.icon === undefined))
    return state;

  return {
    pages: {
      ...state.pages,
      [pageId]: {
        ...page,
        ...(meta.title !== undefined && { title: meta.title }),
        ...(meta.icon !== undefined && { icon: meta.icon }),
      },
    },
  };
}

export async function emptyTrashDocuments(
  pages: SidebarPageMap,
): Promise<string[]> {
  const trashedIds = Object.keys(pages).filter((id) => pages[id]?.isDeleted);

  await Promise.all(
    trashedIds.map((id) =>
      pages[id] ? documentService.deletePageAndSubTree(id) : Promise.resolve(),
    ),
  );

  return trashedIds;
}

/* eslint-disable-next-line max-params */
export function movePageInTreeState(
  state: SidebarState,
  sourceId: string,
  targetId: string,
  position: DropPosition,
): Partial<SidebarState> {
  if (!sourceId || !targetId || sourceId === targetId) return state;

  const sourcePage = state.pages[sourceId];
  const targetPage = state.pages[targetId];
  if (!sourcePage || !targetPage) return state;

  // Prevent circular hierarchy: cannot drop into descendant of source
  const sourceDescendants = collectPageSubtree(state.pages, sourceId);
  if (sourceDescendants.has(targetId)) return state;

  const nextPages: Record<string, SidebarPageItem> = {
    ...(state.pages as Record<string, SidebarPageItem>),
  };
  let nextRootPageIds = [...state.rootPageIds];

  const now = Date.now();

  // 1. Remove source from old parent or root
  const oldParentId = sourcePage.parentId;

  if (oldParentId) {
    const oldParent = nextPages[oldParentId];
    nextPages[oldParentId] = {
      ...oldParent,
      childrenIds: oldParent.childrenIds.filter((id) => id !== sourceId),
      updatedAt: now,
    };
  } else {
    nextRootPageIds = nextRootPageIds.filter((id) => id !== sourceId);
  }

  // 2. Insert into new location
  if (position === "inside") {
    const target = nextPages[targetId];
    const nextChildren = target.childrenIds.filter((id) => id !== sourceId);
    nextChildren.push(sourceId);

    nextPages[targetId] = {
      ...target,
      childrenIds: nextChildren,
      isExpanded: true,
      updatedAt: now,
    };

    nextPages[sourceId] = {
      ...sourcePage,
      parentId: targetId,
      updatedAt: now,
    };
  } else {
    const newParentId = targetPage.parentId;

    nextPages[sourceId] = {
      ...sourcePage,
      parentId: newParentId,
      updatedAt: now,
    };

    if (newParentId) {
      const parent = nextPages[newParentId];
      const children = parent.childrenIds.filter((id) => id !== sourceId);
      const targetIdx = children.indexOf(targetId);

      if (targetIdx === -1) {
        children.push(sourceId);
      } else if (position === "before") {
        children.splice(targetIdx, 0, sourceId);
      } else {
        children.splice(targetIdx + 1, 0, sourceId);
      }

      nextPages[newParentId] = {
        ...parent,
        childrenIds: children,
        updatedAt: now,
      };
    } else {
      const targetIdx = nextRootPageIds.indexOf(targetId);

      if (targetIdx === -1) {
        nextRootPageIds.push(sourceId);
      } else if (position === "before") {
        nextRootPageIds.splice(targetIdx, 0, sourceId);
      } else {
        nextRootPageIds.splice(targetIdx + 1, 0, sourceId);
      }
    }
  }

  return {
    pages: nextPages,
    rootPageIds: nextRootPageIds,
  };
}
