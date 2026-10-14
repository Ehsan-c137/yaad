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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { WorkspaceMemberGuard } from '../auth/guards/workspace-member.guard.js';
import {
  AddMemberDto,
  type WorkspaceMemberResponseDto,
} from './dto/workspace-member.dto.js';
import { WorkspacesService } from './workspaces.service.js';

@UseGuards(JwtAuthGuard, WorkspaceMemberGuard)
@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  /**
   * Retrieves all members of the specified workspace.
   */
  @Get(':workspaceId/members')
  async getMembers(
    @Param('workspaceId') workspaceId: string,
  ): Promise<WorkspaceMemberResponseDto[]> {
    return this.workspacesService.getMembers(workspaceId);
  }

  /**
   * Adds or updates a collaborator in the workspace.
   */
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
}
