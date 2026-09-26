import { UnauthorizedException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { getAuth } from '@clerk/express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Request } from 'express';
import { ClerkAuthGuard } from './clerk-auth.guard.js';

vi.mock('@clerk/express', () => ({
  getAuth: vi.fn(),
}));

const mockGetAuth = vi.mocked(getAuth);

describe('ClerkAuthGuard', () => {
  let guard: ClerkAuthGuard;
  const request = {} as Request;
  const context = {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;

  function setAuthState(isAuthenticated: boolean, userId: string | null): void {
    mockGetAuth.mockReturnValue({
      isAuthenticated,
      userId,
    } as unknown as ReturnType<typeof getAuth>);
  }

  beforeEach(() => {
    guard = new ClerkAuthGuard();
    mockGetAuth.mockReset();
  });

  it('rejects signed-out requests', () => {
    setAuthState(false, null);

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('rejects an authenticated state without a user ID', () => {
    setAuthState(true, null);

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('allows an authenticated request with a user ID', () => {
    setAuthState(true, 'user_test_123');

    expect(guard.canActivate(context)).toBe(true);
  });
});
