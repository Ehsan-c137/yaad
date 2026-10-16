import { Injectable } from '@nestjs/common';
import { documents, pages } from '../../../database/schema.js';
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
    // Ensure parent page exists to satisfy documents_id_pages_id_fk
    await tx
      .insert(pages)
      .values({
        id: mutation.entityId,
        workspaceId,
        title: mutation.payload?.title || 'Untitled',
        icon: mutation.payload?.icon ?? '📄',
        updatedAt: new Date(mutation.payload?.updatedAt || Date.now()),
      })
      .onConflictDoNothing();

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
