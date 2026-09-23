# Project Status

## Current Phase

The pnpm workspace, Expo mobile starter, and NestJS API starter are scaffolded. The mobile starter was verified on web, and the API started and passed its generated Vitest HTTP test. The first Tinta domain rule, a standalone API validator for `entryDate`, is implemented and unit-tested. Entry HTTP routes, authentication, and persistence remain planned.

## Current Goal

Design the protected `POST /entries` slice, including request validation, verified ownership, and the date-only persistence representation.

## Completed

- Created and reviewed `AGENTS.md`.
- Created `README.md` and the initial learning workflow, architecture, local development, testing, deployment, security, and decision documents in `docs/`.
- The user created the root `package.json`, `pnpm-workspace.yaml`, and `.gitignore`.
- The user scaffolded `apps/mobile` with Expo SDK 57, Expo Router, and TypeScript, then installed workspace dependencies from the repository root.
- The user scaffolded `apps/api` with NestJS 12, ESM, TypeScript, and Vitest, then installed dependencies for all three workspace projects from the repository root.
- Updated the local development and testing guides for the verified baseline, and recorded the ESM/Vitest choice. Agreed on the initial create-entry request, response, and diary-day rules.
- Reconciled the original brief into product, architecture, security, development, testing, deployment, learning, decision, and Git/CI guidance. The later Vitest choice supersedes the original Jest plan.
- The user committed the scaffold and documentation as `16446df` (`chore: scaffold Tinta workspace`) and pushed it to `origin/main`.
- The user added a pure `entryDate` validator for exact `YYYY-MM-DD` calendar dates and 11 focused Vitest cases, including leap-year and invalid-input cases.
- Changed the generated API HTTP test to use the Node HTTP server type for TypeScript checking. The user configured Prettier to preserve existing line-ending styles and formatted the three files reported by the check.
- Opened [PR #1](https://github.com/kingsmark16/Tinta/pull/1), `feat(entries): validate diary dates`, from `feat/entry-date-validation` into `main` for review.

## In Progress

- Work is on the `feat/entry-date-validation` branch. The standalone date validator is not connected to an HTTP route. Authentication and persistence have not been implemented, and CI has not been configured.

## Next

- Review [PR #1](https://github.com/kingsmark16/Tinta/pull/1) before merging it into `main`. The PR is open; no merge has been performed.
- Plan authentication and ownership enforcement for `POST /entries`, and choose the database representation of date-only `entryDate` before implementing persistence.
- Reconcile the generated API's Oxlint setup with the original ESLint direction before settling the future CI lint gate.

## Blockers

- None known.

## Important Decisions

- The user is the developer; the AI agent is an engineering mentor. The agent may read and search relevant repository files with read-only commands and has standing authorization to maintain relevant Markdown documentation automatically. Other file edits and non-read-only commands require a direct request; the user normally commits and pushes.
- Tinta is a private digital diary. Privacy and server-side ownership checks are core requirements.
- The pnpm workspace contains the Expo mobile starter and NestJS 12 API starter. The user chose ESM and Vitest for the API.
- The original brief names ESLint and Prettier. The API scaffold uses Oxlint and Prettier; both its current lint command and a non-writing format check have passed locally. The ESLint versus Oxlint choice and CI configuration remain open.
- The planned create-entry contract requires nonblank content, a valid date-only `entryDate`, and verified ownership. Multiple entries may share one diary day.
- Clerk, Prisma, and PostgreSQL remain planned and are not yet implemented.

## Latest Verification

- `AGENTS.md` was read and reviewed after creation.
- `package.json`, `pnpm-workspace.yaml`, and `.gitignore` were read and match the proposed initial content.
- The user ran `pnpm install` after each scaffold; the latest install completed for all three workspace projects. Slow registry requests and deprecated transitive dependencies were reported, with no install failure.
- The user ran `pnpm --filter mobile run web`; Expo bundled and the starter Home screen rendered at `localhost:8081`.
- The user ran `pnpm --filter mobile exec tsc --noEmit`; it completed with no diagnostics.
- The user ran the API in watch mode; TypeScript reported 0 errors, Nest started, and it mapped `GET /`. The later pnpm exit error followed the user's termination of watch mode.
- The user ran `pnpm --filter api run test:e2e` before the type-only edit to that test file; Vitest passed the generated test for `GET /`, asserting HTTP 200 and `Hello World!`. It has not been rerun after the edit.
- The user's push output confirmed baseline commit `16446df` on GitHub's `main` and validator commit `ccd8cb0` on `origin/feat/entry-date-validation`. The user also pushed documentation commit `bc03eff`. GitHub PR #1 is open against `main` with those two feature-branch commits and 11 changed files; GitHub reported it as mergeable. No GitHub Actions workflow exists yet.
- The user ran the focused `entryDate` Vitest file: 11 tests passed. The full API unit suite passed 2 files and 12 tests, including the generated controller test.
- The user ran `pnpm --filter api exec tsc --noEmit` after the generated HTTP test's type fix; it completed without diagnostics.
- The user ran `pnpm --filter api run lint`; Oxlint reported 0 warnings and 0 errors across 8 files. After setting Prettier's `endOfLine` to `auto` and formatting three files, the non-writing API TypeScript format check reported that all matched files use Prettier style.
- Android, iOS, a production API build, and Tinta-specific HTTP, authentication, and persistence behavior have not been verified.
