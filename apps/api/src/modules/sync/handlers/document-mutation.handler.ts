import { Injectable } from '@nestjs/common';

import type { SyncEntityType } from '../dto/sync.dto.js';
import type {
  MutationContext,
  MutationHandler,
} from './mutation-handler.interface.js';

import { documents, pages } from '../../../database/schema.js';

@Injectable()
export class DocumentMutationHandler implements MutationHandler {
  get entityType(): SyncEntityType {
    return 'document';
  }

  async apply({
    tx,
    mutation,
    version,
    workspaceId,
  }: MutationContext): Promise<void> {
    // Ensure parent page exists to satisfy documents_id_pages_id_fk
    await tx
      .insert(pages)
      .values({
        id: mutation.entityId,
        workspaceId,
        title: mutation.payload?.title ?? 'Untitled',
        icon: mutation.payload?.icon ?? '📄',
        updatedAt: new Date(mutation.payload?.updatedAt ?? Date.now()),
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
