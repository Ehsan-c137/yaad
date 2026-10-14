import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { CollabGateway } from './collab.gateway.js';
import { CollabPersistenceService } from './collab-persistence.service.js';
import { COLLAB_PERSISTENCE, ROOM_MANAGER } from './collab.tokens.js';
import { YjsRoomManager } from './yjs-room-manager.js';

@Module({
  imports: [DatabaseModule, AuthModule],
  providers: [
    CollabGateway,
    {
      provide: COLLAB_PERSISTENCE,
      useClass: CollabPersistenceService,
    },
    {
      provide: ROOM_MANAGER,
      useClass: YjsRoomManager,
    },
    CollabPersistenceService,
    YjsRoomManager,
  ],
  exports: [CollabGateway, ROOM_MANAGER, COLLAB_PERSISTENCE],
})
export class CollabModule {}
