import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectDrizzle } from '@nestjs/drizzle';
import bcrypt from 'bcryptjs';
import { and, eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import type { Database } from '../../database/database.module.js';
import {
  users,
  workspaceMembers,
  workspaces,
} from '../../database/schema.js';
import type {
  AuthResponseDto,
  LoginDto,
  RegisterDto,
} from './dto/auth.dto.js';

export interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectDrizzle() private readonly db: Database,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Registers a new user, hashes password, creates a default workspace, and issues a JWT token.
   */
  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const existing = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, dto.email.toLowerCase().trim()))
      .limit(1);

    if (existing.length > 0) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const userId = randomUUID();
    const defaultWorkspaceId = randomUUID();

    // Atomically create user, default workspace, and owner membership
    await this.db.transaction(async (tx) => {
      await tx.insert(users).values({
        id: userId,
        email: dto.email.toLowerCase().trim(),
        passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await tx.insert(workspaces).values({
        id: defaultWorkspaceId,
        name: 'My Workspace',
        ownerId: userId,
        currentVersion: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await tx.insert(workspaceMembers).values({
        id: randomUUID(),
        workspaceId: defaultWorkspaceId,
        userId,
        role: 'owner',
        createdAt: new Date(),
      });
    });

    const payload: JwtPayload = { sub: userId, email: dto.email.toLowerCase().trim() };
    const accessToken = await this.jwtService.signAsync(payload);

    this.logger.log(`Registered user ${userId} (${dto.email})`);

    return {
      user: {
        id: userId,
        email: dto.email.toLowerCase().trim(),
      },
      accessToken,
      defaultWorkspaceId,
      workspaces: [
        {
          id: defaultWorkspaceId,
          name: 'My Workspace',
          role: 'owner',
        },
      ],
    };
  }

  /**
   * Validates credentials and returns an access token.
   */
  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, dto.email.toLowerCase().trim()))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload: JwtPayload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);

    const ownedWorkspaces = await this.db
      .select({
        id: workspaces.id,
        name: workspaces.name,
      })
      .from(workspaces)
      .where(and(eq(workspaces.ownerId, user.id), eq(workspaces.isDeleted, false)));

    const memberWorkspaces = await this.db
      .select({
        id: workspaces.id,
        name: workspaces.name,
        role: workspaceMembers.role,
      })
      .from(workspaceMembers)
      .innerJoin(workspaces, eq(workspaces.id, workspaceMembers.workspaceId))
      .where(and(eq(workspaceMembers.userId, user.id), eq(workspaces.isDeleted, false)));

    const wsMap = new Map<string, { id: string; name: string; role?: string }>();
    for (const w of ownedWorkspaces) {
      wsMap.set(w.id, { id: w.id, name: w.name, role: 'owner' });
    }
    for (const m of memberWorkspaces) {
      if (!wsMap.has(m.id)) {
        wsMap.set(m.id, { id: m.id, name: m.name, role: m.role });
      }
    }

    const wsList = Array.from(wsMap.values());
    const defaultWorkspaceId = wsList.length > 0 ? wsList[0].id : undefined;

    return {
      user: {
        id: user.id,
        email: user.email,
      },
      accessToken,
      defaultWorkspaceId,
      workspaces: wsList,
    };
  }

  /**
   * Verifies and decodes a JWT bearer token.
   */
  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      return await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired authentication token');
    }
  }

  /**
   * Checks whether a user is an active member or owner of a given workspace.
   */
  async isUserMemberOfWorkspace(
    userId: string,
    workspaceId: string,
  ): Promise<boolean> {
    const role = await this.getUserRole(userId, workspaceId);
    return role !== null;
  }

  /**
   * Retrieves the role of a user in a given workspace ('owner' | 'member' | 'viewer' | null).
   */
  async getUserRole(
    userId: string,
    workspaceId: string,
  ): Promise<string | null> {
    const [membership] = await this.db
      .select({ role: workspaceMembers.role })
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.userId, userId),
          eq(workspaceMembers.workspaceId, workspaceId),
        ),
      )
      .limit(1);

    if (membership) return membership.role;

    const [ws] = await this.db
      .select({ ownerId: workspaces.ownerId })
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId))
      .limit(1);

    if (ws && ws.ownerId === userId) return 'owner';

    // Auto-provision and join for personal/local development workspace
    if (workspaceId === 'ws_personal') {
      try {
        await this.db
          .insert(workspaces)
          .values({
            id: workspaceId,
            name: 'Personal Workspace',
            ownerId: userId,
            currentVersion: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .onConflictDoNothing();

        await this.db
          .insert(workspaceMembers)
          .values({
            id: randomUUID(),
            workspaceId,
            userId,
            role: 'owner',
            createdAt: new Date(),
          })
          .onConflictDoNothing();

        return 'owner';
      } catch {
        return 'owner';
      }
    }

    return null;
  }
}
