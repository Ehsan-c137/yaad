import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { PullSyncDto, PushSyncDto, SyncMutationDto } from './sync.dto.js';

describe('Sync DTO Runtime Validation', () => {
  describe('SyncMutationDto', () => {
    it('validates a valid mutation successfully', async () => {
      const dto = plainToInstance(SyncMutationDto, {
        clientMutationId: 'mut_123',
        entityType: 'page',
        entityId: 'page_abc',
        operation: 'upsert',
        payload: { title: 'Hello World' },
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('rejects unsupported entityType', async () => {
      const dto = plainToInstance(SyncMutationDto, {
        clientMutationId: 'mut_123',
        entityType: 'invalid_entity',
        entityId: 'page_abc',
        operation: 'upsert',
        payload: { title: 'Hello' },
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'entityType')).toBe(true);
    });

    it('rejects unsupported operation', async () => {
      const dto = plainToInstance(SyncMutationDto, {
        clientMutationId: 'mut_123',
        entityType: 'page',
        entityId: 'page_abc',
        operation: 'drop_database',
        payload: {},
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'operation')).toBe(true);
    });

    it('rejects empty clientMutationId or entityId', async () => {
      const dto = plainToInstance(SyncMutationDto, {
        clientMutationId: '',
        entityType: 'page',
        entityId: '',
        operation: 'upsert',
        payload: {},
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThanOrEqual(2);
      expect(errors.some((e) => e.property === 'clientMutationId')).toBe(true);
      expect(errors.some((e) => e.property === 'entityId')).toBe(true);
    });
  });

  describe('PushSyncDto', () => {
    it('validates a well-formed push payload with nested mutations', async () => {
      const dto = plainToInstance(PushSyncDto, {
        workspaceId: 'ws_abc',
        clientId: 'client_xyz',
        mutations: [
          {
            clientMutationId: 'mut_1',
            entityType: 'page',
            entityId: 'page_1',
            operation: 'upsert',
            payload: { title: 'My Page' },
          },
        ],
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('rejects push payload if nested mutation is invalid', async () => {
      const dto = plainToInstance(PushSyncDto, {
        workspaceId: 'ws_abc',
        clientId: 'client_xyz',
        mutations: [
          {
            clientMutationId: 'mut_1',
            entityType: 'invalid_entity',
            entityId: 'page_1',
            operation: 'upsert',
            payload: {},
          },
        ],
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('mutations');
      expect(errors[0].children?.[0]?.children?.some((e) => e.property === 'entityType')).toBe(true);
    });

    it('rejects push payload missing workspaceId or clientId', async () => {
      const dto = plainToInstance(PushSyncDto, {
        workspaceId: '',
        clientId: '',
        mutations: [],
      });

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'workspaceId')).toBe(true);
      expect(errors.some((e) => e.property === 'clientId')).toBe(true);
    });
  });

  describe('PullSyncDto', () => {
    it('validates a valid pull request', async () => {
      const dto = plainToInstance(PullSyncDto, {
        workspaceId: 'ws_123',
        sinceVersion: 5,
        limit: 100,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('rejects negative sinceVersion or zero limit', async () => {
      const dto = plainToInstance(PullSyncDto, {
        workspaceId: 'ws_123',
        sinceVersion: -1,
        limit: 0,
      });

      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'sinceVersion')).toBe(true);
      expect(errors.some((e) => e.property === 'limit')).toBe(true);
    });
  });
});
