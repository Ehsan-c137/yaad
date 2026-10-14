import { describe, expect, it } from 'vitest';
import { evaluateWorkspacePermissions } from '../workspace-permissions';

describe('evaluateWorkspacePermissions', () => {
  it('grants full ownership permissions for owner role', () => {
    const permissions = evaluateWorkspacePermissions('owner');
    expect(permissions.role).toBe('owner');
    expect(permissions.isReadOnly).toBe(false);
    expect(permissions.canEdit).toBe(true);
    expect(permissions.canManage).toBe(true);
  });

  it('grants editing permissions but restricts management for member role', () => {
    const permissions = evaluateWorkspacePermissions('member');
    expect(permissions.role).toBe('member');
    expect(permissions.isReadOnly).toBe(false);
    expect(permissions.canEdit).toBe(true);
    expect(permissions.canManage).toBe(false);
  });

  it('restricts edit and manage permissions for viewer role (read-only mode)', () => {
    const permissions = evaluateWorkspacePermissions('viewer');
    expect(permissions.role).toBe('viewer');
    expect(permissions.isReadOnly).toBe(true);
    expect(permissions.canEdit).toBe(false);
    expect(permissions.canManage).toBe(false);
  });
});
