import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';

import type { CurrentUserPayload } from './guards/current-user.decorator.js';

import { AuthService } from './auth.service.js';
import {
  AuthResponseDto,
  AuthUserResponse,
  LoginDto,
  RegisterDto,
} from './dto/auth.dto.js';
import { CurrentUser } from './guards/current-user.decorator.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { RateLimitGuard } from './guards/rate-limit.guard.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UseGuards(RateLimitGuard)
  async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RateLimitGuard)
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<AuthUserResponse> {
    return {
      id: user.id,
      email: user.email,
    };
  }
}
