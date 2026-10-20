import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import type { SyncEntityType } from '../dto/sync.dto.js';
import type {
  MutationContext,
  MutationHandler,
} from './mutation-handler.interface.js';

import { calendarEvents } from '../../../database/schema.js';

@Injectable()
export class CalendarEventMutationHandler implements MutationHandler {
  get entityType(): SyncEntityType {
    return 'calendar_event';
  }

  async apply({
    tx,
    mutation,
    version,
    workspaceId,
  }: MutationContext): Promise<void> {
    if (mutation.operation === 'upsert') {
      await tx
        .insert(calendarEvents)
        .values({
          id: mutation.entityId,
          workspaceId,
          version,
          content: mutation.payload,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: calendarEvents.id,
          set: {
            workspaceId,
            version,
            content: mutation.payload,
            updatedAt: new Date(),
          },
        });
    } else if (mutation.operation === 'delete') {
      await tx
        .delete(calendarEvents)
        .where(eq(calendarEvents.id, mutation.entityId));
    }
  }
}
