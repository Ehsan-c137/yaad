import type { StateCreator } from "zustand";

import { documentService } from "@yaad/core/services/document-service";
import { useSidebarStore } from "@yaad/core/store/use-sidebar-store";

import type { DocumentCoreSlice, DocumentState } from "./types";

import { saveNow } from "./helpers";

export const createCoreSlice: StateCreator<
  DocumentState,
  [],
  [],
  DocumentCoreSlice
> = (set, get) => ({
  currentDocument: null,
  isSaving: false,
  _hasHydrated: false,

  loadDocument: async (id: string) => {
    const doc = await documentService.loadDocument(id);
    const existing = get().currentDocument;
    if (existing && existing.id === id) {
      const existingHasChildren = (existing.blocks.root?.childrenIds?.length ?? 0) > 0;
      const existingBlockCount = Object.keys(existing.blocks).length;
      const loadedBlockCount = Object.keys(doc.blocks).length;
      if (existingBlockCount > loadedBlockCount || (existingBlockCount > 1 && existingHasChildren)) {
        set({ _hasHydrated: true });
        return;
      }
    }
    set({ currentDocument: doc, _hasHydrated: true });
  },

  saveCurrentDocumentImmediately: async () => {
    const doc = get().currentDocument;

    if (doc) {
      await saveNow(get, set, doc);
    }
  },

  deleteDocument: async (documentId: string) => {
    if (!documentId) return;

    await documentService.deletePageAndSubTree(documentId);
    useSidebarStore.getState().deletePage(documentId);
  },
});
