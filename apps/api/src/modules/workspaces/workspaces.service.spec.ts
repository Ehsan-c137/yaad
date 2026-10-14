import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkspacesService } from './workspaces.service.js';

describe('WorkspacesService', () => {
  let service: WorkspacesService;
  let mockDb: any;
  let mockCollabGateway: any;

  beforeEach(() => {
    mockDb = {
      select: vi.fn(),
      from: vi.fn(),
      innerJoin: vi.fn(),
      where: vi.fn(),
      limit: vi.fn(),
      insert: vi.fn(),
      values: vi.fn(),
      onConflictDoUpdate: vi.fn(),
      update: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
    };

    mockCollabGateway = {
      notifyMemberRoleUpdated: vi.fn(),
      notifyMemberRemoved: vi.fn(),
    };

    service = new WorkspacesService(mockDb, mockCollabGateway);
  });

  describe('getMembers', () => {
    it('returns list of members for workspace', async () => {
      const mockRows = [
        {
          id: 'mem_1',
          userId: 'user_1',
          email: 'alice@yaad.app',
          role: 'owner',
          createdAt: new Date(),
        },
      ];

      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.innerJoin.mockReturnValue(mockDb);
      mockDb.where.mockResolvedValue(mockRows);

      const result = await service.getMembers('ws_1');
      expect(result).toEqual(mockRows);
    });
  });

  describe('addMember', () => {
    it('throws NotFoundException if invited user email does not exist', async () => {
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.limit.mockResolvedValue([]);

      await expect(
        service.addMember('ws_1', { email: 'unknown@test.com', role: 'member' }, 'user_1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('adds member when target user exists', async () => {
      // 1. User lookup
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockResolvedValueOnce([{ id: 'user_2', email: 'bob@test.com' }]);

      // 2. Existing check
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockResolvedValueOnce([]);

      // 3. Insert
      mockDb.insert.mockReturnValue(mockDb);
      mockDb.values.mockResolvedValue({});

      const result = await service.addMember(
        'ws_1',
        { email: 'bob@test.com', role: 'member' },
        'user_1',
      );

      expect(result.userId).toBe('user_2');
      expect(result.email).toBe('bob@test.com');
      expect(result.role).toBe('member');
    });

    it('updates role and notifies CollabGateway when user is already a member', async () => {
      // 1. User lookup
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockResolvedValueOnce([{ id: 'user_2', email: 'bob@test.com' }]);

      // 2. Existing check
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockResolvedValueOnce([{ id: 'mem_existing' }]);

      // 3. Update
      mockDb.update.mockReturnValue(mockDb);
      mockDb.set.mockReturnValue(mockDb);
      mockDb.where.mockResolvedValue({});

      const result = await service.addMember(
        'ws_1',
        { email: 'bob@test.com', role: 'viewer' },
        'user_1',
      );

      expect(result.role).toBe('viewer');
      expect(mockCollabGateway.notifyMemberRoleUpdated).toHaveBeenCalledWith(
        'ws_1',
        'user_2',
        'viewer',
      );
    });
  });

  describe('removeMember', () => {
    it('throws ForbiddenException if target user is the workspace owner', async () => {
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.limit.mockResolvedValue([{ ownerId: 'user_owner' }]);

      await expect(
        service.removeMember('ws_1', 'user_owner', 'user_owner'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('deletes membership for non-owner members and notifies CollabGateway', async () => {
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockResolvedValueOnce([{ ownerId: 'other_owner' }]);

      mockDb.delete.mockReturnValueOnce(mockDb);
      mockDb.where.mockResolvedValueOnce({});

      await service.removeMember('ws_1', 'user_member', 'user_owner');
      expect(mockDb.delete).toHaveBeenCalled();
      expect(mockCollabGateway.notifyMemberRemoved).toHaveBeenCalledWith(
        'ws_1',
        'user_member',
      );
    });
  });

  describe('joinWorkspace', () => {
    it('throws NotFoundException if workspace does not exist', async () => {
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.limit.mockResolvedValue([]);

      await expect(service.joinWorkspace('ws_nonexistent', 'user_1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns existing membership if user is already a member', async () => {
      // 1. Workspace lookup
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockResolvedValueOnce([{ id: 'ws_1', name: 'My Team', ownerId: 'user_owner' }]);

      // 2. User lookup
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockResolvedValueOnce([{ id: 'user_1', email: 'user@test.com' }]);

      // 3. Existing check
      const createdAt = new Date();
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockResolvedValueOnce([{ id: 'mem_1', role: 'member', createdAt }]);

      const result = await service.joinWorkspace('ws_1', 'user_1');
      expect(result.id).toBe('mem_1');
      expect(result.role).toBe('member');
      expect(result.workspaceName).toBe('My Team');
    });

    it('creates membership and returns it if user is joining for first time', async () => {
      // 1. Workspace lookup
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockResolvedValueOnce([{ id: 'ws_1', name: 'New Collab', ownerId: 'user_owner' }]);

      // 2. User lookup
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockResolvedValueOnce([{ id: 'user_2', email: 'newbie@test.com' }]);

      // 3. Existing check
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockResolvedValueOnce([]);

      // 4. Insert
      mockDb.insert.mockReturnValue(mockDb);
      mockDb.values.mockResolvedValue({});

      const result = await service.joinWorkspace('ws_1', 'user_2');
      expect(result.userId).toBe('user_2');
      expect(result.email).toBe('newbie@test.com');
      expect(result.role).toBe('member');
      expect(result.workspaceName).toBe('New Collab');
    });
  });
});
