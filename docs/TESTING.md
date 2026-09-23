# Testing

This is Tinta's testing plan. The NestJS API scaffold has Vitest configured. Its generated API HTTP test has passed; a generated unit test exists but has not been run. No Tinta feature tests exist yet.

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

From the repository root in PowerShell, with workspace dependencies installed, run `pnpm --filter api run test:e2e` to execute the generated API HTTP test. The command starts and closes Nest inside the test process, so this starter test does not require a separately running API or database. Vitest may write local cache files.

The user's run passed one test: `GET /` returned HTTP 200 and `Hello World!`. A successful rerun should report the test as passed and exit normally. This result does not verify authentication, persistence, or a mobile-to-API flow. The generated unit test, future integration tests, and mobile tests remain unverified. Record new results and unresolved gaps in `PROJECT_STATUS.md`; never describe an unrun or failing check as passed.

Add each test class to CI only after its equivalent local command passes. Database integration tests need an isolated test database, committed migrations, synthetic fixtures, and cleanup. See [GIT_WORKFLOW.md](GIT_WORKFLOW.md) for the planned checks; no CI workflow exists yet.
