import { storage } from "@yaad/core/lib/storage/storage-provider";
import { useInboxStore } from "@yaad/core/store/inbox/use-inbox-store";
import { useTabStore } from "@yaad/core/store/use-tab-store";
import { useWorkspaceStore } from "@yaad/core/store/use-workspace-store";

import type { YaadExportPayload } from "./types";

import { dataUrlToBlob } from "./blob-utils";

/**
 * Imports a sanitized Yaad export payload into storage and refreshes active Zustand stores.
 */
export async function importUserData(
  payload: YaadExportPayload,
): Promise<void> {
  const { workspaces, trees, documents, blobs, inbox, tabs } = payload.data;

  // 1. Save Workspaces
  await Promise.all(workspaces.map((ws) => storage.saveWorkspace(ws)));

  // 2. Save Page Trees
  await Promise.all(
    Object.entries(trees).map(([wsId, tree]) =>
      storage.saveWorkspaceTree(wsId, tree),
    ),
  );

  // 3. Save Documents
  await Promise.all(
    Object.values(documents).map((doc) => storage.saveDocument(doc)),
  );

  // 4. Save Blobs
  await Promise.all(
    blobs.map(async (serializedBlob) => {
      try {
        const blob = dataUrlToBlob(serializedBlob.dataUrl);
        await storage.saveBlob(serializedBlob.id, blob);
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
