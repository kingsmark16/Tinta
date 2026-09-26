export type AuthRouteState = 'loading' | 'signedOut' | 'signedIn';

export function getAuthRouteState(
  isLoaded: boolean,
  isSignedIn: boolean | undefined,
): AuthRouteState {
  if (!isLoaded) {
    return 'loading';
  }

  return isSignedIn === true ? 'signedIn' : 'signedOut';
}
