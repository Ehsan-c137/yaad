import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import type { SyncEntityType } from '../dto/sync.dto.js';
import type { MutationHandler } from './mutation-handler.interface.js';

import { DocumentMutationHandler } from './document-mutation.handler.js';
import { PageMutationHandler } from './page-mutation.handler.js';
import { TagMutationHandler } from './tag-mutation.handler.js';
import { WorkspaceMutationHandler } from './workspace-mutation.handler.js';
import { WorkspaceTreeMutationHandler } from './workspace-tree-mutation.handler.js';

@Injectable()
export class SyncHandlerRegistry {
  private readonly handlers = new Map<SyncEntityType, MutationHandler>();
  @Inject(PageMutationHandler)
  private readonly pageHandler!: PageMutationHandler;
  @Inject(DocumentMutationHandler)
  private readonly documentHandler!: DocumentMutationHandler;
  @Inject(WorkspaceTreeMutationHandler)
  private readonly treeHandler!: WorkspaceTreeMutationHandler;
  @Inject(WorkspaceMutationHandler)
  private readonly workspaceHandler!: WorkspaceMutationHandler;
  @Inject(TagMutationHandler)
  private readonly tagHandler!: TagMutationHandler;

  constructor() {
    this.register(this.pageHandler);
    this.register(this.documentHandler);
    this.register(this.treeHandler);
    this.register(this.workspaceHandler);
    this.register(this.tagHandler);
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
