import { getAuth } from '@clerk/express';
import { UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthController } from './auth.controller.js';

vi.mock('@clerk/express', () => ({
  getAuth: vi.fn(),
}));

const mockGetAuth = vi.mocked(getAuth);

describe('AuthController', () => {
  const controller = new AuthController();
  const request = {} as Request;

  beforeEach(() => {
    mockGetAuth.mockReset();
  });

  it('returns the authenticated Clerk user ID from the request', () => {
    mockGetAuth.mockReturnValue({
      userId: 'user_test_123',
    } as unknown as ReturnType<typeof getAuth>);

    expect(controller.getCurrentUser(request)).toEqual({
      userId: 'user_test_123',
    });
    expect(mockGetAuth).toHaveBeenCalledWith(request);
  });

  it('rejects auth state without a user ID', () => {
    mockGetAuth.mockReturnValue({
      userId: null,
    } as unknown as ReturnType<typeof getAuth>);

    expect(() => controller.getCurrentUser(request)).toThrow(
      UnauthorizedException,
    );
  });
});
