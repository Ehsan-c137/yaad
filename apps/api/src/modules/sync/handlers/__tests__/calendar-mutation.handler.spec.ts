import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CalendarCategoryMutationHandler } from '../calendar-category-mutation.handler.js';
import { CalendarEventMutationHandler } from '../calendar-event-mutation.handler.js';

describe('Calendar Mutation Handlers', () => {
  let mockTx: any;

  beforeEach(() => {
    mockTx = {
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          onConflictDoUpdate: vi.fn().mockResolvedValue(undefined),
        }),
      }),
      delete: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    };
  });

  describe('CalendarEventMutationHandler', () => {
    const handler = new CalendarEventMutationHandler();

    it('has entityType "calendar_event"', () => {
      expect(handler.entityType).toBe('calendar_event');
    });

    it('upserts calendar event', async () => {
      await handler.apply({
        tx: mockTx,
        mutation: {
          clientMutationId: 'mut_1',
          entityType: 'calendar_event',
          entityId: 'evt_1',
          operation: 'upsert',
          payload: {
            id: 'evt_1',
            title: 'Sprint Planning',
            date: '2026-10-21',
          },
        },
        version: 5,
        workspaceId: 'ws_1',
      });

      expect(mockTx.insert).toHaveBeenCalled();
    });

    it('deletes calendar event', async () => {
      await handler.apply({
        tx: mockTx,
        mutation: {
          clientMutationId: 'mut_2',
          entityType: 'calendar_event',
          entityId: 'evt_1',
          operation: 'delete',
          payload: { id: 'evt_1' },
        },
        version: 6,
        workspaceId: 'ws_1',
      });

      expect(mockTx.delete).toHaveBeenCalled();
    });
  });

  describe('CalendarCategoryMutationHandler', () => {
    const handler = new CalendarCategoryMutationHandler();

    it('has entityType "calendar_category"', () => {
      expect(handler.entityType).toBe('calendar_category');
    });

    it('upserts calendar category', async () => {
      await handler.apply({
        tx: mockTx,
        mutation: {
          clientMutationId: 'mut_3',
          entityType: 'calendar_category',
          entityId: 'cat_work',
          operation: 'upsert',
          payload: { id: 'cat_work', name: 'Work', dotColor: '#3b82f6' },
        },
        version: 7,
        workspaceId: 'ws_1',
      });

      expect(mockTx.insert).toHaveBeenCalled();
    });

    it('deletes calendar category', async () => {
      await handler.apply({
        tx: mockTx,
        mutation: {
          clientMutationId: 'mut_4',
          entityType: 'calendar_category',
          entityId: 'cat_work',
          operation: 'delete',
          payload: { id: 'cat_work' },
        },
        version: 8,
        workspaceId: 'ws_1',
      });

      expect(mockTx.delete).toHaveBeenCalled();
    });
  });
});
