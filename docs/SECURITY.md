# Security and Privacy

Tinta stores sensitive diary entries. These are requirements for the planned application, not a claim that controls are implemented.

## Identity and ownership

- Clerk handles sign-up, sign-in, sessions, and tokens. The API verifies Clerk tokens on every protected request; decoding a token alone is insufficient.
- Derive ownership from the verified identity on the server. Never authorize access using a client-supplied user ID.
- Scope every user-owned read, list, update, and delete operation to its owner. Prevent cross-user tag use as well as cross-user entry access.
- Avoid revealing another user's resource or its contents through errors, search results, or calendar results.

## Private data and secrets

- Never log diary content, tokens, authorization headers, passwords, secret keys, or sensitive personal text. Apply the same restriction to traces, analytics, crash reports, and monitoring.
- Keep server secrets out of the repository and mobile bundle. Use environment-specific secret storage; rotate secrets if exposed.
- Use HTTPS for remote traffic. Restrict database access, use separate environment credentials, and protect backups.
- Review any device-side persistence or caching of entries before adding offline support. Store credentials using platform-supported secure storage.

## API safeguards

- Validate requests on the server. Configure CORS for the actual clients and deployment environment; do not use a broad origin policy by default.
- Set appropriate rate limits and request-size limits for exposed endpoints.
- If file uploads are added later, validate file type and size, control access, and review storage and scanning requirements before release.

## Future AI features

AI is outside the MVP. If added later, it must be optional, disclose external transmission of diary content, and minimize the content sent. Never silently send journal data to a model provider.

## Verification

Security-sensitive changes need tests for missing and invalid authentication, cross-user access, and ownership changes. Review logs and error responses using synthetic entries to confirm private content is absent. Record only checks actually run and any remaining risks in `PROJECT_STATUS.md`.
