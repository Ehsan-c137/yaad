import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  PullSyncDto,
  PushSyncDto,
  type PullResultDto,
  type PushResultDto,
} from './dto/sync.dto.js';
import { SyncService } from './sync.service.js';

@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  /**
   * Push a batch of pending local mutations to the server.
   */
  @Post('push')
  @HttpCode(HttpStatus.OK)
  async push(@Body() dto: PushSyncDto): Promise<PushResultDto> {
    return this.syncService.push(dto);
  }

  /**
   * Pull delta changes since a specific version checkpoint (POST version).
   */
  @Post('pull')
  @HttpCode(HttpStatus.OK)
  async pull(@Body() dto: PullSyncDto): Promise<PullResultDto> {
    return this.syncService.pull(dto);
  }

  /**
   * Pull delta changes via GET query parameters.
   */
  @Get('pull')
  async pullGet(
    @Query('workspaceId') workspaceId: string,
    @Query('sinceVersion', new ParseIntPipe({ optional: true }))
    sinceVersion = 0,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 500,
  ): Promise<PullResultDto> {
    return this.syncService.pull({ workspaceId, sinceVersion, limit });
  }
}
