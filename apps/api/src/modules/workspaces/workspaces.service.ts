import {
  ForbiddenException,
  Injectable,
  NotFoundException,
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
import type {
  AddMemberDto,
  WorkspaceMemberResponseDto,
} from './dto/workspace-member.dto.js';

@Injectable()
export class WorkspacesService {
  constructor(@InjectDrizzle() private readonly db: Database) {}

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
   * Adds or updates a user's membership in the specified workspace.
   */
  async addMember(
    workspaceId: string,
    dto: AddMemberDto,
    _currentUserId: string,
  ): Promise<WorkspaceMemberResponseDto> {
    const trimmedEmail = dto.email.toLowerCase().trim();

    // 1. Locate user by email
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

    // 2. Check if already a member
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
    _currentUserId: string,
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

    await this.db
      .delete(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, targetUserId),
        ),
      );
  }
}
