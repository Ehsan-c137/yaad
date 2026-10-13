import { NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SyncService } from './sync.service.js';

describe('SyncService', () => {
  let service: SyncService;
  let mockDb: any;
  let mockHandler: any;
  let mockRegistry: any;

  beforeEach(() => {
    mockDb = {
      select: vi.fn(),
      transaction: vi.fn(),
    };
    mockHandler = {
      entityType: 'page',
      apply: vi.fn().mockResolvedValue(undefined),
    };
    mockRegistry = {
      get: vi.fn().mockReturnValue(mockHandler),
      register: vi.fn(),
    };
    service = new SyncService(mockDb, mockRegistry as any);
  });

  describe('push', () => {
    it('throws NotFoundException when workspace does not exist', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      await expect(
        service.push({
          workspaceId: 'ws_missing',
          clientId: 'client_1',
          mutations: [],
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('processes mutations via handler registry and returns updated version', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: 'ws_1', currentVersion: 10 }]),
          }),
        }),
      });

      const mockTx = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]), // No existing log
            }),
          }),
        }),
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockResolvedValue(undefined),
        }),
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(undefined),
          }),
        }),
      };

      mockDb.transaction.mockImplementation(async (callback: any) => {
        return callback(mockTx);
      });

      const mutation = {
        clientMutationId: 'mut_1',
        entityType: 'page' as const,
        entityId: 'page_1',
        operation: 'upsert' as const,
        payload: { title: 'My Page' },
      };

      const result = await service.push({
        workspaceId: 'ws_1',
        clientId: 'client_1',
        mutations: [mutation],
      });

      expect(mockRegistry.get).toHaveBeenCalledWith('page');
      expect(mockHandler.apply).toHaveBeenCalledWith(
        mockTx,
        mutation,
        11,
        'ws_1',
      );
      expect(result.acceptedMutationIds).toContain('mut_1');
      expect(result.lastServerVersion).toBe(11);
    });

    it('skips mutation execution when clientMutationId is already processed', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: 'ws_1', currentVersion: 10 }]),
          }),
        }),
      });

      const mockTx = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([{ id: 'existing_log_1' }]), // Already processed
            }),
          }),
        }),
        insert: vi.fn(),
        update: vi.fn(),
      };

      mockDb.transaction.mockImplementation(async (callback: any) => {
        return callback(mockTx);
      });

      const result = await service.push({
        workspaceId: 'ws_1',
        clientId: 'client_1',
        mutations: [
          {
            clientMutationId: 'mut_already_done',
            entityType: 'page',
            entityId: 'page_1',
            operation: 'upsert',
            payload: {},
          },
        ],
      });

      expect(mockHandler.apply).not.toHaveBeenCalled();
      expect(result.acceptedMutationIds).toContain('mut_already_done');
      expect(result.lastServerVersion).toBe(10);
    });
  });

  describe('pull', () => {
    it('returns delta changes since version', async () => {
      const mockWorkspaceQuery = {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ currentVersion: 25 }]),
          }),
        }),
      };

      const mockLogQuery = {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([
                {
                  id: 'log_1',
                  version: 24,
                  entityType: 'page',
                  entityId: 'page_1',
                  operation: 'upsert',
                  patch: {},
                  clientMutationId: 'mut_1',
                  createdAt: new Date(),
                },
              ]),
            }),
          }),
        }),
      };

      mockDb.select
        .mockReturnValueOnce(mockWorkspaceQuery)
        .mockReturnValueOnce(mockLogQuery);

      const result = await service.pull({
        workspaceId: 'ws_1',
        sinceVersion: 23,
      });

      expect(result.latestVersion).toBe(25);
      expect(result.changes).toHaveLength(1);
      expect(result.hasMore).toBe(true);
    });
  });
});
