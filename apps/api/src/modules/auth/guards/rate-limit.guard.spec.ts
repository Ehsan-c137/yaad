import { HttpException, HttpStatus } from '@nestjs/common';
import { beforeEach, describe, expect, it } from 'vitest';

import { RateLimitGuard } from './rate-limit.guard.js';

describe('RateLimitGuard', () => {
  let guard: RateLimitGuard;

  beforeEach(() => {
    guard = new RateLimitGuard();
  });

  const createMockContext = (ip: string) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          ip,
          headers: {},
        }),
      }),
    }) as any;

  it('allows requests within rate limit', () => {
    const ctx = createMockContext('127.0.0.1');

    for (let i = 0; i < 10; i++) {
      expect(guard.canActivate(ctx)).toBe(true);
    }
  });

  it('throws 429 Too Many Requests when rate limit is exceeded', () => {
    const ctx = createMockContext('127.0.0.1');

    for (let i = 0; i < 10; i++) {
      guard.canActivate(ctx);
    }

    expect(() => guard.canActivate(ctx)).toThrow(HttpException);

    try {
      guard.canActivate(ctx);
    } catch (err: any) {
      expect(err.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
    }
  });

  it('tracks different IP addresses separately', () => {
    const ctx1 = createMockContext('1.1.1.1');
    const ctx2 = createMockContext('2.2.2.2');

    for (let i = 0; i < 10; i++) {
      guard.canActivate(ctx1);
    }

    expect(() => guard.canActivate(ctx1)).toThrow(HttpException);
    expect(guard.canActivate(ctx2)).toBe(true);
  });
});
