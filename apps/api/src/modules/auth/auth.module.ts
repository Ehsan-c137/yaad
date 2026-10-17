import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { DatabaseModule } from '../../database/database.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { RateLimitGuard } from './guards/rate-limit.guard.js';
import { WorkspaceMemberGuard } from './guards/workspace-member.guard.js';

const isProduction = process.env.NODE_ENV === 'production';
const jwtSecret = process.env.JWT_SECRET;

if (
  isProduction &&
  (!jwtSecret ||
    jwtSecret.includes('default') ||
    jwtSecret.includes('change-in-production'))
) {
  throw new Error(
    'FATAL: JWT_SECRET environment variable must be set to a secure secret in production',
  );
}

@Module({
  imports: [
    DatabaseModule,
    JwtModule.register({
      global: false,
      secret: jwtSecret ?? 'yaad-default-secret-key-change-in-production',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, WorkspaceMemberGuard, RateLimitGuard],
  exports: [
    AuthService,
    JwtAuthGuard,
    WorkspaceMemberGuard,
    RateLimitGuard,
    JwtModule,
  ],
})
export class AuthModule {}
