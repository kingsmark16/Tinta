export type CurrentUser = {
  userId: string;
};

type FetchCurrentUserOptions = {
  apiBaseUrl: string | undefined;
  getToken: () => Promise<string | null | undefined>;
  fetchImplementation?: typeof fetch;
};

export async function fetchCurrentUser({
  apiBaseUrl,
  getToken,
  fetchImplementation = fetch,
}: FetchCurrentUserOptions): Promise<CurrentUser> {
  const normalizedApiBaseUrl = apiBaseUrl?.trim().replace(/\/+$/, '');

  if (!normalizedApiBaseUrl) {
    throw new Error('Tinta API URL is not configured.');
  }

  let token: string | null | undefined;

  try {
    token = await getToken();
  } catch {
    throw new Error(
      'Could not retrieve your Tinta session. Please sign in again.',
    );
  }

  if (!token?.trim()) {
    throw new Error('Please sign in to connect to Tinta.');
  }

  let response: Response;

  try {
    response = await fetchImplementation(`${normalizedApiBaseUrl}/auth/me`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token.trim()}`,
      },
    });
  } catch {
    throw new Error('Could not reach the Tinta API. Check that it is running.');
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(
        'Your session could not be verified. Please sign in again.',
      );
    }

    throw new Error('The Tinta API could not complete the request.');
  }

  let responseBody: unknown;

  try {
    responseBody = await response.json();
  } catch {
    throw new Error('The Tinta API returned an unexpected response.');
  }

  if (typeof responseBody !== 'object' || responseBody === null) {
    throw new Error('The Tinta API returned an unexpected response.');
  }

  const userId = 'userId' in responseBody ? responseBody.userId : undefined;

  if (typeof userId !== 'string' || !userId.trim()) {
    throw new Error('The Tinta API returned an unexpected response.');
  }

  return { userId };
}
