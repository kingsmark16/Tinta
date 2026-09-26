export type MissingSignUpUpdateParams = {
  firstName?: string;
  lastName?: string;
  username?: string;
};

export type MissingSignUpRequirementsResult =
  | { status: 'fields-required' }
  | { status: 'unsupported-requirements' }
  | { status: 'request-failed'; userMessage: string | null }
  | { status: 'additional-requirements-remain' }
  | { status: 'signed-up' };

export type MissingSignUpRequirementsValues = {
  firstName: string;
  lastName: string;
  username: string;
};

type ClerkOperationResult = {
  error: unknown | null;
};

export type MissingSignUpRequirementsClient = {
  status: string;
  missingFields: string[];
  update: (params: MissingSignUpUpdateParams) => Promise<ClerkOperationResult>;
  finalize: () => Promise<ClerkOperationResult>;
};

const supportedFields = new Set(['first_name', 'last_name', 'username']);

function getSignUpStatus(
  signUp: Pick<MissingSignUpRequirementsClient, 'status'>,
) {
  return signUp.status;
}

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

function requestFailed(error: unknown): MissingSignUpRequirementsResult {
  return {
    status: 'request-failed',
    userMessage: getClerkUserFacingErrorMessage(error),
  };
}

export async function completeMissingSignUpRequirements(
  signUp: MissingSignUpRequirementsClient,
  values: MissingSignUpRequirementsValues,
): Promise<MissingSignUpRequirementsResult> {
  if (
    signUp.status !== 'missing_requirements' ||
    signUp.missingFields.length === 0 ||
    signUp.missingFields.some((field) => !supportedFields.has(field))
  ) {
    return { status: 'unsupported-requirements' };
  }

  const params: MissingSignUpUpdateParams = {};

  for (const field of signUp.missingFields) {
    switch (field) {
      case 'first_name':
        if (!values.firstName.trim()) {
          return { status: 'fields-required' };
        }

        params.firstName = values.firstName.trim();
        break;
      case 'last_name':
        if (!values.lastName.trim()) {
          return { status: 'fields-required' };
        }

        params.lastName = values.lastName.trim();
        break;
      case 'username':
        if (!values.username.trim()) {
          return { status: 'fields-required' };
        }

        params.username = values.username.trim();
        break;
      default:
        return { status: 'unsupported-requirements' };
    }
  }

  try {
    const { error: updateError } = await signUp.update(params);

    if (updateError) {
      return requestFailed(updateError);
    }

    if (getSignUpStatus(signUp) !== 'complete') {
      return { status: 'additional-requirements-remain' };
    }

    const { error: finalizeError } = await signUp.finalize();
    return finalizeError
      ? requestFailed(finalizeError)
      : { status: 'signed-up' };
  } catch (error) {
    return requestFailed(error);
  }
}
