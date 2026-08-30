import type { NotificationItem } from "@/store/inbox/use-inbox-store";
import type { TabItem } from "@/store/use-tab-store";
import type { DocumentJSON } from "@/types/document";
import type { Workspace, WorkspacePageMeta } from "@/types/workspace";

export interface SerializedBlob {
  dataUrl: string;
  id: string;
  mimeType: string;
}

export interface YaadExportPayload {
  app: "yaad";
  data: {
    blobs: SerializedBlob[];
    documents: Record<string, DocumentJSON>;
    inbox?: NotificationItem[];
    tabs?: TabItem[];
    trees: Record<string, WorkspacePageMeta[]>;
    workspaces: Workspace[];
  };
  exportedAt: number;
  version: 1;
}

export interface ImportSanitizationResult {
  error?: string;
  payload?: YaadExportPayload;
  stats: {
    blobCount: number;
    documentCount: number;
    sanitizedStringCount: number;
    workspaceCount: number;
  };
  valid: boolean;
}
