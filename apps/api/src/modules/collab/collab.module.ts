import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module.js';
import { CollabGateway } from './collab.gateway.js';
import { CollabPersistenceService } from './collab-persistence.service.js';
import { YjsRoomManager } from './yjs-room-manager.js';

@Module({
  imports: [DatabaseModule],
  providers: [CollabGateway, YjsRoomManager, CollabPersistenceService],
  exports: [CollabGateway, YjsRoomManager],
})
export class CollabModule {}
