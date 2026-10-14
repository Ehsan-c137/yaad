import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkspacesService } from './workspaces.service.js';

describe('WorkspacesService', () => {
  let service: WorkspacesService;
  let mockDb: any;

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

    service = new WorkspacesService(mockDb);
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

    it('deletes membership for non-owner members', async () => {
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockResolvedValueOnce([{ ownerId: 'other_owner' }]);

      mockDb.delete.mockReturnValueOnce(mockDb);
      mockDb.where.mockResolvedValueOnce({});

      await service.removeMember('ws_1', 'user_member', 'user_owner');
      expect(mockDb.delete).toHaveBeenCalled();
    });
  });
});
