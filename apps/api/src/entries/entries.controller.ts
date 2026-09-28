import {
  Body,
  Controller,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard.js';
import { EntriesService } from './entries.service.js';
import type { Request } from 'express';
import { CreateEntryDto } from './dto/create-entry.dto.js';
import { EntryResponseDto } from './dto/entry-response.dto.js';
import { getAuth } from '@clerk/express';

@Controller('entries')
@UseGuards(ClerkAuthGuard)
export class EntriesController {
  constructor(private readonly entriesService: EntriesService) {}

  @Post()
  create(
    @Req() request: Request,
    @Body() input: CreateEntryDto,
  ): Promise<EntryResponseDto> {
    const clerkUserId = getAuth(request).userId;

    if (!clerkUserId) {
      throw new UnauthorizedException();
    }

    return this.entriesService.create(clerkUserId, input);
  }
}
