import type { DocumentJSON } from "@/types/document";
import type { Workspace, WorkspacePageMeta } from "@/types/workspace";

export interface PageTreeNode {
  id: string;
  title: string;
  icon?: string;
  parentId: string | null;
  childrenIds: string[];
  updatedAt: number;
}

export interface StorageAdapter {
  // Worksapce operations
  getWorkspaces: () => Promise<Workspace[]>;
  saveWorkspace: (workspace: Workspace) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
  //Workspace-Scoped Page Tree
  getWorkspaceTree: (workspaceId: string) => Promise<WorkspacePageMeta[]>;
  saveWorkspaceTree: (
    workspaceId: string,
    tree: WorkspacePageMeta[],
  ) => Promise<void>;
  // Document Operations
  getDocument: (id: string) => Promise<DocumentJSON | null>;
  saveDocument: (doc: DocumentJSON) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  // Blob Operations
  getBlob: (id: string) => Promise<Blob | undefined>;
  saveBlob: (id: string, blob: Blob) => Promise<void>;
  removeBlob: (id: string) => Promise<void>;
}
