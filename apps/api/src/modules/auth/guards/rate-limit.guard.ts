import type { CanActivate, ExecutionContext } from '@nestjs/common';

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly ipRequests = new Map<string, RateLimitRecord>();
  private readonly limit = 10; // Max 10 attempts
  private readonly windowMs = 60 * 1000; // per 1 minute window

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const ip =
      req.ip ||
      (Array.isArray(req.headers['x-forwarded-for'])
        ? req.headers['x-forwarded-for'][0]
        : req.headers['x-forwarded-for']) ||
      'unknown';
    const now = Date.now();

    const record = this.ipRequests.get(ip);

    if (!record || now > record.resetTime) {
      this.ipRequests.set(ip, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return true;
    }

    if (record.count >= this.limit) {
      throw new HttpException(
        'Too many requests. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    record.count += 1;
    return true;
  }
}
