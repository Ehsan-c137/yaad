import type { StoreApi } from "zustand";

import { createStore, useStore } from "zustand";

import type { DocumentState } from "./types";

import { createBlockSlice } from "./block-slice";
import { createCoreSlice } from "./core-slice";
import { cancelAutoSave, flushAutoSave } from "./helpers";
import { createMetaSlice } from "./meta-slice";
import {
  deleteDocumentStoreFromRegistry,
  getExistingDocumentStore,
  hasDocumentStore,
  registerDocumentStore,
} from "./store-registry";

export type { DocumentState };
export { getExistingDocumentStore, hasDocumentStore };

export function getDocumentStore(pageId: string): StoreApi<DocumentState> {
  let store = getExistingDocumentStore(pageId);

  if (!store) {
    store = createStore<DocumentState>()((...args) => ({
      ...createCoreSlice(...args),
      ...createBlockSlice(...args),
      ...createMetaSlice(...args),
    }));
    registerDocumentStore(pageId, store);
  }

  return store;
}

export function removeDocumentStore(pageId: string, shouldFlush = true) {
  const store = getExistingDocumentStore(pageId);

  if (store) {
    if (shouldFlush) {
      const doc = store.getState().currentDocument;
      void flushAutoSave(pageId, doc).catch((error) => {
        console.error("[useDocumentStore] Failed to flush auto-save:", error);
      });
    } else {
      cancelAutoSave(pageId);
    }

    deleteDocumentStoreFromRegistry(pageId);
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
