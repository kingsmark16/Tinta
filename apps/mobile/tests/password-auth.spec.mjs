import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  resendSignInEmailCode,
  resendSignUpEmailCode,
  signInWithPassword,
  signUpWithPassword,
  verifySignInEmailCode,
  verifySignUpEmailCode,
} from '../src/auth/password-auth.ts';

function createSignInClient({
  status = 'complete',
  supportedSecondFactors = [],
  passwordResult = { error: null },
  sendCodeResult = { error: null },
  verifyCodeResult = { error: null },
  finalizeResult = { error: null },
  passwordFailure,
  sendCodeFailure,
  verifyCodeFailure,
  finalizeFailure,
} = {}) {
  const calls = [];

  return {
    calls,
    signIn: {
      status,
      supportedSecondFactors,
      password: async (params) => {
        calls.push({ method: 'password', params });
        if (passwordFailure) throw passwordFailure;
        return passwordResult;
      },
      mfa: {
        sendEmailCode: async () => {
          calls.push({ method: 'sendEmailCode' });
          if (sendCodeFailure) throw sendCodeFailure;
          return sendCodeResult;
        },
        verifyEmailCode: async (params) => {
          calls.push({ method: 'verifyEmailCode', params });
          if (verifyCodeFailure) throw verifyCodeFailure;
          return verifyCodeResult;
        },
      },
      finalize: async () => {
        calls.push({ method: 'finalize' });
        if (finalizeFailure) throw finalizeFailure;
        return finalizeResult;
      },
    },
  };
}

function createSignUpClient({
  status = 'complete',
  missingFields = [],
  unverifiedFields = [],
  passwordResult = { error: null },
  sendCodeResult = { error: null },
  verifyCodeResult = { error: null },
  finalizeResult = { error: null },
  passwordFailure,
  sendCodeFailure,
  verifyCodeFailure,
  finalizeFailure,
} = {}) {
  const calls = [];

  return {
    calls,
    signUp: {
      status,
      missingFields,
      unverifiedFields,
      password: async (params) => {
        calls.push({ method: 'password', params });
        if (passwordFailure) throw passwordFailure;
        return passwordResult;
      },
      verifications: {
        sendEmailCode: async () => {
          calls.push({ method: 'sendEmailCode' });
          if (sendCodeFailure) throw sendCodeFailure;
          return sendCodeResult;
        },
        verifyEmailCode: async (params) => {
          calls.push({ method: 'verifyEmailCode', params });
          if (verifyCodeFailure) throw verifyCodeFailure;
          return verifyCodeResult;
        },
      },
      finalize: async () => {
        calls.push({ method: 'finalize' });
        if (finalizeFailure) throw finalizeFailure;
        return finalizeResult;
      },
    },
  };
}

test('requires a nonblank email without calling Clerk', async () => {
  const { calls, signIn } = createSignInClient();

  const result = await signInWithPassword(signIn, '  ', 'password');

  assert.deepEqual(result, { status: 'email-required' });
  assert.deepEqual(calls, []);
});

test('requires a password without calling Clerk', async () => {
  const { calls, signIn } = createSignInClient();

  const result = await signInWithPassword(signIn, 'reader@example.test', '');

  assert.deepEqual(result, { status: 'password-required' });
  assert.deepEqual(calls, []);
});

test('trims the email, preserves the password, and finalizes sign-in', async () => {
  const { calls, signIn } = createSignInClient();

  const result = await signInWithPassword(
    signIn,
    '  reader@example.test  ',
    ' pass with spaces ',
  );

  assert.deepEqual(result, { status: 'signed-in' });
  assert.deepEqual(calls, [
    {
      method: 'password',
      params: {
        emailAddress: 'reader@example.test',
        password: ' pass with spaces ',
      },
    },
    { method: 'finalize' },
  ]);
});

test('keeps returned sign-in errors generic to avoid exposing account details', async () => {
  const { calls, signIn } = createSignInClient({
    passwordResult: { error: new Error('private credential detail') },
  });

  const result = await signInWithPassword(
    signIn,
    'reader@example.test',
    'wrong-password',
  );

  assert.deepEqual(result, { status: 'request-failed', userMessage: null });
  assert.equal(calls.length, 1);
});

test('keeps thrown sign-in errors generic', async () => {
  const { calls, signIn } = createSignInClient({
    passwordFailure: new Error('private server detail'),
  });

  const result = await signInWithPassword(
    signIn,
    'reader@example.test',
    'wrong-password',
  );

  assert.deepEqual(result, { status: 'request-failed', userMessage: null });
  assert.equal(calls.length, 1);
});

test('requests an email code when sign-in requires device trust', async () => {
  const { calls, signIn } = createSignInClient({
    status: 'needs_client_trust',
    supportedSecondFactors: [{ strategy: 'email_code' }],
  });

  const result = await signInWithPassword(
    signIn,
    'reader@example.test',
    'correct-password',
  );

  assert.deepEqual(result, { status: 'code-required' });
  assert.deepEqual(
    calls.map(({ method }) => method),
    ['password', 'sendEmailCode'],
  );
});

test('requests an email code when email is a supported second factor', async () => {
  const { calls, signIn } = createSignInClient({
    status: 'needs_second_factor',
    supportedSecondFactors: [{ strategy: 'totp' }, { strategy: 'email_code' }],
  });

  const result = await signInWithPassword(
    signIn,
    'reader@example.test',
    'correct-password',
  );

  assert.deepEqual(result, { status: 'code-required' });
  assert.deepEqual(
    calls.map(({ method }) => method),
    ['password', 'sendEmailCode'],
  );
});

test('does not request an unsupported second factor', async () => {
  const { calls, signIn } = createSignInClient({
    status: 'needs_second_factor',
    supportedSecondFactors: [{ strategy: 'totp' }],
  });

  const result = await signInWithPassword(
    signIn,
    'reader@example.test',
    'correct-password',
  );

  assert.deepEqual(result, { status: 'unsupported-verification' });
  assert.deepEqual(
    calls.map(({ method }) => method),
    ['password'],
  );
});

test('requires signup email and password before calling Clerk', async () => {
  const { calls, signUp } = createSignUpClient();

  assert.deepEqual(
    await signUpWithPassword(signUp, 'reader@example.test', ''),
    { status: 'password-required' },
  );
  assert.deepEqual(await signUpWithPassword(signUp, ' ', 'password'), {
    status: 'email-required',
  });
  assert.deepEqual(calls, []);
});

test('creates an account with a password and sends email verification', async () => {
  const { calls, signUp } = createSignUpClient({
    status: 'missing_requirements',
    missingFields: ['password'],
    unverifiedFields: ['email_address'],
  });

  const result = await signUpWithPassword(
    signUp,
    '  reader@example.test  ',
    'new-password',
  );

  assert.deepEqual(result, { status: 'code-required' });
  assert.deepEqual(calls, [
    {
      method: 'password',
      params: {
        emailAddress: 'reader@example.test',
        password: 'new-password',
      },
    },
    { method: 'sendEmailCode' },
  ]);
});

test('finalizes signup when no email verification is required', async () => {
  const { calls, signUp } = createSignUpClient();

  const result = await signUpWithPassword(
    signUp,
    'reader@example.test',
    'new-password',
  );

  assert.deepEqual(result, { status: 'signed-up' });
  assert.deepEqual(
    calls.map(({ method }) => method),
    ['password', 'finalize'],
  );
});

test('reports other missing signup fields after password signup', async () => {
  const { calls, signUp } = createSignUpClient({
    status: 'missing_requirements',
    missingFields: ['first_name'],
  });

  const result = await signUpWithPassword(
    signUp,
    'reader@example.test',
    'new-password',
  );

  assert.deepEqual(result, { status: 'additional-sign-up-info-required' });
  assert.deepEqual(
    calls.map(({ method }) => method),
    ['password'],
  );
});

test("uses only Clerk's designated user-facing signup error", async () => {
  const error = Object.assign(new Error('developer details'), {
    clerkError: true,
    longMessage: 'Choose another password.',
  });
  const { calls, signUp } = createSignUpClient({
    passwordResult: { error },
  });

  const result = await signUpWithPassword(
    signUp,
    'reader@example.test',
    'weak-password',
  );

  assert.deepEqual(result, {
    status: 'request-failed',
    userMessage: 'Choose another password.',
  });
  assert.deepEqual(
    calls.map(({ method }) => method),
    ['password'],
  );
});

test('requires a nonblank sign-in verification code without calling Clerk', async () => {
  const { calls, signIn } = createSignInClient();

  const result = await verifySignInEmailCode(signIn, '   ');

  assert.deepEqual(result, { status: 'code-required' });
  assert.deepEqual(calls, []);
});

test('trims an MFA code and finalizes the sign-in', async () => {
  const { calls, signIn } = createSignInClient();

  const result = await verifySignInEmailCode(signIn, '  123456  ');

  assert.deepEqual(result, { status: 'signed-in' });
  assert.deepEqual(calls, [
    { method: 'verifyEmailCode', params: { code: '123456' } },
    { method: 'finalize' },
  ]);
});

test('returns a safe verification message for a rejected email code', async () => {
  const { calls, signIn } = createSignInClient({
    verifyCodeResult: {
      error: {
        clerkError: true,
        longMessage: 'That code is incorrect.',
        message: 'internal verification detail',
      },
    },
  });

  const result = await verifySignInEmailCode(signIn, '000000');

  assert.deepEqual(result, {
    status: 'verification-failed',
    userMessage: 'That code is incorrect.',
  });
  assert.equal(calls.length, 1);
});

test('verifies signup email, then finalizes the new account', async () => {
  const { calls, signUp } = createSignUpClient();

  const result = await verifySignUpEmailCode(signUp, '  123456  ');

  assert.deepEqual(result, { status: 'signed-up' });
  assert.deepEqual(calls, [
    { method: 'verifyEmailCode', params: { code: '123456' } },
    { method: 'finalize' },
  ]);
});

test('does not finalize signup while profile fields are missing', async () => {
  const { calls, signUp } = createSignUpClient({
    status: 'missing_requirements',
    missingFields: ['first_name', 'last_name'],
  });

  const result = await verifySignUpEmailCode(signUp, '123456');

  assert.deepEqual(result, { status: 'additional-sign-up-info-required' });
  assert.deepEqual(calls, [
    { method: 'verifyEmailCode', params: { code: '123456' } },
  ]);
});

test('resends the current sign-in email code', async () => {
  const { calls, signIn } = createSignInClient();

  const result = await resendSignInEmailCode(signIn);

  assert.deepEqual(result, { status: 'code-required' });
  assert.deepEqual(calls, [{ method: 'sendEmailCode' }]);
});

test('resends the current signup email code', async () => {
  const { calls, signUp } = createSignUpClient();

  const result = await resendSignUpEmailCode(signUp);

  assert.deepEqual(result, { status: 'code-required' });
  assert.deepEqual(calls, [{ method: 'sendEmailCode' }]);
});

test('does not expose a raw thrown signup error', async () => {
  const { signUp } = createSignUpClient({
    passwordFailure: new Error('private Clerk internals'),
  });

  const result = await signUpWithPassword(
    signUp,
    'reader@example.test',
    'new-password',
  );

  assert.deepEqual(result, { status: 'request-failed', userMessage: null });
});
