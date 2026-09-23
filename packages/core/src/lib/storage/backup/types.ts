import type { NotificationItem } from "@yaad/core/store/inbox/use-inbox-store";
import type { TabItem } from "@yaad/core/store/use-tab-store";
import type { DocumentJSON } from "@yaad/core/types/document";
import type { Workspace, WorkspacePageMeta } from "@yaad/core/types/workspace";

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
