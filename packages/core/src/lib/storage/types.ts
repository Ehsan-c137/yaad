import type {
  DocumentBlockType,
  DocumentJSON,
  Tag,
} from "@yaad/core/types/document";
import type { Workspace, WorkspacePageMeta } from "@yaad/core/types/workspace";

export interface PageTreeNode {
  id: string;
  title: string;
  icon?: string;
  parentId: string | null;
  childrenIds: string[];
  updatedAt: number;
}

export interface TagIndexRecord {
  tagId: string;
  pageId: string;
  blockId: string;
  blockType: DocumentBlockType;
  snippet?: string;
  updatedAt: number;
}

export interface StorageAdapter {
  // Initialization
  init?: () => Promise<void>;
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
  getAllDocuments?: () => Promise<DocumentJSON[]>;
  // Tag Operations
  getTags?: () => Promise<Tag[]>;
  saveTags?: (tags: Tag[]) => Promise<void>;
  // Tag Index Operations
  saveDocTags?: (pageId: string, records: TagIndexRecord[]) => Promise<void>;
  deleteDocTags?: (pageId: string) => Promise<void>;
  getTagsIndex?: (tagId?: string) => Promise<TagIndexRecord[]>;
  // Blob Operations
  getBlob: (id: string) => Promise<Blob | undefined>;
  saveBlob: (id: string, blob: Blob) => Promise<void>;
  removeBlob: (id: string) => Promise<void>;
  getAllBlobs?: () => Promise<{ id: string; blob: Blob }[]>;
}
