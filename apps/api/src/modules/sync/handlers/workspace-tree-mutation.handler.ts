import { Injectable } from '@nestjs/common';
import { workspaceTrees } from '../../../database/schema.js';
import type { SyncEntityType, SyncMutationDto } from '../dto/sync.dto.js';
import type {
  DbTransaction,
  MutationHandler,
} from './mutation-handler.interface.js';

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
  }
}
