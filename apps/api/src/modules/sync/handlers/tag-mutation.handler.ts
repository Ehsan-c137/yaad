import { Injectable, Logger } from '@nestjs/common';
import type { SyncEntityType, SyncMutationDto } from '../dto/sync.dto.js';
import type {
  DbTransaction,
  MutationHandler,
} from './mutation-handler.interface.js';

@Injectable()
export class TagMutationHandler implements MutationHandler {
  private readonly logger = new Logger(TagMutationHandler.name);
  readonly entityType: SyncEntityType = 'tag';

  async apply(
    _tx: DbTransaction,
    mutation: SyncMutationDto,
    _version: number,
    _workspaceId: string,
  ): Promise<void> {
    // Tags are block-level attributes captured directly in the sync log
    this.logger.debug(
      `Tag mutation processed for ${mutation.entityId} (${mutation.operation})`,
    );
  }
}
