import type { ExecutionContext } from '@nestjs/common';

import { createParamDecorator } from '@nestjs/common';

export interface CurrentUserPayload {
  id: string;
  email: string;
}

export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const { user } = request;
    return data ? user?.[data] : user;
  },
);
