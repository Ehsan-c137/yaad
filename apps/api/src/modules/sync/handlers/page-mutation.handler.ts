import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import type { SyncEntityType, SyncMutationDto } from '../dto/sync.dto.js';
import type {
  DbTransaction,
  MutationHandler,
} from './mutation-handler.interface.js';

import { pages } from '../../../database/schema.js';

@Injectable()
export class PageMutationHandler implements MutationHandler {
  readonly entityType: SyncEntityType = 'page';

  async apply(
    tx: DbTransaction,
    mutation: SyncMutationDto,
    version: number,
    workspaceId: string,
  ): Promise<void> {
    if (mutation.operation === 'upsert') {
      await tx
        .insert(pages)
        .values({
          id: mutation.entityId,
          workspaceId,
          parentId: mutation.payload.parentId ?? null,
          title: mutation.payload.title ?? 'Untitled',
          icon: mutation.payload.icon ?? null,
          isBookmarked: mutation.payload.isBookmarked ?? false,
          isDeleted: mutation.payload.isDeleted ?? false,
          deletedAt: mutation.payload.deletedAt
            ? new Date(mutation.payload.deletedAt)
            : null,
          version,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: pages.id,
          set: {
            parentId: mutation.payload.parentId ?? null,
            title: mutation.payload.title ?? 'Untitled',
            icon: mutation.payload.icon ?? null,
            isBookmarked: mutation.payload.isBookmarked ?? false,
            isDeleted: mutation.payload.isDeleted ?? false,
            deletedAt: mutation.payload.deletedAt
              ? new Date(mutation.payload.deletedAt)
              : null,
            version,
            updatedAt: new Date(),
          },
        });
    } else if (mutation.operation === 'delete') {
      // Tombstone soft delete
      await tx
        .update(pages)
        .set({
          isDeleted: true,
          deletedAt: new Date(),
          version,
          updatedAt: new Date(),
        })
        .where(eq(pages.id, mutation.entityId));
    }
  }
}
