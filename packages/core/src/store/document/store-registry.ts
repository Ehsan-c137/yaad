import type { StoreApi } from "zustand";
import type { DocumentState } from "./types";

const documentStoresMap = new Map<string, StoreApi<DocumentState>>();

export function hasDocumentStore(pageId: string): boolean {
  return documentStoresMap.has(pageId);
}

export function getExistingDocumentStore(
  pageId: string,
): StoreApi<DocumentState> | undefined {
  return documentStoresMap.get(pageId);
}

export function registerDocumentStore(
  pageId: string,
  store: StoreApi<DocumentState>,
): void {
  documentStoresMap.set(pageId, store);
}

export function deleteDocumentStoreFromRegistry(pageId: string): boolean {
  return documentStoresMap.delete(pageId);
}
