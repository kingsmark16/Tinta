import assert from 'node:assert/strict';
import { test } from 'node:test';

import { getAuthRouteState } from '../src/auth/auth-route-state.ts';

test('keeps routes undecided while Clerk is loading', () => {
  assert.equal(getAuthRouteState(false, undefined), 'loading');
  assert.equal(getAuthRouteState(false, true), 'loading');
});

test('allows only the sign-in route after Clerk loads without a session', () => {
  assert.equal(getAuthRouteState(true, false), 'signedOut');
});

test('fails closed when Clerk is loaded without a signed-in value', () => {
  assert.equal(getAuthRouteState(true, undefined), 'signedOut');
});

test('allows only the app route after Clerk loads with a session', () => {
  assert.equal(getAuthRouteState(true, true), 'signedIn');
});
