import assert from 'node:assert/strict';
import { test } from 'node:test';

import { completeMissingSignUpRequirements } from '../src/auth/complete-missing-sign-up-requirements.ts';

const values = {
  firstName: 'Ava',
  lastName: 'Reader',
  username: 'ava-reader',
};

function createSignUpClient({
  missingFields = ['first_name', 'last_name'],
  status = 'missing_requirements',
  statusAfterUpdate = 'complete',
  updateResult = { error: null },
  finalizeResult = { error: null },
  updateFailure,
  finalizeFailure,
} = {}) {
  const calls = [];
  const signUp = {
    missingFields,
    status,
    update: async (params) => {
      calls.push({ method: 'update', params });

      if (updateFailure) {
        throw updateFailure;
      }

      signUp.status = statusAfterUpdate;
      return { ...updateResult, status: statusAfterUpdate };
    },
    finalize: async () => {
      calls.push({ method: 'finalize' });

      if (finalizeFailure) {
        throw finalizeFailure;
      }

      return finalizeResult;
    },
  };

  return { calls, signUp };
}

test('requires every missing text field before calling Clerk', async () => {
  const { calls, signUp } = createSignUpClient();

  const result = await completeMissingSignUpRequirements(signUp, {
    ...values,
    firstName: '  ',
  });

  assert.deepEqual(result, { status: 'fields-required' });
  assert.deepEqual(calls, []);
});

test('trims required names, updates sign-up, and finalizes it', async () => {
  const { calls, signUp } = createSignUpClient();

  const result = await completeMissingSignUpRequirements(signUp, {
    ...values,
    firstName: '  Ava  ',
    lastName: '  Reader  ',
  });

  assert.deepEqual(result, { status: 'signed-up' });
  assert.deepEqual(calls, [
    {
      method: 'update',
      params: { firstName: 'Ava', lastName: 'Reader' },
    },
    { method: 'finalize' },
  ]);
});

test('does not try to update a password requirement unsupported by this flow', async () => {
  const { calls, signUp } = createSignUpClient({
    missingFields: ['password'],
  });

  const result = await completeMissingSignUpRequirements(signUp, values);

  assert.deepEqual(result, { status: 'unsupported-requirements' });
  assert.deepEqual(calls, []);
});

test('does not attempt account creation for unsupported requirements', async () => {
  const { calls, signUp } = createSignUpClient({
    missingFields: ['legal_accepted'],
  });

  const result = await completeMissingSignUpRequirements(signUp, values);

  assert.deepEqual(result, { status: 'unsupported-requirements' });
  assert.deepEqual(calls, []);
});

test('does not update a sign-up outside the missing requirements state', async () => {
  const { calls, signUp } = createSignUpClient({ status: 'complete' });

  const result = await completeMissingSignUpRequirements(signUp, values);

  assert.deepEqual(result, { status: 'unsupported-requirements' });
  assert.deepEqual(calls, []);
});

test("shows Clerk's user-facing update error without finalizing", async () => {
  const error = {
    clerkError: true,
    longMessage: 'Choose a stronger password.',
    message: 'Developer-only details must not be displayed.',
  };
  const { calls, signUp } = createSignUpClient({
    updateResult: { error },
  });

  const result = await completeMissingSignUpRequirements(signUp, values);

  assert.deepEqual(result, {
    status: 'request-failed',
    userMessage: 'Choose a stronger password.',
  });
  assert.deepEqual(calls, [
    {
      method: 'update',
      params: { firstName: 'Ava', lastName: 'Reader' },
    },
  ]);
});

test('reports when Clerk still has required fields after update', async () => {
  const { calls, signUp } = createSignUpClient({
    statusAfterUpdate: 'missing_requirements',
  });

  const result = await completeMissingSignUpRequirements(signUp, values);

  assert.deepEqual(result, { status: 'additional-requirements-remain' });
  assert.deepEqual(calls, [
    {
      method: 'update',
      params: { firstName: 'Ava', lastName: 'Reader' },
    },
  ]);
});

test("shows Clerk's user-facing finalization error", async () => {
  const { calls, signUp } = createSignUpClient({
    finalizeResult: {
      error: {
        clerkError: true,
        longMessage: 'Please try signing in again.',
        message: 'Developer-only details must not be displayed.',
      },
    },
  });

  const result = await completeMissingSignUpRequirements(signUp, values);

  assert.deepEqual(result, {
    status: 'request-failed',
    userMessage: 'Please try signing in again.',
  });
  assert.deepEqual(calls, [
    {
      method: 'update',
      params: { firstName: 'Ava', lastName: 'Reader' },
    },
    { method: 'finalize' },
  ]);
});

test("does not expose a generic returned error's private message", async () => {
  const { calls, signUp } = createSignUpClient({
    updateResult: { error: new Error('Private internal error details') },
  });

  const result = await completeMissingSignUpRequirements(signUp, values);

  assert.deepEqual(result, { status: 'request-failed', userMessage: null });
  assert.deepEqual(calls, [
    {
      method: 'update',
      params: { firstName: 'Ava', lastName: 'Reader' },
    },
  ]);
});

test("does not expose a thrown generic error's private message", async () => {
  const { calls, signUp } = createSignUpClient({
    updateFailure: new Error('private Clerk error details'),
  });

  const result = await completeMissingSignUpRequirements(signUp, values);

  assert.deepEqual(result, { status: 'request-failed', userMessage: null });
  assert.deepEqual(calls, [
    {
      method: 'update',
      params: { firstName: 'Ava', lastName: 'Reader' },
    },
  ]);
});

test("uses a thrown Clerk error's user-facing message", async () => {
  const error = Object.assign(new Error('Developer-only details'), {
    clerkError: true,
    longMessage: 'Try a different password.',
  });
  const { signUp } = createSignUpClient({ updateFailure: error });

  const result = await completeMissingSignUpRequirements(signUp, values);

  assert.deepEqual(result, {
    status: 'request-failed',
    userMessage: 'Try a different password.',
  });
});

test('ignores blank Clerk long messages and does not fall back to message', async () => {
  const error = {
    clerkError: true,
    longMessage: '   ',
    message: 'Developer-only details must not be displayed.',
  };
  const { signUp } = createSignUpClient({ updateResult: { error } });

  const result = await completeMissingSignUpRequirements(signUp, values);

  assert.deepEqual(result, { status: 'request-failed', userMessage: null });
});
