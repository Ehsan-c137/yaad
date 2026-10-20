import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import type { SyncEntityType } from '../dto/sync.dto.js';
import type {
  MutationContext,
  MutationHandler,
} from './mutation-handler.interface.js';

import { calendarCategories } from '../../../database/schema.js';

@Injectable()
export class CalendarCategoryMutationHandler implements MutationHandler {
  get entityType(): SyncEntityType {
    return 'calendar_category';
  }

  async apply({
    tx,
    mutation,
    version,
    workspaceId,
  }: MutationContext): Promise<void> {
    if (mutation.operation === 'upsert') {
      await tx
        .insert(calendarCategories)
        .values({
          id: mutation.entityId,
          workspaceId,
          version,
          content: mutation.payload,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: calendarCategories.id,
          set: {
            workspaceId,
            version,
            content: mutation.payload,
            updatedAt: new Date(),
          },
        });
    } else if (mutation.operation === 'delete') {
      await tx
        .delete(calendarCategories)
        .where(eq(calendarCategories.id, mutation.entityId));
    }
  }
}
