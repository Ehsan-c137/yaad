import type { StateCreator } from "zustand";

import { documentService } from "@/services/document-service";

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
  },
});
