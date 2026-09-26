import { getAuth } from '@clerk/express';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const { isAuthenticated, userId } = getAuth(request);

    if (!isAuthenticated || !userId) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
