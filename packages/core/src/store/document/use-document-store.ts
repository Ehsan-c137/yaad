import type { StoreApi } from "zustand";

import { createStore, useStore } from "zustand";

import type { DocumentState } from "./types";

import { createBlockSlice } from "./block-slice";
import { createCoreSlice } from "./core-slice";
import { cancelAutoSave, flushAutoSave } from "./helpers";
import { createMetaSlice } from "./meta-slice";

export type { DocumentState };

const documentStoresMap = new Map<string, StoreApi<DocumentState>>();

export function hasDocumentStore(pageId: string): boolean {
  return documentStoresMap.has(pageId);
}

export function getExistingDocumentStore(
  pageId: string,
): StoreApi<DocumentState> | undefined {
  return documentStoresMap.get(pageId);
}

export function getDocumentStore(pageId: string): StoreApi<DocumentState> {
  if (!documentStoresMap.has(pageId)) {
    const store = createStore<DocumentState>()((...args) => ({
      ...createCoreSlice(...args),
      ...createBlockSlice(...args),
      ...createMetaSlice(...args),
    }));
    documentStoresMap.set(pageId, store);
  }

  return documentStoresMap.get(pageId)!;
}

export function removeDocumentStore(pageId: string, shouldFlush = true) {
  const store = documentStoresMap.get(pageId);

  if (store) {
    if (shouldFlush) {
      const doc = store.getState().currentDocument;
      void flushAutoSave(pageId, doc).catch((error) => {
        console.error("[useDocumentStore] Failed to flush auto-save:", error);
      });
    } else {
      cancelAutoSave(pageId);
    }
    documentStoresMap.delete(pageId);
  }
}

export function useDocumentStoreCore<T>(
  selector: (state: DocumentState) => T,
  pageId?: string,
): T {
  if (!pageId) {
    throw new Error("useDocumentStore requires a pageId passed as argument.");
  }

  const store = getDocumentStore(pageId);
  return useStore(store, selector);
}
