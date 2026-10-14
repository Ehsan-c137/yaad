import type { WorkspacePermissions, WorkspaceRole } from '../../types/workspace';

export function evaluateWorkspacePermissions(role: WorkspaceRole): WorkspacePermissions {
  const isReadOnly = role === 'viewer';
  const canEdit = role === 'owner' || role === 'member';
  const canManage = role === 'owner';

  return {
    role,
    isReadOnly,
    canEdit,
    canManage,
  };
}
