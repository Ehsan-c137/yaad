import { BadRequestException, Injectable } from '@nestjs/common';
import type { SyncEntityType } from '../dto/sync.dto.js';
import { DocumentMutationHandler } from './document-mutation.handler.js';
import type { MutationHandler } from './mutation-handler.interface.js';
import { PageMutationHandler } from './page-mutation.handler.js';
import { WorkspaceTreeMutationHandler } from './workspace-tree-mutation.handler.js';

@Injectable()
export class SyncHandlerRegistry {
  private readonly handlers = new Map<SyncEntityType, MutationHandler>();

  constructor(
    pageHandler: PageMutationHandler,
    documentHandler: DocumentMutationHandler,
    treeHandler: WorkspaceTreeMutationHandler,
  ) {
    this.register(pageHandler);
    this.register(documentHandler);
    this.register(treeHandler);
  }

  register(handler: MutationHandler): void {
    this.handlers.set(handler.entityType, handler);
  }

  get(entityType: SyncEntityType): MutationHandler {
    const handler = this.handlers.get(entityType);
    if (!handler) {
      throw new BadRequestException(
        `Unsupported entity type for synchronization: "${entityType}"`,
      );
    }
    return handler;
  }
}
