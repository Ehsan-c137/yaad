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
    const defaultWorkspaceId = `ws_${randomUUID()}`;

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

    return {
      user: {
        id: user.id,
        email: user.email,
      },
      accessToken,
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
    const [membership] = await this.db
      .select({ id: workspaceMembers.id })
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.userId, userId),
          eq(workspaceMembers.workspaceId, workspaceId),
        ),
      )
      .limit(1);

    return Boolean(membership);
  }
}
