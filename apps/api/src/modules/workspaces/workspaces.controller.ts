import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import type { WorkspaceMemberResponseDto } from './dto/workspace-member.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { WorkspaceMemberGuard } from '../auth/guards/workspace-member.guard.js';
import { AddMemberDto } from './dto/workspace-member.dto.js';
import { WorkspacesService } from './workspaces.service.js';

@UseGuards(JwtAuthGuard)
@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  /**
   * Retrieves all workspaces accessible by the current authenticated user.
   */
  @Get()
  async getWorkspaces(@Req() req: any) {
    return this.workspacesService.getUserWorkspaces(req.user?.id);
  }

  /**
   * Retrieves all members of the specified workspace.
   */
  @UseGuards(WorkspaceMemberGuard)
  @Get(':workspaceId/members')
  async getMembers(
    @Param('workspaceId') workspaceId: string,
  ): Promise<WorkspaceMemberResponseDto[]> {
    return this.workspacesService.getMembers(workspaceId);
  }

  /**
   * Adds or updates a collaborator in the workspace.
   */
  @UseGuards(WorkspaceMemberGuard)
  @Post(':workspaceId/members')
  @HttpCode(HttpStatus.OK)
  async addMember(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: AddMemberDto,
    @Req() req: any,
  ): Promise<WorkspaceMemberResponseDto> {
    return this.workspacesService.addMember(workspaceId, dto, req.user?.id);
  }

  /**
   * Removes a member's access from the workspace.
   */
  @UseGuards(WorkspaceMemberGuard)
  @Delete(':workspaceId/members/:memberUserId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMember(
    @Param('workspaceId') workspaceId: string,
    @Param('memberUserId') memberUserId: string,
    @Req() req: any,
  ): Promise<void> {
    await this.workspacesService.removeMember(
      workspaceId,
      memberUserId,
      req.user?.id,
    );
  }

  /**
   * Joins the workspace using the current user session.
   */
  @Post(':workspaceId/join')
  @HttpCode(HttpStatus.OK)
  async joinWorkspace(
    @Param('workspaceId') workspaceId: string,
    @Req() req: any,
  ): Promise<WorkspaceMemberResponseDto> {
    return this.workspacesService.joinWorkspace(workspaceId, req.user?.id);
  }
}
