import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module.js';
import { DocumentMutationHandler } from './handlers/document-mutation.handler.js';
import { PageMutationHandler } from './handlers/page-mutation.handler.js';
import { SyncHandlerRegistry } from './handlers/sync-handler.registry.js';
import { WorkspaceTreeMutationHandler } from './handlers/workspace-tree-mutation.handler.js';
import { SyncController } from './sync.controller.js';
import { SyncService } from './sync.service.js';

@Module({
  imports: [DatabaseModule],
  controllers: [SyncController],
  providers: [
    PageMutationHandler,
    DocumentMutationHandler,
    WorkspaceTreeMutationHandler,
    SyncHandlerRegistry,
    SyncService,
  ],
  exports: [SyncService, SyncHandlerRegistry],
})
export class SyncModule {}
