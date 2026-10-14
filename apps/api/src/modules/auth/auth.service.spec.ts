import 'reflect-metadata';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import bcrypt from 'bcryptjs';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  let service: AuthService;
  let mockDb: any;
  let mockJwtService: any;

  beforeEach(() => {
    mockDb = {
      select: vi.fn(),
      insert: vi.fn(),
      transaction: vi.fn(async (cb) => {
        const tx = {
          insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) }),
        };
        return cb(tx);
      }),
    };

    mockJwtService = {
      signAsync: vi.fn().mockResolvedValue('mock_jwt_token'),
      verifyAsync: vi.fn().mockResolvedValue({ sub: 'user_1', email: 'test@yaad.app' }),
    };

    service = new AuthService(mockDb, mockJwtService);
  });

  describe('register', () => {
    it('successfully registers a user, creates default workspace, and returns JWT', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]), // No existing user
          }),
        }),
      });

      const result = await service.register({
        email: 'test@yaad.app',
        password: 'password123',
      });

      expect(result.user.email).toBe('test@yaad.app');
      expect(result.accessToken).toBe('mock_jwt_token');
      expect(result.defaultWorkspaceId).toBeDefined();
      expect(mockDb.transaction).toHaveBeenCalled();
    });

    it('throws ConflictException if email is already taken', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: 'existing_user' }]),
          }),
        }),
      });

      await expect(
        service.register({
          email: 'test@yaad.app',
          password: 'password123',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('returns access token for valid credentials', async () => {
      const passwordHash = await bcrypt.hash('secret123', 10);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                id: 'user_1',
                email: 'test@yaad.app',
                passwordHash,
              },
            ]),
          }),
        }),
      });

      const result = await service.login({
        email: 'test@yaad.app',
        password: 'secret123',
      });

      expect(result.user.id).toBe('user_1');
      expect(result.accessToken).toBe('mock_jwt_token');
    });

    it('throws UnauthorizedException for invalid password', async () => {
      const passwordHash = await bcrypt.hash('correct_password', 10);
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                id: 'user_1',
                email: 'test@yaad.app',
                passwordHash,
              },
            ]),
          }),
        }),
      });

      await expect(
        service.login({
          email: 'test@yaad.app',
          password: 'wrong_password',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException for non-existent user', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      await expect(
        service.login({
          email: 'missing@yaad.app',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('isUserMemberOfWorkspace', () => {
    it('returns true when membership exists', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: 'mem_1' }]),
          }),
        }),
      });

      const isMember = await service.isUserMemberOfWorkspace('u1', 'ws1');
      expect(isMember).toBe(true);
    });

    it('returns false when membership does not exist', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const isMember = await service.isUserMemberOfWorkspace('u1', 'ws1');
      expect(isMember).toBe(false);
    });
  });
});
