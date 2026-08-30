import type { StoreApi } from "zustand";

import { createStore, useStore } from "zustand";

import { useEditorPageIdContext } from "@/context/use-editor-context";

import type { DocumentState } from "./types";

import { createBlockSlice } from "./block-slice";
import { createCoreSlice } from "./core-slice";
import { createMetaSlice } from "./meta-slice";

export type { DocumentState };

const documentStoresMap = new Map<string, StoreApi<DocumentState>>();

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

export function removeDocumentStore(pageId: string) {
  documentStoresMap.delete(pageId);
}

export function useDocumentStore<T>(
  selector: (state: DocumentState) => T,
  explicitPageId?: string,
): T {
  const contextPageId = useEditorPageIdContext();
  const pageId = explicitPageId ?? contextPageId;

  if (!pageId) {
    throw new Error(
      "useDocumentStore requires a pageId from EditorPageIdProvider context or explicitly passed as the second argument.",
    );
  }

  const store = getDocumentStore(pageId);
  return useStore(store, selector);
}
