export type PasswordAuthResult =
  | { status: 'email-required' }
  | { status: 'password-required' }
  | { status: 'code-required' }
  | { status: 'request-failed'; userMessage: string | null }
  | { status: 'verification-failed'; userMessage: string | null }
  | { status: 'signed-in' }
  | { status: 'signed-up' }
  | { status: 'additional-sign-up-info-required' }
  | { status: 'unsupported-verification' }
  | { status: 'incomplete' };

type ClerkOperationResult = {
  error: unknown | null;
};

type PasswordCredentials = {
  emailAddress: string;
  password: string;
};

export type PasswordSignInClient = {
  status: string;
  supportedSecondFactors?: Array<{ strategy: string }>;
  password: (credentials: PasswordCredentials) => Promise<ClerkOperationResult>;
  mfa: {
    sendEmailCode: () => Promise<ClerkOperationResult>;
    verifyEmailCode: (params: {
      code: string;
    }) => Promise<ClerkOperationResult>;
  };
  finalize: () => Promise<ClerkOperationResult>;
};

export type PasswordSignUpClient = {
  status: string;
  missingFields: string[];
  unverifiedFields: string[];
  password: (credentials: PasswordCredentials) => Promise<ClerkOperationResult>;
  verifications: {
    sendEmailCode: () => Promise<ClerkOperationResult>;
    verifyEmailCode: (params: {
      code: string;
    }) => Promise<ClerkOperationResult>;
  };
  finalize: () => Promise<ClerkOperationResult>;
};

function getClerkUserFacingErrorMessage(error: unknown): string | null {
  if (
    typeof error !== 'object' ||
    error === null ||
    !('clerkError' in error) ||
    error.clerkError !== true ||
    !('longMessage' in error) ||
    typeof error.longMessage !== 'string'
  ) {
    return null;
  }

  return error.longMessage.trim() || null;
}

function requestFailed(error: unknown): PasswordAuthResult {
  return {
    status: 'request-failed',
    userMessage: getClerkUserFacingErrorMessage(error),
  };
}

function verificationFailed(error: unknown): PasswordAuthResult {
  return {
    status: 'verification-failed',
    userMessage: getClerkUserFacingErrorMessage(error),
  };
}

async function finalizeSignIn(
  signIn: Pick<PasswordSignInClient, 'status' | 'finalize'>,
): Promise<PasswordAuthResult> {
  if (signIn.status !== 'complete') {
    return { status: 'incomplete' };
  }

  const { error } = await signIn.finalize();
  return error ? requestFailed(error) : { status: 'signed-in' };
}

async function finalizeSignUp(
  signUp: Pick<PasswordSignUpClient, 'status' | 'finalize'>,
): Promise<PasswordAuthResult> {
  if (signUp.status === 'missing_requirements') {
    return { status: 'additional-sign-up-info-required' };
  }

  if (signUp.status !== 'complete') {
    return { status: 'incomplete' };
  }

  const { error } = await signUp.finalize();
  return error ? requestFailed(error) : { status: 'signed-up' };
}

export async function signInWithPassword(
  signIn: PasswordSignInClient,
  emailAddress: string,
  password: string,
): Promise<PasswordAuthResult> {
  const identifier = emailAddress.trim();

  if (!identifier) {
    return { status: 'email-required' };
  }

  if (!password) {
    return { status: 'password-required' };
  }

  try {
    const { error } = await signIn.password({
      emailAddress: identifier,
      password,
    });

    if (error) {
      // Keep sign-in errors generic so this screen does not reveal whether an
      // email address has an account through different Clerk error messages.
      return { status: 'request-failed', userMessage: null };
    }

    if (signIn.status === 'complete') {
      return await finalizeSignIn(signIn);
    }

    if (
      signIn.status === 'needs_client_trust' ||
      signIn.status === 'needs_second_factor'
    ) {
      const hasEmailCode =
        signIn.supportedSecondFactors?.some(
          ({ strategy }) => strategy === 'email_code',
        ) ?? false;

      if (!hasEmailCode) {
        return { status: 'unsupported-verification' };
      }

      const { error: codeError } = await signIn.mfa.sendEmailCode();
      return codeError ? requestFailed(codeError) : { status: 'code-required' };
    }

    return { status: 'unsupported-verification' };
  } catch {
    // Sign-in failures stay generic to avoid exposing account and credential
    // details through differences in Clerk's error messages.
    return { status: 'request-failed', userMessage: null };
  }
}

export async function signUpWithPassword(
  signUp: PasswordSignUpClient,
  emailAddress: string,
  password: string,
): Promise<PasswordAuthResult> {
  const identifier = emailAddress.trim();

  if (!identifier) {
    return { status: 'email-required' };
  }

  if (!password) {
    return { status: 'password-required' };
  }

  try {
    const { error } = await signUp.password({
      emailAddress: identifier,
      password,
    });

    if (error) {
      return requestFailed(error);
    }

    if (signUp.unverifiedFields.includes('email_address')) {
      const { error: codeError } = await signUp.verifications.sendEmailCode();

      return codeError ? requestFailed(codeError) : { status: 'code-required' };
    }

    return await finalizeSignUp(signUp);
  } catch (error) {
    return requestFailed(error);
  }
}

export async function verifySignInEmailCode(
  signIn: PasswordSignInClient,
  code: string,
): Promise<PasswordAuthResult> {
  const verificationCode = code.trim();

  if (!verificationCode) {
    return { status: 'code-required' };
  }

  try {
    const { error } = await signIn.mfa.verifyEmailCode({
      code: verificationCode,
    });

    if (error) {
      return verificationFailed(error);
    }

    return await finalizeSignIn(signIn);
  } catch (error) {
    return verificationFailed(error);
  }
}

export async function verifySignUpEmailCode(
  signUp: PasswordSignUpClient,
  code: string,
): Promise<PasswordAuthResult> {
  const verificationCode = code.trim();

  if (!verificationCode) {
    return { status: 'code-required' };
  }

  try {
    const { error } = await signUp.verifications.verifyEmailCode({
      code: verificationCode,
    });

    if (error) {
      return verificationFailed(error);
    }

    return await finalizeSignUp(signUp);
  } catch (error) {
    return verificationFailed(error);
  }
}

export async function resendSignInEmailCode(
  signIn: Pick<PasswordSignInClient, 'mfa'>,
): Promise<PasswordAuthResult> {
  try {
    const { error } = await signIn.mfa.sendEmailCode();
    return error ? requestFailed(error) : { status: 'code-required' };
  } catch (error) {
    return requestFailed(error);
  }
}

export async function resendSignUpEmailCode(
  signUp: Pick<PasswordSignUpClient, 'verifications'>,
): Promise<PasswordAuthResult> {
  try {
    const { error } = await signUp.verifications.sendEmailCode();
    return error ? requestFailed(error) : { status: 'code-required' };
  } catch (error) {
    return requestFailed(error);
  }
}
