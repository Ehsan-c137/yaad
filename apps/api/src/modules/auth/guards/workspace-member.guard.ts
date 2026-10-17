import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { AuthService } from '../auth.service.js';

@Injectable()
export class WorkspaceMemberGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { user } = request;

    if (!user?.id) {
      throw new ForbiddenException('User is not authenticated');
    }

    const workspaceId =
      request.params?.workspaceId ??
      request.body?.workspaceId ??
      request.query?.workspaceId;

    if (!workspaceId || typeof workspaceId !== 'string') {
      throw new BadRequestException(
        'workspaceId is required for this operation',
      );
    }

    const isMember = await this.authService.isUserMemberOfWorkspace(
      user.id,
      workspaceId,
    );

    if (!isMember) {
      throw new ForbiddenException(
        `User does not have access to workspace ${workspaceId}`,
      );
    }

    return true;
  }
}
