import type { DocumentJSON } from "@yaad/core/types/document";
import type { Workspace, WorkspacePageMeta } from "@yaad/core/types/workspace";

import { storage } from "@yaad/core/lib/storage/storage-provider";
import { useInboxStore } from "@yaad/core/store/inbox/use-inbox-store";
import { useTabStore } from "@yaad/core/store/use-tab-store";

import type { SerializedBlob, YaadExportPayload } from "./types";

import { blobToDataUrl } from "./blob-utils";

/**
 * Exports all user data including workspaces, page trees, documents, binary blobs, inbox, and open tabs.
 */
export async function exportUserData(): Promise<YaadExportPayload> {
  // 1. Workspaces
  const workspaces: Workspace[] = await storage.getWorkspaces();

  // 2. Page Trees
  const trees: Record<string, WorkspacePageMeta[]> = {};
  await Promise.all(
    workspaces.map(async (ws) => {
      const tree = await storage.getWorkspaceTree(ws.id);

      if (tree) {
        trees[ws.id] = tree;
      }
    }),
  );

  // 3. Documents
  const documents: Record<string, DocumentJSON> = {};

  if (storage.getAllDocuments) {
    const allDocs = await storage.getAllDocuments();

    for (const doc of allDocs) {
      documents[doc.id] = doc;
    }
  }

  // 4. Blobs
  const blobs: SerializedBlob[] = [];

  if (storage.getAllBlobs) {
    const allBlobs = await storage.getAllBlobs();
    await Promise.all(
      allBlobs.map(async ({ id, blob }) => {
        try {
          const dataUrl = await blobToDataUrl(blob);
          blobs.push({
            dataUrl,
            id,
            mimeType: blob.type || "application/octet-stream",
          });
        } catch (e) {
          console.error(`Failed to serialize blob ${id}:`, e);
        }
      }),
    );
  }

  // 5. Inbox & Tabs from Zustand / LocalStorage
  const inbox = useInboxStore.getState().notifications;
  const { tabs } = useTabStore.getState();

  return {
    app: "yaad",
    data: {
      blobs,
      documents,
      inbox,
      tabs,
      trees,
      workspaces,
    },
    exportedAt: Date.now(),
    version: 1,
  };
}
