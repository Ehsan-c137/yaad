import { get, keys } from "idb-keyval";

import type { DocumentJSON } from "@/types/document";
import type { Workspace, WorkspacePageMeta } from "@/types/workspace";

import { useInboxStore } from "@/store/inbox/use-inbox-store";
import { useTabStore } from "@/store/use-tab-store";

import type { SerializedBlob, YaadExportPayload } from "./types";

import { blobStorage } from "../blob-storage";
import { blobToDataUrl } from "./blob-utils";

/**
 * Exports all user data including workspaces, page trees, documents, binary blobs, inbox, and open tabs.
 */
export async function exportUserData(): Promise<YaadExportPayload> {
  const rawKeys = await keys();
  const allKeys = rawKeys.filter((k): k is string => typeof k === "string");

  // 1. Workspaces
  const workspacesKey = "app_workspaces_v1";
  const workspaces = (await get<Workspace[]>(workspacesKey)) || [];

  // 2. Page Trees
  const treeKeys = allKeys.filter((k) => k.startsWith("tree_"));
  const treeEntries = await Promise.all(
    treeKeys.map(async (key) => {
      const wsId = key.replace("tree_", "");
      const treeData = await get<WorkspacePageMeta[]>(key);
      return [wsId, treeData] as const;
    }),
  );

  const trees: Record<string, WorkspacePageMeta[]> = {};

  for (const [wsId, treeData] of treeEntries) {
    if (treeData) {
      trees[wsId] = treeData;
    }
  }

  // 3. Documents
  const docKeys = allKeys.filter((k) => k.startsWith("doc_"));
  const docEntries = await Promise.all(
    docKeys.map(async (key) => {
      const docId = key.replace("doc_", "");
      const docData = await get<DocumentJSON>(key);
      return [docId, docData] as const;
    }),
  );

  const documents: Record<string, DocumentJSON> = {};

  for (const [docId, docData] of docEntries) {
    if (docData) {
      documents[docId] = docData;
    }
  }

  // 4. Blobs
  const blobKeys = allKeys.filter((k) => k.startsWith("blob_"));
  const blobEntries = await Promise.all(
    blobKeys.map(async (key) => {
      const blobId = key.replace("blob_", "");
      const rawBlob = await blobStorage.get(blobId);
      if (!rawBlob) return null;

      try {
        const dataUrl = await blobToDataUrl(rawBlob);
        return {
          dataUrl,
          id: blobId,
          mimeType: rawBlob.type || "application/octet-stream",
        };
      } catch (e) {
        console.error(`Failed to serialize blob ${blobId}:`, e);
        return null;
      }
    }),
  );

  const blobs: SerializedBlob[] = blobEntries.filter(
    (b): b is SerializedBlob => b !== null,
  );

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
