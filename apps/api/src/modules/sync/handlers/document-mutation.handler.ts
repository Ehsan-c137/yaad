import { Injectable } from '@nestjs/common';
import { documents } from '../../../database/schema.js';
import type { SyncEntityType, SyncMutationDto } from '../dto/sync.dto.js';
import type {
  DbTransaction,
  MutationHandler,
} from './mutation-handler.interface.js';

@Injectable()
export class DocumentMutationHandler implements MutationHandler {
  readonly entityType: SyncEntityType = 'document';

  async apply(
    tx: DbTransaction,
    mutation: SyncMutationDto,
    version: number,
    workspaceId: string,
  ): Promise<void> {
    await tx
      .insert(documents)
      .values({
        id: mutation.entityId,
        workspaceId,
        version,
        content: mutation.payload,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: documents.id,
        set: {
          version,
          content: mutation.payload,
          updatedAt: new Date(),
        },
      });
  }
}
