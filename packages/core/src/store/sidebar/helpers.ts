import type { DocumentBlock, DocumentJSON } from "@yaad/core/types/document";
import type { WorkspacePageMeta } from "@yaad/core/types/workspace";

import { generateBlockId } from "@yaad/core/lib/id";
import { documentService } from "@yaad/core/services/document-service";
import { workspaceService } from "@yaad/core/services/workspace-service";

import type { SidebarPageItem, SidebarPageMap, SidebarState } from "./types";

import { useTabStore } from "../use-tab-store";

let currentWorkspaceId: string | null = null;
let saveTreeTimer: ReturnType<typeof setTimeout> | null = null;

export function persistWorkspaceTree(
  pages: SidebarPageMap,
  workspaceId?: string | null,
) {
  const wsId = workspaceId ?? currentWorkspaceId;
  if (!wsId) return;

  if (saveTreeTimer) {
    clearTimeout(saveTreeTimer);
  }

  saveTreeTimer = setTimeout(async () => {
    try {
      const treeNodes: WorkspacePageMeta[] = Object.values(pages)
        .filter((p): p is SidebarPageItem => Boolean(p))
        .map((p) => ({
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
    } catch (e) {
      console.error("Error saving workspace tree to storage:", e);
    }
  }, 100);
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
