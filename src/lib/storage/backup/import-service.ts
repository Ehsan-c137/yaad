import { set } from "idb-keyval";

import { useInboxStore } from "@/store/inbox/use-inbox-store";
import { useTabStore } from "@/store/use-tab-store";
import { useWorkspaceStore } from "@/store/use-workspace-store";

import type { YaadExportPayload } from "./types";

import { blobStorage } from "../blob-storage";
import { dataUrlToBlob } from "./blob-utils";

/**
 * Imports a sanitized Yaad export payload into IndexedDB and refreshes active Zustand stores.
 */
export async function importUserData(
  payload: YaadExportPayload,
): Promise<void> {
  const { workspaces, trees, documents, blobs, inbox, tabs } = payload.data;

  // 1. Save Workspaces to IndexedDB
  const WORKSPACES_KEY = "app_workspaces_v1";
  await set(WORKSPACES_KEY, workspaces);

  // 2. Save Page Trees to IndexedDB
  await Promise.all(
    Object.entries(trees).map(([wsId, tree]) => set(`tree_${wsId}`, tree)),
  );

  // 3. Save Documents to IndexedDB
  await Promise.all(
    Object.entries(documents).map(([docId, doc]) => set(`doc_${docId}`, doc)),
  );

  // 4. Save Blobs to blobStorage IndexedDB
  await Promise.all(
    blobs.map(async (serializedBlob) => {
      try {
        const blob = dataUrlToBlob(serializedBlob.dataUrl);
        await blobStorage.save(serializedBlob.id, blob);
      } catch (e) {
        console.error(`Failed to restore blob ${serializedBlob.id}:`, e);
      }
    }),
  );

  // 5. Save Inbox & Tabs to Zustand stores
  if (inbox && inbox.length > 0) {
    useInboxStore.setState({ notifications: inbox });
  }

  if (tabs && tabs.length > 0) {
    useTabStore.setState({ activeTabId: tabs[0]?.id || null, tabs });
  }

  // 6. Reload Workspace Store state & Sidebar tree
  await useWorkspaceStore.getState().loadInitialWorkspaces();
}
