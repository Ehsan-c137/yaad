import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module.js';
import { DocumentMutationHandler } from './handlers/document-mutation.handler.js';
import { PageMutationHandler } from './handlers/page-mutation.handler.js';
import { SyncHandlerRegistry } from './handlers/sync-handler.registry.js';
import { TagMutationHandler } from './handlers/tag-mutation.handler.js';
import { WorkspaceMutationHandler } from './handlers/workspace-mutation.handler.js';
import { WorkspaceTreeMutationHandler } from './handlers/workspace-tree-mutation.handler.js';
import { SyncController } from './sync.controller.js';
import { SyncService } from './sync.service.js';

import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [SyncController],
  providers: [
    PageMutationHandler,
    DocumentMutationHandler,
    WorkspaceTreeMutationHandler,
    WorkspaceMutationHandler,
    TagMutationHandler,
    SyncHandlerRegistry,
    SyncService,
  ],
  exports: [SyncService, SyncHandlerRegistry],
})
export class SyncModule {}
