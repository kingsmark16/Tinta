# Testing

This is Tinta's testing plan. The NestJS API uses Vitest. The pure `entryDate` validator has 11 passing unit cases, and the generated controller unit test has also passed. The generated API HTTP test passed after its type-only edit. No Tinta entry HTTP route exists yet.

## Test levels

- **Unit tests:** Check focused domain rules, validation, and date handling without network or database dependencies.
- **API HTTP tests:** Start a Nest application in the test process and send requests through its HTTP server. The generated test currently checks only the starter `GET /` response.
- **API integration tests:** Exercise routes, guards, services, and Prisma against a separate PostgreSQL test database. Run committed migrations there; never point tests at development, staging, or production data.
- **Mobile tests:** Check important screen states and user flows, including sign-in, loading, empty results, errors, and entry creation or editing when implemented.
- **End-to-end and manual checks:** Verify the mobile-to-API flow on a device or emulator with synthetic data and separate test accounts.

## Ownership and authentication cases

For each protected user-owned resource, test that:

- User A can perform valid actions on their own resource.
- Missing, invalid, or expired authentication is rejected.
- Invalid input is rejected without storing data.
- User A cannot read, find in a list, change, or delete User B's resource.
- A client-supplied user ID cannot change ownership.

Also cover important domain rules, search/filter/pagination behavior when added, calendar date boundaries, and regressions for fixed bugs. In particular, verify that a diary day remains unchanged across time zones and reject impossible dates. Do not weaken tests merely to make them pass.

## Conventions

- Name tests by behavior and expected result. The API scaffold uses `*.spec.ts` for its unit test and `*.e2e-spec.ts` for its API HTTP test. Follow these conventions unless a clearer one is established.
- Keep test fixtures synthetic. Never include real diary content, live tokens, or secrets in fixtures, screenshots, or CI output.
- Mock external services at meaningful boundaries. Use a real test database for persistence and ownership integration tests rather than mocking Prisma queries that the test is meant to verify.
- Make tests independent and clean up their own data. Keep test accounts and database configuration separate from other environments.

## Running and reporting

Run the commands below in PowerShell from the repository root, `C:\Users\marka\Desktop\Tinta`, with workspace dependencies installed. Vitest may write local cache files.

| Command | Purpose and expected behavior | Observed result |
| --- | --- | --- |
| `pnpm --filter api exec vitest run src/entries/entry-date.spec.ts` | Runs the pure date validator cases without a server or database; success means the focused test file passes and exits with code 0. | 11 tests passed, covering valid dates, leap-year boundaries, impossible dates, exact format, and non-string input. |
| `pnpm --filter api run test` | Runs all API unit tests without a server or database; success means each discovered unit test passes and exits with code 0. | 2 files and 12 tests passed, including the generated controller test and the date validator tests. |
| `pnpm --filter api run test:e2e` | Starts and closes Nest inside the test process and sends an HTTP request; a separate running API or database is not required for the starter test. Success means the HTTP test passes and exits with code 0. | One generated `GET /` test passed after the type-only edit; it checks HTTP 200 and `Hello World!`. |

The date unit tests verify the standalone validator, not an entry route or storage across time zones. Authentication, ownership, persistence, database integration, and mobile-to-API behavior remain unverified. Record new results and unresolved gaps in `PROJECT_STATUS.md`; never describe an unrun or failing check as passed.

Add each test class to CI only after its equivalent local command passes. Database integration tests need an isolated test database, committed migrations, synthetic fixtures, and cleanup. See [GIT_WORKFLOW.md](GIT_WORKFLOW.md) for the planned checks; no CI workflow exists yet.
