export interface Workspace {
  id: string;
  name: string;
  icon: string;
  createdAt: number;
  updatedAt: number;
}

export interface WorkspacePageMeta {
  id: string;
  workspaceId: string;
  title: string;
  icon?: string;
  parentId: string | null;
  childrenIds: string[];
  isDeleted?: boolean;
  deletedAt?: number;
  updatedAt: number;
}
