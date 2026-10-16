import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { workspaces } from '../../../database/schema.js';
import type { SyncEntityType, SyncMutationDto } from '../dto/sync.dto.js';
import type {
  DbTransaction,
  MutationHandler,
} from './mutation-handler.interface.js';

@Injectable()
export class WorkspaceMutationHandler implements MutationHandler {
  readonly entityType: SyncEntityType = 'workspace';

  async apply(
    tx: DbTransaction,
    mutation: SyncMutationDto,
    _version: number,
    workspaceId: string,
  ): Promise<void> {
    const targetWorkspaceId = mutation.entityId || workspaceId;

    if (mutation.operation === 'upsert') {
      const updateData: Record<string, any> = {
        updatedAt: new Date(),
      };

      if (mutation.payload?.name) {
        updateData.name = mutation.payload.name;
      }

      if (mutation.payload?.isDeleted !== undefined) {
        updateData.isDeleted = Boolean(mutation.payload.isDeleted);
        updateData.deletedAt = updateData.isDeleted ? new Date() : null;
      }

      await tx
        .update(workspaces)
        .set(updateData)
        .where(eq(workspaces.id, targetWorkspaceId));
    } else if (mutation.operation === 'delete') {
      await tx
        .update(workspaces)
        .set({
          isDeleted: true,
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(workspaces.id, targetWorkspaceId));
    }
  }
}
