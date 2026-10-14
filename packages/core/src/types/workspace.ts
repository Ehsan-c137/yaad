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
  isBookmarked?: boolean;
}
export type WorkspaceRole = 'owner' | 'member' | 'viewer';

export interface WorkspaceMember {
  id: string;
  userId: string;
  email: string;
  role: WorkspaceRole;
  createdAt: string | Date;
}

export interface WorkspacePermissions {
  role: WorkspaceRole;
  isReadOnly: boolean;
  canEdit: boolean;
  canManage: boolean;
}
