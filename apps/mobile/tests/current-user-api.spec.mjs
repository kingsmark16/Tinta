import assert from 'node:assert/strict';
import { test } from 'node:test';

import { fetchCurrentUser } from '../src/api/current-user.ts';

function createResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}

test('gets the current user with a Clerk bearer token', async () => {
  let tokenCalls = 0;
  let request;

  const currentUser = await fetchCurrentUser({
    apiBaseUrl: ' http://localhost:3010/// ',
    getToken: async () => {
      tokenCalls += 1;
      return 'synthetic-session-token';
    },
    fetchImplementation: async (url, options) => {
      request = { url, options };
      return createResponse({ userId: 'user_test123' });
    },
  });

  assert.equal(tokenCalls, 1);
  assert.equal(request.url, 'http://localhost:3010/auth/me');
  assert.equal(request.options.method, 'GET');
  assert.equal(
    request.options.headers.Authorization,
    'Bearer synthetic-session-token',
  );
  assert.equal(request.options.headers.Accept, 'application/json');
  assert.deepEqual(currentUser, { userId: 'user_test123' });
});

test('requires a configured API URL before retrieving a token', async () => {
  let tokenCalls = 0;

  await assert.rejects(
    fetchCurrentUser({
      apiBaseUrl: '   ',
      getToken: async () => {
        tokenCalls += 1;
        return 'synthetic-session-token';
      },
      fetchImplementation: async () =>
        createResponse({ userId: 'user_test123' }),
    }),
    { message: 'Tinta API URL is not configured.' },
  );

  assert.equal(tokenCalls, 0);
});

test('does not call the API when Clerk has no session token', async () => {
  let fetchCalls = 0;

  await assert.rejects(
    fetchCurrentUser({
      apiBaseUrl: 'http://localhost:3010',
      getToken: async () => null,
      fetchImplementation: async () => {
        fetchCalls += 1;
        return createResponse({ userId: 'user_test123' });
      },
    }),
    { message: 'Please sign in to connect to Tinta.' },
  );

  assert.equal(fetchCalls, 0);
});

test('does not expose Clerk token retrieval errors', async () => {
  await assert.rejects(
    fetchCurrentUser({
      apiBaseUrl: 'http://localhost:3010',
      getToken: async () => {
        throw new Error('private token diagnostic');
      },
      fetchImplementation: async () =>
        createResponse({ userId: 'user_test123' }),
    }),
    (error) => {
      assert.equal(
        error.message,
        'Could not retrieve your Tinta session. Please sign in again.',
      );
      assert.equal(error.message.includes('private token diagnostic'), false);
      return true;
    },
  );
});

test('uses a generic message when the API rejects the session', async () => {
  await assert.rejects(
    fetchCurrentUser({
      apiBaseUrl: 'http://localhost:3010',
      getToken: async () => 'synthetic-session-token',
      fetchImplementation: async () =>
        createResponse({ message: 'private server details' }, 401),
    }),
    (error) => {
      assert.equal(
        error.message,
        'Your session could not be verified. Please sign in again.',
      );
      assert.equal(error.message.includes('private server details'), false);
      assert.equal(error.message.includes('synthetic-session-token'), false);
      return true;
    },
  );
});

test('does not expose network error details', async () => {
  await assert.rejects(
    fetchCurrentUser({
      apiBaseUrl: 'http://localhost:3010',
      getToken: async () => 'synthetic-session-token',
      fetchImplementation: async () => {
        throw new Error('private network diagnostic');
      },
    }),
    (error) => {
      assert.equal(
        error.message,
        'Could not reach the Tinta API. Check that it is running.',
      );
      assert.equal(error.message.includes('private network diagnostic'), false);
      return true;
    },
  );
});

test('rejects a successful API response without a user ID', async () => {
  await assert.rejects(
    fetchCurrentUser({
      apiBaseUrl: 'http://localhost:3010',
      getToken: async () => 'synthetic-session-token',
      fetchImplementation: async () => createResponse({ ok: true }),
    }),
    { message: 'The Tinta API returned an unexpected response.' },
  );
});
