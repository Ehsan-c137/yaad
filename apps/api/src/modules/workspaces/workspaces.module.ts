import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';
import { CollabModule } from '../collab/collab.module.js';
import { WorkspacesController } from './workspaces.controller.js';
import { WorkspacesService } from './workspaces.service.js';

@Module({
  imports: [AuthModule, CollabModule],
  controllers: [WorkspacesController],
  providers: [WorkspacesService],
  exports: [WorkspacesService],
})
export class WorkspacesModule {}
