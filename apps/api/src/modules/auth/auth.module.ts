import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '../../database/database.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { WorkspaceMemberGuard } from './guards/workspace-member.guard.js';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.register({
      global: false,
      secret: process.env.JWT_SECRET || 'yaad-default-secret-key-change-in-production',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, WorkspaceMemberGuard],
  exports: [AuthService, JwtAuthGuard, WorkspaceMemberGuard, JwtModule],
})
export class AuthModule {}
