import { getAuth } from '@clerk/express';
import { UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EntriesController } from './entries.controller.js';
import type { EntriesService } from './entries.service.js';
import type { CreateEntryDto } from './dto/create-entry.dto.js';
import { EntryResponseDto } from './dto/entry-response.dto.js';

vi.mock('@clerk/express', () => ({
  getAuth: vi.fn(),
}));

const mockGetAuth = vi.mocked(getAuth);

describe('EntriesController', () => {
  const create = vi.fn();
  const entriesService = { create } as unknown as EntriesService;
  const controller = new EntriesController(entriesService);
  const request = {} as Request;
  const input = {
    title: 'A synthetic title',
    content: 'Synthetic diary text.',
    entryDate: '2024-02-29',
  } as CreateEntryDto;
  const response = Object.assign(new EntryResponseDto(), {
    id: 'entry_test_123',
    title: 'A synthetic title',
    content: 'Synthetic diary text.',
    entryDate: '2024-02-29',
    createdAt: '2024-02-29T12:00:00.000Z',
    updatedAt: '2024-02-29T12:00:00.000Z',
  });

  beforeEach(() => {
    mockGetAuth.mockReset();
    create.mockReset();
    create.mockResolvedValue(response);
  });

  it('passes the verified Clerk user ID and validated body to the service', async () => {
    mockGetAuth.mockReturnValue({
      userId: 'clerk_user_test_123',
    } as unknown as ReturnType<typeof getAuth>);

    await expect(controller.create(request, input)).resolves.toBe(response);

    expect(mockGetAuth).toHaveBeenCalledWith(request);
    expect(create).toHaveBeenCalledWith('clerk_user_test_123', input);
  });

  it('rejects missing Clerk identity without calling the service', () => {
    mockGetAuth.mockReturnValue({
      userId: null,
    } as unknown as ReturnType<typeof getAuth>);

    expect(() => controller.create(request, input)).toThrow(
      UnauthorizedException,
    );
    expect(create).not.toHaveBeenCalled();
  });
});
