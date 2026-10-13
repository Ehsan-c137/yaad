import { Type } from 'class-transformer';
import {
  IsArray,
  IsDefined,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export const SYNC_ENTITY_TYPES = [
  'workspace',
  'workspace_tree',
  'page',
  'document',
  'tag',
] as const;
export type SyncEntityType = (typeof SYNC_ENTITY_TYPES)[number];

export const SYNC_OPERATIONS = ['upsert', 'delete'] as const;
export type SyncOperation = (typeof SYNC_OPERATIONS)[number];

export class SyncMutationDto {
  @IsString()
  @IsNotEmpty()
  clientMutationId!: string;

  @IsIn(SYNC_ENTITY_TYPES, {
    message: `entityType must be one of: ${SYNC_ENTITY_TYPES.join(', ')}`,
  })
  entityType!: SyncEntityType;

  @IsString()
  @IsNotEmpty()
  entityId!: string;

  @IsIn(SYNC_OPERATIONS, {
    message: `operation must be one of: ${SYNC_OPERATIONS.join(', ')}`,
  })
  operation!: SyncOperation;

  @IsDefined()
  payload!: any;

  @IsOptional()
  @IsNumber()
  timestamp?: number;
}

export class PushSyncDto {
  @IsString()
  @IsNotEmpty()
  workspaceId!: string;

  @IsString()
  @IsNotEmpty()
  clientId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncMutationDto)
  mutations!: SyncMutationDto[];
}

export class PullSyncDto {
  @IsString()
  @IsNotEmpty()
  workspaceId!: string;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  sinceVersion!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number;
}

export interface PushResultDto {
  acceptedMutationIds: string[];
  lastServerVersion: number;
}

export interface PullChangeRecord {
  id: string;
  version: number;
  entityType: string;
  entityId: string;
  operation: string;
  patch: any;
  clientMutationId: string | null;
  createdAt: Date;
}

export interface PullResultDto {
  changes: PullChangeRecord[];
  latestVersion: number;
  hasMore: boolean;
}
