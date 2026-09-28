import { UnauthorizedException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EntriesService } from './entries.service.js';
import { EntryResponseDto } from './dto/entry-response.dto.js';
import type { PrismaService } from '../prisma/prisma.service.js';

const savedEntry = {
  id: 'entry_test_123',
  userId: 'local_user_123',
  title: 'A sample title',
  content: '  Synthetic diary text.  ',
  entryDate: new Date('2024-02-29T00:00:00.000Z'),
  createdAt: new Date('2024-02-29T12:00:00.000Z'),
  updatedAt: new Date('2024-02-29T12:00:00.000Z'),
};

describe('EntriesService', () => {
  const create = vi.fn();
  const prisma = { diaryEntry: { create } } as unknown as PrismaService;
  const service = new EntriesService(prisma);

  beforeEach(() => {
    create.mockReset();
    create.mockResolvedValue(savedEntry);
  });

  it('creates an entry for the verified Clerk user and preserves submitted content', async () => {
    const input = {
      title: 'A sample title',
      content: '  Synthetic diary text.  ',
      entryDate: '2024-02-29',
    };

    const response = await service.create('clerk_user_123', input);
    expect(response).toBeInstanceOf(EntryResponseDto);
    expect(response).toEqual({
      id: 'entry_test_123',
      title: 'A sample title',
      content: '  Synthetic diary text.  ',
      entryDate: '2024-02-29',
      createdAt: '2024-02-29T12:00:00.000Z',
      updatedAt: '2024-02-29T12:00:00.000Z',
    });
    expect(response).not.toHaveProperty('userId');
    expect(create).toHaveBeenCalledOnce();
    expect(create).toHaveBeenCalledWith({
      data: {
        title: 'A sample title',
        content: '  Synthetic diary text.  ',
        entryDate: new Date('2024-02-29T00:00:00.000Z'),
        user: {
          connectOrCreate: {
            where: { clerkUserId: 'clerk_user_123' },
            create: { clerkUserId: 'clerk_user_123' },
          },
        },
      },
    });
  });

  it('stores a missing title as null and uses the caller identity for ownership', async () => {
    create.mockResolvedValue({ ...savedEntry, title: null });

    await expect(
      service.create('another_clerk_user', {
        content: 'Synthetic content',
        entryDate: '2024-02-29',
      }),
    ).resolves.toMatchObject({ title: null });
    expect(create).toHaveBeenCalledWith({
      data: {
        title: null,
        content: 'Synthetic content',
        entryDate: new Date('2024-02-29T00:00:00.000Z'),
        user: {
          connectOrCreate: {
            where: { clerkUserId: 'another_clerk_user' },
            create: { clerkUserId: 'another_clerk_user' },
          },
        },
      },
    });
  });

  it('rejects a missing verified identity without writing an entry', async () => {
    await expect(
      service.create('  ', {
        content: 'Synthetic content',
        entryDate: '2024-02-29',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(create).not.toHaveBeenCalled();
  });

  it('rejects an invalid diary date without writing an entry', async () => {
    await expect(
      service.create('clerk_user_123', {
        content: 'Synthetic content',
        entryDate: '2025-02-29',
      }),
    ).rejects.toBeInstanceOf(RangeError);
    expect(create).not.toHaveBeenCalled();
  });
});
