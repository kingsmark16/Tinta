import {
  Controller,
  Get,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ClerkAuthGuard } from './clerk-auth.guard.js';
import type { Request } from 'express';
import { getAuth } from '@clerk/express';

@Controller('auth')
@UseGuards(ClerkAuthGuard)
export class AuthController {
  @Get('me')
  getCurrentUser(@Req() request: Request): { userId: string } {
    const userId = getAuth(request).userId;

    if (!userId) {
      throw new UnauthorizedException();
    }

    return { userId };
  }
}
