import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import { and, eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import type { Database } from '../../database/database.module.js';
import {
  users,
  workspaceMembers,
  workspaces,
} from '../../database/schema.js';
import { CollabGateway } from '../collab/collab.gateway.js';
import type {
  AddMemberDto,
  WorkspaceMemberResponseDto,
} from './dto/workspace-member.dto.js';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectDrizzle() private readonly db: Database,
    @Optional() private readonly collabGateway?: CollabGateway,
  ) {}

  /**
   * Returns all active members of the specified workspace.
   */
  async getMembers(workspaceId: string): Promise<WorkspaceMemberResponseDto[]> {
    const rows = await this.db
      .select({
        id: workspaceMembers.id,
        userId: workspaceMembers.userId,
        email: users.email,
        role: workspaceMembers.role,
        createdAt: workspaceMembers.createdAt,
      })
      .from(workspaceMembers)
      .innerJoin(users, eq(users.id, workspaceMembers.userId))
      .where(eq(workspaceMembers.workspaceId, workspaceId));

    return rows;
  }

  /**
   * Helper to retrieve caller's role in a workspace.
   */
  private async getCallerRole(
    workspaceId: string,
    userId: string,
  ): Promise<string | null> {
    const [ws] = await this.db
      .select({ ownerId: workspaces.ownerId })
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId))
      .limit(1);

    if (ws && ws.ownerId === userId) return 'owner';

    const [member] = await this.db
      .select({ role: workspaceMembers.role })
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, userId),
        ),
      )
      .limit(1);

    return member?.role ?? null;
  }

  /**
   * Adds or updates a user's membership in the specified workspace.
   */
  async addMember(
    workspaceId: string,
    dto: AddMemberDto,
    currentUserId?: string,
  ): Promise<WorkspaceMemberResponseDto> {
    // 1. Authorize caller if user ID provided
    if (currentUserId && workspaceId !== 'ws_personal') {
      const callerRole = await this.getCallerRole(workspaceId, currentUserId);
      if (callerRole !== 'owner') {
        throw new ForbiddenException('Only workspace owners can add or manage members.');
      }
    }

    const trimmedEmail = dto.email.toLowerCase().trim();

    // 2. Locate user by email
    const [targetUser] = await this.db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.email, trimmedEmail))
      .limit(1);

    if (!targetUser) {
      throw new NotFoundException(
        `User with email "${dto.email}" was not found. Please ensure they have registered on this instance.`,
      );
    }

    const role = dto.role ?? 'member';

    // 3. Check if already a member
    const [existing] = await this.db
      .select({ id: workspaceMembers.id })
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, targetUser.id),
        ),
      )
      .limit(1);

    const memberId = existing?.id ?? randomUUID();
    const now = new Date();

    if (existing) {
      await this.db
        .update(workspaceMembers)
        .set({ role })
        .where(eq(workspaceMembers.id, existing.id));

      this.collabGateway?.notifyMemberRoleUpdated(workspaceId, targetUser.id, role);
    } else {
      await this.db.insert(workspaceMembers).values({
        id: memberId,
        workspaceId,
        userId: targetUser.id,
        role,
        createdAt: now,
      });
    }

    return {
      id: memberId,
      userId: targetUser.id,
      email: targetUser.email,
      role,
      createdAt: now,
    };
  }

  /**
   * Removes a member from the workspace.
   */
  async removeMember(
    workspaceId: string,
    targetUserId: string,
    currentUserId?: string,
  ): Promise<void> {
    // Prevent removing the workspace owner
    const [ws] = await this.db
      .select({ ownerId: workspaces.ownerId })
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId))
      .limit(1);

    if (ws && ws.ownerId === targetUserId) {
      throw new ForbiddenException('Cannot remove the workspace owner.');
    }

    // Authorize caller: non-owners can only remove themselves (leave workspace)
    if (currentUserId && currentUserId !== targetUserId && workspaceId !== 'ws_personal') {
      const isOwner = ws?.ownerId === currentUserId;
      if (!isOwner) {
        const [callerMembership] = await this.db
          .select({ role: workspaceMembers.role })
          .from(workspaceMembers)
          .where(
            and(
              eq(workspaceMembers.workspaceId, workspaceId),
              eq(workspaceMembers.userId, currentUserId),
            ),
          )
          .limit(1);

        if (callerMembership?.role !== 'owner') {
          throw new ForbiddenException('Only workspace owners can remove other members.');
        }
      }
    }

    await this.db
      .delete(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, targetUserId),
        ),
      );

    this.collabGateway?.notifyMemberRemoved(workspaceId, targetUserId);
  }

  /**
   * Joins the workspace using the current user identity.
   */
  async joinWorkspace(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspaceMemberResponseDto> {
    // 1. Locate workspace
    const [ws] = await this.db
      .select({ id: workspaces.id, name: workspaces.name, ownerId: workspaces.ownerId })
      .from(workspaces)
      .where(and(eq(workspaces.id, workspaceId), eq(workspaces.isDeleted, false)))
      .limit(1);

    if (!ws) {
      throw new NotFoundException(`Workspace "${workspaceId}" was not found.`);
    }

    // 2. Locate user
    const [targetUser] = await this.db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!targetUser) {
      throw new NotFoundException('User was not found.');
    }

    // 3. Check existing membership
    const [existing] = await this.db
      .select({
        id: workspaceMembers.id,
        role: workspaceMembers.role,
        createdAt: workspaceMembers.createdAt,
      })
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, userId),
        ),
      )
      .limit(1);

    if (existing) {
      return {
        id: existing.id,
        userId: targetUser.id,
        email: targetUser.email,
        role: existing.role,
        createdAt: existing.createdAt,
        workspaceName: ws.name,
      };
    }

    const memberId = randomUUID();
    const now = new Date();
    const role = ws.ownerId === userId ? 'owner' : 'member';

    await this.db.insert(workspaceMembers).values({
      id: memberId,
      workspaceId,
      userId: targetUser.id,
      role,
      createdAt: now,
    });

    return {
      id: memberId,
      userId: targetUser.id,
      email: targetUser.email,
      role,
      createdAt: now,
      workspaceName: ws.name,
    };
  }

  /**
   * Retrieves all workspaces the user owns or is a member of.
   */
  async getUserWorkspaces(
    userId: string,
  ): Promise<Array<{ id: string; name: string; role: string }>> {
    const ownedWorkspaces = await this.db
      .select({
        id: workspaces.id,
        name: workspaces.name,
      })
      .from(workspaces)
      .where(and(eq(workspaces.ownerId, userId), eq(workspaces.isDeleted, false)));

    const memberWorkspaces = await this.db
      .select({
        id: workspaces.id,
        name: workspaces.name,
        role: workspaceMembers.role,
      })
      .from(workspaceMembers)
      .innerJoin(workspaces, eq(workspaces.id, workspaceMembers.workspaceId))
      .where(and(eq(workspaceMembers.userId, userId), eq(workspaces.isDeleted, false)));

    const wsMap = new Map<string, { id: string; name: string; role: string }>();
    for (const w of ownedWorkspaces) {
      wsMap.set(w.id, { id: w.id, name: w.name, role: 'owner' });
    }
    for (const m of memberWorkspaces) {
      if (!wsMap.has(m.id)) {
        wsMap.set(m.id, { id: m.id, name: m.name, role: m.role });
      }
    }

    return Array.from(wsMap.values());
  }
}
