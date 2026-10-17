import { Injectable } from '@nestjs/common';

import type { SyncEntityType, SyncMutationDto } from '../dto/sync.dto.js';
import type {
  DbTransaction,
  MutationHandler,
} from './mutation-handler.interface.js';

import { pages, workspaceTrees } from '../../../database/schema.js';

@Injectable()
export class WorkspaceTreeMutationHandler implements MutationHandler {
  readonly entityType: SyncEntityType = 'workspace_tree';

  async apply(
    tx: DbTransaction,
    mutation: SyncMutationDto,
    version: number,
    workspaceId: string,
  ): Promise<void> {
    await tx
      .insert(workspaceTrees)
      .values({
        workspaceId,
        version,
        nodes: mutation.payload,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: workspaceTrees.workspaceId,
        set: {
          version,
          nodes: mutation.payload,
          updatedAt: new Date(),
        },
      });

    if (Array.isArray(mutation.payload)) {
      for (const node of mutation.payload) {
        if (!node?.id) continue;
        await tx
          .insert(pages)
          .values({
            id: node.id,
            workspaceId,
            parentId: node.parentId ?? null,
            title: node.title ?? 'Untitled',
            icon: node.icon ?? null,
            isBookmarked: node.isBookmarked ?? false,
            isDeleted: node.isDeleted ?? false,
            deletedAt: node.deletedAt ? new Date(node.deletedAt) : null,
            version,
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: pages.id,
            set: {
              parentId: node.parentId ?? null,
              title: node.title ?? 'Untitled',
              icon: node.icon ?? null,
              isBookmarked: node.isBookmarked ?? false,
              isDeleted: node.isDeleted ?? false,
              deletedAt: node.deletedAt ? new Date(node.deletedAt) : null,
              version,
              updatedAt: new Date(),
            },
          });
      }
    }
  }
}
