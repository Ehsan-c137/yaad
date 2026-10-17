import { Injectable, Logger } from '@nestjs/common';

import type { SyncEntityType } from '../dto/sync.dto.js';
import type {
  MutationContext,
  MutationHandler,
} from './mutation-handler.interface.js';

@Injectable()
export class TagMutationHandler implements MutationHandler {
  private readonly logger = new Logger(TagMutationHandler.name);

  get entityType(): SyncEntityType {
    return 'tag';
  }

  apply({ mutation }: MutationContext): Promise<void> {
    // Tags are block-level attributes captured directly in the sync log
    this.logger.debug(
      `Tag mutation processed for ${mutation.entityId} (${mutation.operation})`,
    );

    return Promise.resolve();
  }
}
