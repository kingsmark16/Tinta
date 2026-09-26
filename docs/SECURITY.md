# Security and Privacy

Tinta stores sensitive diary entries. These are requirements for the planned application, not a claim that controls are implemented.

## Identity and ownership

- Clerk handles sign-up, sign-in, sessions, and tokens. The API verifies Clerk tokens on every protected request; decoding a token alone is insufficient.
- The current API auth slice mounts Clerk middleware and protects `GET /auth/me` with a guard that requires a verified user ID. The route returns only that ID. The signed-in Home screen now retrieves a Clerk session token and sends it to the route through the API helper; 7 helper tests passed. The real Expo-to-API response has not yet been verified. This route does not protect diary resources.
- Expo Router now waits for Clerk to load, exposes the sign-in route while signed out, and protects the app tabs while signed in. This is client-side navigation control only; the API must continue to verify every protected request.
- Clerk's Native API is enabled for the Tinta Development instance. Clerk notes that native requests use a public pathway that bypasses browser-based CAPTCHA challenges; review its bot-protection guidance before production rollout.
- The current mobile flow uses separate email-and-password sign-in and sign-up attempts. Keep Clerk's **Sign-in with password** and **Sign-up with password** enabled. New sign-ups verify the email address with a code; sign-ins may request an email code for supported second-factor or device-trust challenges.
- Separate sign-in and sign-up screens can make account-existence differences visible during account creation. The app keeps sign-in failures generic. Review Clerk's user-enumeration protection and rate limits before production, and avoid returning raw provider or server errors to the user.
- Clerk's Native API is enabled for the Tinta Development instance. The user reports successful account creation and authentication with the current password flow, which confirms the development setup works for that flow. Production Clerk configuration remains unverified.
- Derive ownership from the verified identity on the server. Never authorize access using a client-supplied user ID.
- Scope every user-owned read, list, update, and delete operation to its owner. Prevent cross-user tag use as well as cross-user entry access.
- Avoid revealing another user's resource or its contents through errors, search results, or calendar results.

## Private data and secrets

- Never log diary content, tokens, authorization headers, passwords, secret keys, or sensitive personal text. Apply the same restriction to traces, analytics, crash reports, and monitoring.
- Keep server secrets out of the repository and mobile bundle. Use environment-specific secret storage; rotate secrets if exposed.
- Use HTTPS for remote traffic. Restrict database access, use separate environment credentials, and protect backups.
- Review any device-side persistence or caching of entries before adding offline support. Store credentials using platform-supported secure storage.

## API safeguards

- Validate requests on the server. Configure CORS for the actual clients and deployment environment; do not use a broad origin policy by default. The API now allows only `http://localhost:8081` by default, with `EXPO_WEB_ORIGIN` as the deployment override. The policy permits `GET` and `OPTIONS` with `Authorization` and `Content-Type` headers; all 3 CORS e2e tests passed. This only controls browser cross-origin access; Clerk still verifies authentication, and a valid signed-in Expo request has not yet been verified.
- Set appropriate rate limits and request-size limits for exposed endpoints.
- If file uploads are added later, validate file type and size, control access, and review storage and scanning requirements before release.

## Future AI features

AI is outside the MVP. If added later, it must be optional, disclose external transmission of diary content, and minimize the content sent. Never silently send journal data to a model provider.

## Verification

Security-sensitive changes need tests for missing and invalid authentication, cross-user access, and ownership changes. Review logs and error responses using synthetic entries to confirm private content is absent. Record only checks actually run and any remaining risks in `PROJECT_STATUS.md`.
