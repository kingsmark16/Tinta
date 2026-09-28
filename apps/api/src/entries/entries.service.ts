import { Injectable, UnauthorizedException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateEntryDto } from './dto/create-entry.dto.js';
import { EntryResponseDto } from './dto/entry-response.dto.js';
import {
  fromDatabaseEntryDate,
  toDatabaseEntryDate,
} from './entry-date.mapper.js';

@Injectable()
export class EntriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    clerkUserId: string,
    input: CreateEntryDto,
  ): Promise<EntryResponseDto> {
    if (!clerkUserId?.trim()) {
      throw new UnauthorizedException();
    }

    const entry = await this.prisma.diaryEntry.create({
      data: {
        title: input.title ?? null,
        content: input.content,
        entryDate: toDatabaseEntryDate(input.entryDate),
        user: {
          connectOrCreate: {
            where: { clerkUserId },
            create: { clerkUserId },
          },
        },
      },
    });

    return plainToInstance(
      EntryResponseDto,
      {
        id: entry.id,
        title: entry.title,
        content: entry.content,
        entryDate: fromDatabaseEntryDate(entry.entryDate),
        createdAt: entry.createdAt.toISOString(),
        updatedAt: entry.updatedAt.toISOString(),
      },
      { excludeExtraneousValues: true },
    );
  }
}
