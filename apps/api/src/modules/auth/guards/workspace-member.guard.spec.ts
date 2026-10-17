import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { WorkspaceMemberGuard } from './workspace-member.guard.js';

describe('WorkspaceMemberGuard', () => {
  let guard: WorkspaceMemberGuard;
  let mockAuthService: any;

  beforeEach(() => {
    mockAuthService = {
      isUserMemberOfWorkspace: vi.fn(),
    };
    guard = new WorkspaceMemberGuard(mockAuthService);
  });

  const createMockContext = (request: any) =>
    ({
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    }) as any;

  it('allows access when user is a member of workspace', async () => {
    mockAuthService.isUserMemberOfWorkspace.mockResolvedValue(true);

    const ctx = createMockContext({
      user: { id: 'user_1' },
      body: { workspaceId: 'ws_1' },
    });

    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
    expect(mockAuthService.isUserMemberOfWorkspace).toHaveBeenCalledWith(
      'user_1',
      'ws_1',
    );
  });

  it('throws ForbiddenException when user is not a member', async () => {
    mockAuthService.isUserMemberOfWorkspace.mockResolvedValue(false);

    const ctx = createMockContext({
      user: { id: 'attacker_user' },
      body: { workspaceId: 'victim_workspace' },
    });

    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  it('throws BadRequestException if workspaceId is missing from request', async () => {
    const ctx = createMockContext({
      user: { id: 'user_1' },
      body: {},
    });

    await expect(guard.canActivate(ctx)).rejects.toThrow(BadRequestException);
  });
});
